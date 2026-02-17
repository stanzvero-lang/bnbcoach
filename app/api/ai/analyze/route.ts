import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";
import { scrapeAirbnbListing } from "@/lib/apify";
import { getMockListingData, type ListingData } from "@/lib/mock-listing";

// Extract JSON from a string that may contain markdown code fences or extra text
function extractJSON(text: string): string {
  // Try to find JSON in code fences first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try to find a JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  return text.trim();
}

function buildPrompt(listing: ListingData, profile: { property_type?: string; location_city?: string; guest_target?: string[] } | null): string {
  let prompt = `Sei un esperto di ottimizzazione annunci Airbnb con anni di esperienza nel mercato italiano. Analizza questo listing e fornisci una valutazione dettagliata.

## Dati del listing

- **Titolo**: "${listing.title}"
- **Tipo**: ${listing.propertyType}
- **Posizione**: ${listing.location.area}, ${listing.location.city}, ${listing.location.country}
- **Prezzo**: €${listing.price.amount}/${listing.price.period}
- **Numero foto**: ${listing.photoCount}
- **Didascalie foto**: ${listing.photoCaptions.filter(Boolean).length} su ${listing.photoCount} con didascalia
- **Rating**: ${listing.rating}/5 (${listing.reviewCount} recensioni)
- **Host**: ${listing.host.name} ${listing.host.superhost ? "(Superhost)" : ""} - Tasso risposta: ${listing.host.responseRate}
- **Capacità**: ${listing.guests} ospiti, ${listing.bedrooms} camere, ${listing.beds} letti, ${listing.bathrooms} bagni

### Descrizione
${listing.description}

### Amenities
${listing.amenities.join(", ")}

### Campione recensioni
${listing.reviewSample.map((r) => `- "${r}"`).join("\n")}`;

  if (profile) {
    prompt += `\n\n## Profilo host
- Tipo proprietà dichiarato: ${profile.property_type || "non specificato"}
- Città: ${profile.location_city || "non specificata"}
- Target ospiti: ${profile.guest_target?.join(", ") || "non specificato"}`;
  }

  prompt += `\n\n## Criteri di valutazione

### Titolo (0-100)
Valuta: lunghezza (ideale 40-60 char), keyword rilevanti, appeal emotivo, unicità, SEO Airbnb.

### Foto (0-100)
Valuta: numero (ideale 20+, ottimo 30+), presenza didascalie, varietà stanze coperte. Penalizza pesantemente se ci sono meno di 10 foto.

### Descrizione (0-100)
Valuta: completezza (spazio, zona, trasporti, esperienze), struttura (paragrafi, emoji, leggibilità mobile), SEO, call-to-action, tono.

### Amenities (0-100)
Valuta: essenziali (WiFi, cucina, lavatrice, AC), comfort (TV, ferro, asciugacapelli), extra (parcheggio, check-in autonomo), competitività zona.

### Prezzo (0-100)
Valuta: competitività mercato locale, value perception data la qualità dell'annuncio.

## Output

Rispondi ESCLUSIVAMENTE con un JSON valido. Nessun testo prima o dopo, nessun markdown code block.

{
  "overall_score": <0-100>,
  "title_score": <0-100>,
  "title_review": "<commento 1-2 frasi>",
  "photos_score": <0-100>,
  "photos_review": "<commento 1-2 frasi>",
  "description_score": <0-100>,
  "description_review": "<commento 1-2 frasi>",
  "amenities_score": <0-100>,
  "amenities_review": "<commento 1-2 frasi>",
  "pricing_score": <0-100>,
  "pricing_review": "<commento 1-2 frasi>",
  "tips": ["<consiglio 1>", "<consiglio 2>", "<consiglio 3>", "<consiglio 4>", "<consiglio 5>"]
}

overall_score = media pesata: titolo 20%, foto 25%, descrizione 20%, amenities 15%, prezzo 20%.
Consigli: specifici, azionabili, ordinati per impatto. Scrivi in italiano.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const anthropic = getAnthropic();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Check free tier limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("analyses_used, subscription_tier, property_type, location_city, guest_target")
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

    // Get listing data: try Apify first, fall back to mock data
    let listingData: ListingData | null = null;
    let usingMock = false;

    if (process.env.APIFY_API_TOKEN) {
      const scraped = await scrapeAirbnbListing(url);
      if (scraped) {
        // Normalize Apify response to our ListingData shape
        listingData = {
          url,
          title: scraped.name || scraped.title || "",
          description: scraped.description || "",
          photoCount: scraped.photos?.length || 0,
          photoCaptions: (scraped.photos || []).map((p: { caption?: string }) => p.caption || ""),
          amenities: scraped.amenities || [],
          price: {
            amount: scraped.price?.rate || scraped.pricing?.rate?.amount || 0,
            currency: "EUR",
            period: "notte",
          },
          rating: scraped.rating || scraped.stars || 0,
          reviewCount: scraped.reviewsCount || scraped.numberOfReviews || 0,
          reviewSample: (scraped.reviews || []).slice(0, 4).map((r: { comments?: string }) => r.comments || ""),
          propertyType: scraped.roomType || scraped.propertyType || "",
          location: {
            city: scraped.city || scraped.address?.city || "",
            area: scraped.neighborhood || scraped.address?.neighborhood || "",
            country: scraped.country || "Italia",
          },
          host: {
            name: scraped.host?.name || "",
            superhost: scraped.host?.isSuperhost || false,
            responseRate: scraped.host?.responseRate || "N/A",
          },
          guests: scraped.personCapacity || scraped.guestCount || 0,
          bedrooms: scraped.bedroomCount || scraped.bedrooms || 0,
          beds: scraped.bedCount || scraped.beds || 0,
          bathrooms: scraped.bathroomCount || scraped.bathrooms || 0,
        };
      }
    }

    if (!listingData) {
      listingData = getMockListingData(url);
      usingMock = true;
    }

    // Build prompt with profile context
    const prompt = buildPrompt(listingData, profile);

    // Analyze with Claude
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Robust JSON extraction
    const jsonStr = extractJSON(content.text);
    const analysis = JSON.parse(jsonStr);

    // Validate required fields
    if (typeof analysis.overall_score !== "number" || !Array.isArray(analysis.tips)) {
      throw new Error("Invalid analysis response structure");
    }

    // Save to database (best-effort, don't fail if DB is not set up)
    try {
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
    } catch (dbError) {
      // Log but don't fail the request if DB write fails
      console.error("DB save error (non-fatal):", dbError);
    }

    return NextResponse.json({
      ...analysis,
      listing_summary: {
        title: listingData.title,
        location: `${listingData.location.area}, ${listingData.location.city}`,
        price: `€${listingData.price.amount}/${listingData.price.period}`,
        rating: listingData.rating,
        reviewCount: listingData.reviewCount,
        photoCount: listingData.photoCount,
        propertyType: listingData.propertyType,
      },
      using_mock: usingMock,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return NextResponse.json(
      { error: `Errore durante l'analisi: ${message}` },
      { status: 500 }
    );
  }
}
