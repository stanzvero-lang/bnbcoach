import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, AI_MODEL } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const formData = await request.formData();
    const photos = formData.getAll("photos") as File[];

    if (photos.length === 0) {
      return NextResponse.json({ error: "Nessuna foto caricata" }, { status: 400 });
    }

    if (photos.length > 10) {
      return NextResponse.json({ error: "Massimo 10 foto" }, { status: 400 });
    }

    const analyses = [];

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mediaType = photo.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

      const message = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: `Analizza questa foto di un alloggio Airbnb. Rispondi in formato JSON:

{
  "room_type": "tipo stanza (es. Soggiorno, Camera, Bagno, Cucina, Esterno)",
  "score": <numero 1-10>,
  "positives": ["cosa va bene 1", "cosa va bene 2"],
  "improvements": ["cosa migliorare 1", "cosa migliorare 2"],
  "reshoot_instructions": "istruzioni specifiche per rifare la foto meglio (ora del giorno, angolazione, cosa spostare, etc.)"
}

Scrivi in italiano. Sii specifico e pratico nei consigli.`,
              },
            ],
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        analyses.push(JSON.parse(content.text));
      }
    }

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Photos error:", error);
    return NextResponse.json(
      { error: "Errore durante l'analisi delle foto. Riprova." },
      { status: 500 }
    );
  }
}
