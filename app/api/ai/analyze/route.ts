import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";
import { scrapeAirbnbListing } from "@/lib/apify";

function notConfigured() {
  return NextResponse.json(
    { error: "Servizio non ancora configurato. Configura le API key nelle variabili d'ambiente." },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const anthropic = getAnthropic();
    if (!anthropic) return notConfigured();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Check free tier limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("analyses_used, subscription_tier")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_tier === "free" && (profile?.analyses_used ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Hai raggiunto il limite di 3 analisi gratuite. Passa a Pro per analisi illimitate." },
        { status: 403 }
      );
    }

    const { url } = await request.json();

    if (!url || !url.includes("airbnb")) {
      return NextResponse.json(
        { error: "URL Airbnb non valido" },
        { status: 400 }
      );
    }

    // Scrape listing data
    const listingData = await scrapeAirbnbListing(url);

    if (!listingData) {
      return NextResponse.json(
        { error: "Impossibile recuperare i dati del listing" },
        { status: 400 }
      );
    }

    // Analyze with Claude
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Analizza questo listing Airbnb e fornisci un punteggio dettagliato.

Dati del listing:
${JSON.stringify(listingData, null, 2)}

Rispondi in formato JSON con questa struttura:
{
  "overall_score": <numero 0-100>,
  "title_score": <numero 0-100>,
  "photos_score": <numero 0-100>,
  "amenities_score": <numero 0-100>,
  "description_score": <numero 0-100>,
  "pricing_score": <numero 0-100>,
  "tips": ["consiglio 1", "consiglio 2", "consiglio 3", "consiglio 4", "consiglio 5"]
}

I 5 consigli devono essere specifici, azionabili e ordinati per impatto. Scrivi in italiano.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const analysis = JSON.parse(content.text);

    // Save to database
    await supabase.from("listings").insert({
      user_id: user.id,
      airbnb_url: url,
      raw_data: listingData,
      analysis,
      overall_score: analysis.overall_score,
      title_score: analysis.title_score,
      photos_score: analysis.photos_score,
      amenities_score: analysis.amenities_score,
      description_score: analysis.description_score,
      pricing_score: analysis.pricing_score,
    });

    // Increment analyses_used
    await supabase
      .from("profiles")
      .update({ analyses_used: (profile?.analyses_used ?? 0) + 1 })
      .eq("id", user.id);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Errore durante l'analisi. Riprova." },
      { status: 500 }
    );
  }
}
