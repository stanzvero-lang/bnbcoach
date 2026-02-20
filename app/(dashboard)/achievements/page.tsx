"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeItem {
  key: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export default function AchievementsPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          setBadges(data.badges || []);
          setUnlockedCount(data.unlocked_count ?? 0);
          setTotalCount(data.total_count ?? 0);
        }
      } catch (err) {
        console.error("Fetch achievements error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-[60px] w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[140px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Achievement</h1>
        <p className="text-text-secondary text-sm mt-1">
          Sblocca badge completando obiettivi
        </p>
      </div>

      {/* Progress summary */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">
              {unlockedCount} di {totalCount} sbloccati
            </p>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: totalCount }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i < unlockedCount ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <Card
            key={badge.key}
            className={cn(
              "transition-all duration-300",
              !badge.unlocked && "opacity-50"
            )}
          >
            <CardContent className="p-4 text-center">
              <div className="relative inline-block mb-2">
                <span className={cn(
                  "text-3xl block transition-all duration-300",
                  badge.unlocked ? "grayscale-0" : "grayscale"
                )}>
                  {badge.icon}
                </span>
                {!badge.unlocked && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface flex items-center justify-center">
                    <Lock className="h-2.5 w-2.5 text-text-secondary" />
                  </div>
                )}
              </div>
              <p className="font-bold text-xs leading-tight">{badge.name}</p>
              <p className="text-[10px] text-text-secondary mt-1 leading-snug">
                {badge.unlocked ? badge.description : badge.condition}
              </p>
              {badge.unlocked && badge.unlocked_at && (
                <p className="text-[9px] text-text-muted mt-1.5">
                  {new Date(badge.unlocked_at).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
