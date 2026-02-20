import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { ALL_BADGES } from "@/lib/badges";

export const dynamic = "force-dynamic";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/achievements — fetch user achievements with all badge metadata
export async function GET() {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const admin = getAdmin();

    const { data: unlocked } = await admin
      .from("achievements")
      .select("badge_key, unlocked_at")
      .eq("user_id", user.id);

    const unlockedMap = new Map(
      (unlocked || []).map((a) => [a.badge_key, a.unlocked_at])
    );

    const badges = ALL_BADGES.map((badge) => ({
      ...badge,
      unlocked: unlockedMap.has(badge.key),
      unlocked_at: unlockedMap.get(badge.key) || null,
    }));

    return NextResponse.json({
      badges,
      unlocked_count: unlockedMap.size,
      total_count: ALL_BADGES.length,
    });
  } catch (err) {
    console.error("Achievements GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/achievements — unlock a specific badge
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
    const { badge_key } = body;

    if (!badge_key) {
      return NextResponse.json(
        { error: "badge_key is required" },
        { status: 400 }
      );
    }

    // Validate badge key exists
    const validBadge = ALL_BADGES.find((b) => b.key === badge_key);
    if (!validBadge) {
      return NextResponse.json(
        { error: "Invalid badge_key" },
        { status: 400 }
      );
    }

    const admin = getAdmin();

    // Check if already unlocked
    const { data: existing } = await admin
      .from("achievements")
      .select("id")
      .eq("user_id", user.id)
      .eq("badge_key", badge_key)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        already_unlocked: true,
        badge: validBadge,
      });
    }

    // Insert new achievement
    const { error: insertErr } = await admin
      .from("achievements")
      .insert({
        user_id: user.id,
        badge_key,
      });

    if (insertErr) {
      console.error("Achievement insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to unlock badge", details: insertErr },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      already_unlocked: false,
      badge: validBadge,
    });
  } catch (err) {
    console.error("Achievements POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
