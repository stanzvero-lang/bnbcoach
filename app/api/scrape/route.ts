import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeAirbnbListing } from "@/lib/apify";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: "Scraping non ancora configurato. Configura APIFY_API_TOKEN nelle variabili d'ambiente." },
        { status: 503 }
      );
    }


    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url || !url.includes("airbnb")) {
      return NextResponse.json({ error: "URL Airbnb non valido" }, { status: 400 });
    }

    const data = await scrapeAirbnbListing(url);

    if (!data) {
      return NextResponse.json(
        { error: "Impossibile recuperare i dati del listing" },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Errore durante lo scraping. Riprova." },
      { status: 500 }
    );
  }
}
