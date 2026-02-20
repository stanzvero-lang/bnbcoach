"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, CheckSquare, Clock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  impact: "alto" | "medio" | "basso";
  estimated_minutes: number;
  tool_link: string | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

const IMPACT_CONFIG = {
  alto: { label: "ALTO", variant: "destructive" as const, color: "text-error" },
  medio: { label: "MEDIO", variant: "warning" as const, color: "text-warning" },
  basso: { label: "BASSO", variant: "secondary" as const, color: "text-text-secondary" },
};

const CATEGORY_EMOJI: Record<string, string> = {
  titolo: "✍️",
  foto: "📸",
  descrizione: "📝",
  amenities: "🛋️",
  pricing: "💰",
  seo: "🔍",
  reviews: "⭐",
  altro: "📋",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setStreak(data.streak ?? 0);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function toggleTask(taskId: string, currentCompleted: boolean) {
    const newCompleted = !currentCompleted;
    setTogglingId(taskId);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : t
      )
    );

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, completed: newCompleted }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.all_completed && newCompleted) {
          setShowConfetti(true);
          setStreak((s) => s + 1);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      } else {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, completed: currentCompleted } : t
          )
        );
      }
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: currentCompleted } : t
        )
      );
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-[80px] w-full rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confetti overlay */}
      {showConfetti && <ConfettiOverlay />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Task Settimanali</h1>
        <p className="text-text-secondary text-sm mt-1">
          Migliora il tuo annuncio un passo alla volta
        </p>
      </div>

      {/* Streak & Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                streak > 0 ? "bg-primary/10" : "bg-surface"
              )}>
                <Flame className={cn("h-4 w-4", streak > 0 ? "text-primary" : "text-text-secondary")} />
              </div>
              <div>
                <span className="font-bold text-sm">
                  {streak > 0
                    ? `${streak} ${streak === 1 ? "settimana" : "settimane"} consecutive`
                    : "Inizia la tua streak!"}
                </span>
                {streak >= 4 && (
                  <span className="text-xs text-primary ml-1">🔥</span>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalCount}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {completedCount === totalCount && totalCount > 0 && (
            <p className="text-xs text-success font-medium mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Tutti completati! Ottimo lavoro!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Empty state */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center mb-4">
              <CheckSquare className="h-8 w-8 text-text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Nessun task disponibile</h3>
            <p className="text-sm text-text-secondary mb-4">
              Analizza il tuo listing per ricevere task personalizzati basati sul tuo punteggio
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition"
            >
              Analizza il listing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const impact = IMPACT_CONFIG[task.impact] || IMPACT_CONFIG.medio;
            const emoji = CATEGORY_EMOJI[task.category] || CATEGORY_EMOJI.altro;
            const isExpanded = expandedId === task.id;
            const isToggling = togglingId === task.id;

            return (
              <Card
                key={task.id}
                className={cn(
                  "transition-all duration-300",
                  task.completed && "opacity-70"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Animated checkbox */}
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      disabled={isToggling}
                      className={cn(
                        "mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                        task.completed
                          ? "bg-success border-success scale-110"
                          : "border-border hover:border-primary hover:scale-105",
                        isToggling && "opacity-50"
                      )}
                    >
                      <svg
                        className={cn(
                          "w-3.5 h-3.5 text-white transition-all duration-300",
                          task.completed ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm">{emoji}</span>
                        <span
                          className={cn(
                            "font-medium text-sm transition-all duration-300",
                            task.completed && "line-through text-text-secondary"
                          )}
                        >
                          {task.title}
                        </span>
                        <Badge variant={impact.variant} className="text-[10px] px-1.5 py-0">
                          {impact.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-text-secondary flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_minutes} min
                        </span>

                        {task.instructions && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : task.id)}
                            className="text-[11px] text-primary font-medium"
                          >
                            {isExpanded ? "Nascondi istruzioni" : "Mostra istruzioni"}
                          </button>
                        )}

                        {task.tool_link && !task.completed && (
                          <Link
                            href={task.tool_link}
                            className="text-[11px] text-primary font-medium flex items-center gap-0.5 ml-auto"
                          >
                            Apri strumento
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      {/* Expanded instructions */}
                      {isExpanded && task.instructions && (
                        <div className="mt-3 p-3 bg-surface rounded-lg text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                          {task.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Simple confetti animation using CSS
function ConfettiOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-sm"
            style={{
              backgroundColor: [
                "#FF385C", "#8B5CF6", "#06B6D4", "#10B981",
                "#F59E0B", "#6366F1", "#EC4899", "#3B82F6",
              ][i % 8],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
