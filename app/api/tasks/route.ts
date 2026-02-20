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

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split("T")[0];
}

// GET /api/tasks — fetch tasks for the current user
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const weekFilter = searchParams.get("week") || getWeekStart();
    const showAll = searchParams.get("all") === "true";

    const admin = getAdmin();

    let query = admin
      .from("tasks")
      .select("id, title, description, instructions, category, impact, estimated_minutes, tool_link, level, completed, completed_at, week_start, sort_order, created_at")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });

    if (!showAll) {
      query = query.eq("week_start", weekFilter);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error("Tasks fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    // Fetch streak from profile
    const { data: profile } = await admin
      .from("profiles")
      .select("streak_weeks, last_task_completed_at")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      tasks: tasks || [],
      streak: profile?.streak_weeks ?? 0,
      weekStart: weekFilter,
    });
  } catch (err) {
    console.error("Tasks GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks — toggle task completion
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const { task_id, completed } = body;

    if (!task_id || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "task_id and completed (boolean) are required" },
        { status: 400 }
      );
    }

    const admin = getAdmin();

    // Verify task belongs to user
    const { data: task } = await admin
      .from("tasks")
      .select("id, user_id, week_start")
      .eq("id", task_id)
      .eq("user_id", user.id)
      .single();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update task
    const updateData: Record<string, unknown> = {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    };

    const { error: updateErr } = await admin
      .from("tasks")
      .update(updateData)
      .eq("id", task_id);

    if (updateErr) {
      console.error("Task update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    // Check if all tasks for this week are now completed
    const { data: weekTasks } = await admin
      .from("tasks")
      .select("id, completed")
      .eq("user_id", user.id)
      .eq("week_start", task.week_start);

    const allCompleted =
      weekTasks &&
      weekTasks.length > 0 &&
      weekTasks.every((t) =>
        t.id === task_id ? completed : t.completed
      );

    // If all completed, update streak
    if (allCompleted && completed) {
      const { data: profile } = await admin
        .from("profiles")
        .select("streak_weeks, last_task_completed_at")
        .eq("id", user.id)
        .single();

      const currentStreak = profile?.streak_weeks ?? 0;
      const lastCompleted = profile?.last_task_completed_at
        ? new Date(profile.last_task_completed_at)
        : null;

      // Check if last completion was within the last 2 weeks (continuity)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const isConsecutive = lastCompleted && lastCompleted >= twoWeeksAgo;

      const newStreak = isConsecutive ? currentStreak + 1 : 1;

      await admin
        .from("profiles")
        .update({
          streak_weeks: newStreak,
          last_task_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Check streak-based badges
      if (newStreak >= 4) {
        admin.from("achievements").upsert(
          { user_id: user.id, badge_key: "streak_4" },
          { onConflict: "user_id,badge_key" }
        ).then(({ error: e }) => { if (e) console.error("Badge streak_4 error:", e); });
      }
      if (newStreak >= 8) {
        admin.from("achievements").upsert(
          { user_id: user.id, badge_key: "streak_8" },
          { onConflict: "user_id,badge_key" }
        ).then(({ error: e }) => { if (e) console.error("Badge streak_8 error:", e); });
      }
    }

    // Update last_task_completed_at even for individual completions
    if (completed) {
      await admin
        .from("profiles")
        .update({
          last_task_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Check task_master badge (20+ completed tasks total)
      const { count: totalCompleted } = await admin
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);

      if (totalCompleted && totalCompleted >= 20) {
        admin.from("achievements").upsert(
          { user_id: user.id, badge_key: "task_master" },
          { onConflict: "user_id,badge_key" }
        ).then(({ error: e }) => { if (e) console.error("Badge task_master error:", e); });
      }
    }

    return NextResponse.json({
      success: true,
      all_completed: allCompleted && completed,
    });
  } catch (err) {
    console.error("Tasks PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
