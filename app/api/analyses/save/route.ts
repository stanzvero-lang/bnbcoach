import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

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
