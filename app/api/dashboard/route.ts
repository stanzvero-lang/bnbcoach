import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch primary listing
    const { data: listing } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .limit(1)
      .single();

    // Fetch last 2 analyses for trend (if listing exists)
    let analyses: { overall_score: number; created_at: string }[] = [];
    if (listing) {
      const { data: analysisRows } = await supabase
        .from("analyses")
        .select("overall_score, created_at")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false })
        .limit(2);
      analyses = analysisRows || [];
    }

    // Fetch incomplete tasks count for this week
    const weekStart = getWeekStart();
    const { count: totalTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("week_start", weekStart);

    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("week_start", weekStart);

    // Compute trend
    const currentScore = analyses[0]?.overall_score ?? null;
    const previousScore = analyses[1]?.overall_score ?? null;
    const trend =
      currentScore !== null && previousScore !== null
        ? currentScore - previousScore
        : null;

    // Compute level
    const level = profile?.level || "starter";

    return NextResponse.json({
      profile: {
        name: profile?.name || "",
        level,
        has_listing: profile?.has_listing ?? false,
        subscription_tier: profile?.subscription_tier || "free",
        streak_weeks: profile?.streak_weeks ?? 0,
      },
      listing: listing
        ? {
            id: listing.id,
            name: listing.listing_name || "",
            url: listing.airbnb_url,
            score: listing.current_score,
            rating: listing.listing_rating,
            reviews_count: listing.listing_reviews_count,
            photo_count: listing.listing_photo_count,
          }
        : null,
      score: currentScore,
      trend,
      lastAnalysisDate: analyses[0]?.created_at ?? null,
      tasks: {
        total: totalTasks ?? 0,
        completed: completedTasks ?? 0,
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}
