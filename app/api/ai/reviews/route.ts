import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";

const NOT_CONFIGURED = NextResponse.json(
  { error: "Servizio non ancora configurato. Configura le API key nelle variabili d'ambiente." },
  { status: 503 }
);

export async function POST(request: NextRequest) {
  try {
    const anthropic = getAnthropic();
    if (!anthropic) return NOT_CONFIGURED;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { review, tone } = await request.json();

    if (!review || !tone) {
      return NextResponse.json(
        { error: "Recensione e tono sono obbligatori" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Genera una risposta professionale alla seguente recensione Airbnb.

Recensione dell'ospite:
"${review}"

Tono richiesto: ${tone}

Regole:
- Rispondi in italiano
- Ringrazia l'ospite
- Se la recensione è positiva, esprimi gratitudine e invita a tornare
- Se la recensione è negativa, scusati sinceramente e spiega come migliorerai
- Mantieni il tono ${tone}
- Massimo 150 parole
- Non usare emoji eccessivi

Rispondi solo con il testo della risposta, senza JSON.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({ response: content.text });
  } catch (error) {
    console.error("Reviews error:", error);
    return NextResponse.json(
      { error: "Errore durante la generazione. Riprova." },
      { status: 500 }
    );
  }
}
