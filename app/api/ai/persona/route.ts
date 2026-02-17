import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, AI_MODEL } from "@/lib/anthropic";

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Basandoti sul profilo di questo host Airbnb, crea 3 guest persona dettagliate.

Profilo host:
- Tipo proprietà: ${profile?.property_type || "non specificato"}
- Città: ${profile?.location_city || "non specificata"}
- Zona: ${profile?.location_area || "non specificata"}
- Target ospiti: ${profile?.guest_target?.join(", ") || "non specificato"}

Rispondi in formato JSON:
{
  "personas": [
    {
      "name": "nome tipo persona",
      "description": "descrizione breve",
      "needs": ["bisogno 1", "bisogno 2"],
      "expectations": ["aspettativa 1", "aspettativa 2"],
      "tips": ["consiglio per attrarre questo tipo di ospite"]
    }
  ]
}

Scrivi in italiano.`,
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
    console.error("Persona error:", error);
    return NextResponse.json(
      { error: "Errore durante la generazione. Riprova." },
      { status: 500 }
    );
  }
}
