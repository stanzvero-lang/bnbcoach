import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split("T")[0];
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
    const { analysis_id, listing_id } = body;

    if (!analysis_id || !listing_id) {
      return NextResponse.json(
        { error: "analysis_id and listing_id are required" },
        { status: 400 }
      );
    }

    const admin = getAdmin();

    // Fetch analysis data
    const { data: analysis, error: analysisErr } = await admin
      .from("analyses")
      .select("*")
      .eq("id", analysis_id)
      .eq("user_id", user.id)
      .single();

    if (analysisErr || !analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Fetch profile for context
    const { data: profile } = await admin
      .from("profiles")
      .select("level, property_type, location_city, guest_target, improvement_budget")
      .eq("id", user.id)
      .single();

    // Fetch existing completed tasks to avoid duplicates
    const { data: existingTasks } = await admin
      .from("tasks")
      .select("title, category")
      .eq("user_id", user.id)
      .eq("completed", true)
      .limit(20);

    const completedTaskTitles = (existingTasks || []).map((t) => t.title).join(", ");

    // Build Claude prompt
    const level = profile?.level || "starter";
    const scores = {
      overall: analysis.overall_score ?? 0,
      title: analysis.title_score ?? 0,
      photos: analysis.photos_score ?? 0,
      description: analysis.description_score ?? 0,
      amenities: analysis.amenities_score ?? 0,
      pricing: analysis.pricing_score ?? 0,
    };

    const tips = analysis.tips || [];

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
- Per ogni task indica un link allo strumento BnBCoach da usare

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

    // Extract text from response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AI did not return text" },
        { status: 500 }
      );
    }

    // Parse JSON from response (handle possible markdown wrapping)
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
      console.error("Failed to parse AI tasks response:", rawText);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "AI returned empty tasks" },
        { status: 500 }
      );
    }

    // Save tasks to DB
    const weekStart = getWeekStart();
    const taskRows = tasks.slice(0, 5).map((t, idx) => ({
      user_id: user.id,
      listing_id,
      analysis_id,
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

    const { data: savedTasks, error: saveErr } = await admin
      .from("tasks")
      .insert(taskRows)
      .select("id, title, description, instructions, category, impact, estimated_minutes, tool_link, sort_order, completed");

    if (saveErr) {
      console.error("Task save error:", saveErr);
      return NextResponse.json(
        { error: "Failed to save tasks", details: saveErr },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tasks: savedTasks,
      count: savedTasks?.length ?? 0,
    });
  } catch (err) {
    console.error("AI tasks route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
