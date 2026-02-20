import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const { url, listingData, analysis } = body;

    if (!url || !analysis) {
      return NextResponse.json(
        { error: "url and analysis are required" },
        { status: 400 }
      );
    }

    const admin = getAdmin();

    // 1. Upsert listing (one row per URL per user)
    const listingRow = {
      user_id: user.id,
      airbnb_url: url,
      listing_name: listingData?.title || analysis?.listing_summary?.title || "",
      is_primary: true,
      raw_data: listingData || null,
      current_score: analysis.overall_score ?? 0,
      listing_price: listingData?.price?.amount ?? null,
      listing_currency: listingData?.price?.currency || "EUR",
      listing_rating: listingData?.rating ?? analysis?.listing_summary?.rating ?? null,
      listing_reviews_count:
        listingData?.reviewCount ?? analysis?.listing_summary?.reviewCount ?? null,
      listing_photo_count:
        listingData?.photoCount ?? analysis?.listing_summary?.photoCount ?? null,
      listing_bedrooms: listingData?.bedrooms ?? null,
      listing_beds: listingData?.beds ?? null,
      listing_bathrooms: listingData?.bathrooms ?? null,
      listing_amenities: listingData?.amenities ?? null,
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try to find existing listing for this URL
    const { data: existing } = await admin
      .from("listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("airbnb_url", url)
      .limit(1)
      .single();

    let listingId: string;

    if (existing) {
      // Update existing
      await admin
        .from("listings")
        .update(listingRow)
        .eq("id", existing.id);
      listingId = existing.id;
    } else {
      // Insert new
      const { data: inserted, error: insertErr } = await admin
        .from("listings")
        .insert(listingRow)
        .select("id")
        .single();

      if (insertErr || !inserted) {
        console.error("Listing insert error:", insertErr);
        return NextResponse.json(
          { error: "Failed to save listing", details: insertErr },
          { status: 500 }
        );
      }
      listingId = inserted.id;
    }

    // 2. Insert analysis row
    const analysisRow = {
      listing_id: listingId,
      user_id: user.id,
      overall_score: analysis.overall_score ?? 0,
      title_score: analysis.title_score ?? 0,
      photos_score: analysis.photos_score ?? 0,
      description_score: analysis.description_score ?? 0,
      amenities_score: analysis.amenities_score ?? 0,
      pricing_score: analysis.pricing_score ?? 0,
      analysis_data: analysis,
      tips: analysis.tips || [],
    };

    const { data: savedAnalysis, error: analysisErr } = await admin
      .from("analyses")
      .insert(analysisRow)
      .select("id, created_at")
      .single();

    if (analysisErr) {
      console.error("Analysis insert error:", analysisErr);
      return NextResponse.json(
        { error: "Failed to save analysis", details: analysisErr },
        { status: 500 }
      );
    }

    // 3. Update profile level based on score
    const score = analysis.overall_score ?? 0;
    const level = score >= 70 ? "thriving" : score >= 40 ? "growing" : "starter";

    await admin
      .from("profiles")
      .update({ level, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    // 4. Unlock "first_analysis" achievement (idempotent — ignores if already unlocked)
    admin
      .from("achievements")
      .upsert(
        { user_id: user.id, badge_key: "first_analysis" },
        { onConflict: "user_id,badge_key" }
      )
      .then(({ error: badgeErr }) => {
        if (badgeErr) console.error("Badge unlock error:", badgeErr);
      });

    // 5. Check for score-based achievements
    if (score >= 60) {
      admin
        .from("achievements")
        .upsert(
          { user_id: user.id, badge_key: "score_60" },
          { onConflict: "user_id,badge_key" }
        )
        .then(({ error: e }) => { if (e) console.error("Badge score_60 error:", e); });
    }
    if (score >= 80) {
      admin
        .from("achievements")
        .upsert(
          { user_id: user.id, badge_key: "score_80" },
          { onConflict: "user_id,badge_key" }
        )
        .then(({ error: e }) => { if (e) console.error("Badge score_80 error:", e); });
    }

    // 6. Check "analyst" badge (3+ analyses)
    const { count: analysisCount } = await admin
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (analysisCount && analysisCount >= 3) {
      admin
        .from("achievements")
        .upsert(
          { user_id: user.id, badge_key: "analyst" },
          { onConflict: "user_id,badge_key" }
        )
        .then(({ error: e }) => { if (e) console.error("Badge analyst error:", e); });
    }

    // 7. Trigger task generation in background (non-blocking)
    // We use the internal API URL pattern to keep it simple
    const analysisId = savedAnalysis?.id;
    if (analysisId) {
      generateTasksBackground(user.id, analysisId, listingId, analysis, level, admin).catch(
        (err) => console.error("Background task generation error:", err)
      );
    }

    return NextResponse.json({
      success: true,
      listing_id: listingId,
      analysis_id: savedAnalysis?.id,
      created_at: savedAnalysis?.created_at,
    });
  } catch (err) {
    console.error("Save analysis route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Background task generation — calls Claude to generate tasks, saves to DB
async function generateTasksBackground(
  userId: string,
  analysisId: string,
  listingId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis: any,
  level: string,
  admin: SupabaseClient
) {
  // Fetch profile for context
  const { data: profile } = await admin
    .from("profiles")
    .select("property_type, location_city, guest_target, improvement_budget")
    .eq("id", userId)
    .single();

  // Fetch existing completed tasks to avoid duplicates
  const { data: existingTasks } = await admin
    .from("tasks")
    .select("title")
    .eq("user_id", userId)
    .eq("completed", true)
    .limit(20);

  const completedTaskTitles = (existingTasks || []).map((t) => t.title).join(", ");

  const scores = {
    overall: analysis.overall_score ?? 0,
    title: analysis.title_score ?? 0,
    photos: analysis.photos_score ?? 0,
    description: analysis.description_score ?? 0,
    amenities: analysis.amenities_score ?? 0,
    pricing: analysis.pricing_score ?? 0,
  };

  const tips = Array.isArray(analysis.tips) ? analysis.tips : [];

  const prompt = `Sei BnBCoach, un AI coach per host Airbnb. Genera 3-5 task settimanali specifici e azionabili per migliorare l'annuncio.

CONTESTO UTENTE:
- Livello: ${level}
- Tipo proprietà: ${profile?.property_type || "non specificato"}
- Città: ${profile?.location_city || "non specificata"}
- Target ospiti: ${(profile?.guest_target || []).join(", ") || "non specificato"}
- Budget: ${profile?.improvement_budget || "non specificato"}

PUNTEGGI ANALISI (0-100):
- Complessivo: ${scores.overall}
- Titolo: ${scores.title}
- Foto: ${scores.photos}
- Descrizione: ${scores.description}
- Amenities: ${scores.amenities}
- Prezzo: ${scores.pricing}

CONSIGLI DALL'ANALISI:
${tips.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

TASK GIÀ COMPLETATI (evita duplicati):
${completedTaskTitles || "Nessuno"}

REGOLE:
- Genera tra 3 e 5 task
- Concentrati sulle aree con punteggio più basso
- Ogni task deve essere concreto e completabile in una settimana
- Adatta il linguaggio al livello (${level === "starter" ? "semplice, incoraggiante" : level === "growing" ? "tecnico, orientato ai risultati" : "professionale, ottimizzazione fine"})

STRUMENTI DISPONIBILI (tool_link):
- /titles — Generatore titoli e descrizioni
- /photos — Photo Coach AI
- /description — Costruttore sezioni descrizione
- /amenities — Amenity Gap Finder
- /reviews — Generatore risposte recensioni
- /pricing-coach — Coach prezzo
- /seo — SEO Checker
- /analyze — Rianalizza listing

RISPONDI SOLO in JSON valido, senza commenti o markdown. Formato:
[
  {
    "title": "Titolo breve del task",
    "description": "Descrizione di 1-2 frasi",
    "instructions": "Step 1: ... Step 2: ... Step 3: ...",
    "category": "titolo|foto|descrizione|amenities|pricing|seo|reviews|altro",
    "impact": "alto|medio|basso",
    "estimated_minutes": 15,
    "tool_link": "/titles",
    "sort_order": 1
  }
]`;

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return;

  let rawText = textBlock.text.trim();
  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let tasks: Array<{
    title: string;
    description: string;
    instructions: string;
    category: string;
    impact: string;
    estimated_minutes: number;
    tool_link: string;
    sort_order: number;
  }>;

  try {
    tasks = JSON.parse(rawText);
  } catch {
    console.error("Failed to parse AI tasks:", rawText);
    return;
  }

  if (!Array.isArray(tasks) || tasks.length === 0) return;

  // Calculate week start (Monday)
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  const weekStart = monday.toISOString().split("T")[0];

  // Delete existing uncompleted tasks for this week (regenerate)
  await admin
    .from("tasks")
    .delete()
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .eq("completed", false);

  const taskRows = tasks.slice(0, 5).map((t, idx) => ({
    user_id: userId,
    listing_id: listingId,
    analysis_id: analysisId,
    title: t.title,
    description: t.description || "",
    instructions: t.instructions || "",
    category: t.category || "altro",
    impact: t.impact || "medio",
    estimated_minutes: t.estimated_minutes || 15,
    tool_link: t.tool_link || null,
    level,
    completed: false,
    week_start: weekStart,
    sort_order: t.sort_order ?? idx + 1,
  }));

  const { error: saveErr } = await admin
    .from("tasks")
    .insert(taskRows);

  if (saveErr) {
    console.error("Background task save error:", saveErr);
  }
}
