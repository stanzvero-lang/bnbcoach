"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreRing from "@/components/dashboard/ScoreRing";
import TrendArrow from "@/components/dashboard/TrendArrow";
import LevelBadge from "@/components/dashboard/LevelBadge";
import FeatureGrid from "@/components/dashboard/FeatureGrid";
import GuidedPath from "@/components/dashboard/GuidedPath";

interface DashboardData {
  profile: {
    name: string;
    level: string;
    has_listing: boolean;
    subscription_tier: string;
    streak_weeks: number;
  };
  listing: {
    id: string;
    name: string;
    url: string;
    score: number;
    rating: number | null;
    reviews_count: number | null;
    photo_count: number | null;
  } | null;
  score: number | null;
  trend: number | null;
  lastAnalysisDate: string | null;
  tasks: {
    total: number;
    completed: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[220px] w-full rounded-xl" />
        <Skeleton className="h-[100px] w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasListing = data?.listing !== null && data?.score !== null;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      {data?.profile?.name && (
        <p className="text-text-secondary text-sm">
          Ciao, <span className="font-medium text-dark">{data.profile.name}</span>
        </p>
      )}

      {hasListing ? (
        <>
          {/* Score section */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center gap-3">
                <ScoreRing score={data!.score} />
                <div className="flex items-center gap-2">
                  <LevelBadge level={data!.profile.level} />
                  {data!.trend !== null && <TrendArrow trend={data!.trend} />}
                </div>
                {data!.listing && (
                  <p className="text-xs text-text-secondary text-center mt-1 line-clamp-1">
                    {data!.listing.name}
                  </p>
                )}
                {data!.lastAnalysisDate && (
                  <p className="text-xs text-text-secondary">
                    Ultima analisi:{" "}
                    {new Date(data!.lastAnalysisDate).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
                <Link
                  href="/analyze"
                  className="text-xs text-primary font-medium mt-1"
                >
                  Aggiorna analisi &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          {data!.listing && (
            <div className="grid grid-cols-3 gap-2">
              <MiniStat
                label="Rating"
                value={
                  data!.listing.rating !== null
                    ? data!.listing.rating.toFixed(1)
                    : "--"
                }
                icon="\u2B50"
              />
              <MiniStat
                label="Recensioni"
                value={
                  data!.listing.reviews_count !== null
                    ? String(data!.listing.reviews_count)
                    : "--"
                }
                icon="\uD83D\uDCAC"
              />
              <MiniStat
                label="Foto"
                value={
                  data!.listing.photo_count !== null
                    ? String(data!.listing.photo_count)
                    : "--"
                }
                icon="\uD83D\uDCF7"
              />
            </div>
          )}

          {/* Weekly Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">
                Questa settimana
              </CardTitle>
              <Badge variant="secondary">
                {data!.tasks.completed}/{data!.tasks.total}
              </Badge>
            </CardHeader>
            <CardContent>
              {data!.tasks.total > 0 ? (
                <>
                  <Progress
                    value={
                      data!.tasks.total > 0
                        ? (data!.tasks.completed / data!.tasks.total) * 100
                        : 0
                    }
                  />
                  <Link
                    href="/tasks"
                    className="text-sm text-primary font-medium mt-3 inline-block"
                  >
                    Vai ai task &rarr;
                  </Link>
                </>
              ) : (
                <p className="text-sm text-text-secondary">
                  I task settimanali verranno generati dopo la prima analisi.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* No listing — show guided path or CTA to analyze */}
          {data?.profile?.has_listing ? (
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <span className="text-5xl block">{"\uD83D\uDD0D"}</span>
                <h2 className="text-lg font-bold text-dark">
                  Analizza il tuo listing
                </h2>
                <p className="text-sm text-text-secondary">
                  Hai indicato di avere un listing Airbnb. Analizzalo per
                  ottenere il tuo score e un piano di miglioramento personalizzato.
                </p>
                <Link
                  href="/analyze"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition"
                >
                  Analizza ora
                </Link>
              </CardContent>
            </Card>
          ) : (
            <GuidedPath />
          )}
        </>
      )}

      {/* Feature grid — always shown */}
      <div>
        <h2 className="text-lg font-bold text-dark mb-3">I tuoi strumenti</h2>
        <FeatureGrid />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <span className="text-lg block">{icon}</span>
        <span className="text-lg font-bold text-dark block">{value}</span>
        <span className="text-[11px] text-text-secondary">{label}</span>
      </CardContent>
    </Card>
  );
}
