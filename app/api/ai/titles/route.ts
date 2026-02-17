import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";

const NOT_CONFIGURED = NextResponse.json(
  { error: "Servizio non ancora configurato. Configura le API key nelle variabili d'ambiente." },
  { status: 503 }
);

export async function POST() {
  try {
    const anthropic = getAnthropic();
    if (!anthropic) return NOT_CONFIGURED;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Get user profile and latest listing
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: listing } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Genera 5 varianti di titolo e 5 varianti di descrizione per un annuncio Airbnb.

Profilo host:
- Tipo proprietà: ${profile?.property_type || "non specificato"}
- Città: ${profile?.location_city || "non specificata"}
- Zona: ${profile?.location_area || "non specificata"}
- Target ospiti: ${profile?.guest_target?.join(", ") || "non specificato"}

${listing ? `Dati listing attuale: ${JSON.stringify(listing.raw_data)}` : "Nessun listing analizzato."}

Rispondi in formato JSON:
{
  "titles": [
    {"text": "titolo", "seo_score": 8, "keywords": ["keyword1", "keyword2"], "tone": "luxury|cozy|modern|professional|fun"}
  ],
  "descriptions": [
    {"text": "descrizione completa", "seo_score": 8, "keywords": ["keyword1", "keyword2"], "tone": "luxury|cozy|modern|professional|fun"}
  ]
}

Scrivi in italiano. Ogni variante deve avere un tono diverso.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = JSON.parse(content.text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Titles error:", error);
    return NextResponse.json(
      { error: "Errore durante la generazione. Riprova." },
      { status: 500 }
    );
  }
}
