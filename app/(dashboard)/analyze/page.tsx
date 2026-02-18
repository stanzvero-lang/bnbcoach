"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListingSummary {
  title: string;
  location: string;
  price: string;
  rating: number;
  reviewCount: number;
  photoCount: number;
  propertyType: string;
}

interface AnalysisResult {
  overall_score: number;
  title_score: number;
  title_review: string;
  photos_score: number;
  photos_review: string;
  amenities_score: number;
  amenities_review: string;
  description_score: number;
  description_review: string;
  pricing_score: number;
  pricing_review: string;
  tips: string[];
  listing_summary: ListingSummary;
  using_mock: boolean;
}

const SCORE_AREAS = [
  { key: "title", label: "Titolo", emoji: "\u270D\uFE0F", scoreField: "title_score", reviewField: "title_review" },
  { key: "photos", label: "Foto", emoji: "\uD83D\uDCF8", scoreField: "photos_score", reviewField: "photos_review" },
  { key: "description", label: "Descrizione", emoji: "\uD83D\uDCDD", scoreField: "description_score", reviewField: "description_review" },
  { key: "amenities", label: "Amenities", emoji: "\uD83D\uDECB\uFE0F", scoreField: "amenities_score", reviewField: "amenities_review" },
  { key: "pricing", label: "Prezzo", emoji: "\uD83D\uDCB0", scoreField: "pricing_score", reviewField: "pricing_review" },
] as const;

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante l'analisi");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-error";
  }

  function getScoreBg(score: number) {
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-error";
  }

  function getScoreBadge(score: number) {
    if (score >= 70) return "success" as const;
    if (score >= 40) return "warning" as const;
    return "destructive" as const;
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return "Ottimo";
    if (score >= 70) return "Buono";
    if (score >= 50) return "Sufficiente";
    if (score >= 30) return "Da migliorare";
    return "Critico";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {"\uD83D\uDD0D"} Analisi Listing
        </h1>
        <p className="text-text-secondary mt-1">
          Inserisci l&apos;URL del tuo annuncio Airbnb per ricevere un&apos;analisi dettagliata con punteggio e consigli personalizzati
        </p>
      </div>

      {/* URL Input */}
      <form onSubmit={handleAnalyze} className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://www.airbnb.it/rooms/12345678"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <span className="animate-spin mr-2">{"\u23F3"}</span>
                Analisi...
              </>
            ) : (
              <>
                {"\uD83D\uDD0D"} Analizza
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-text-secondary">
          Incolla l&apos;URL completo del tuo annuncio Airbnb (es. https://www.airbnb.it/rooms/...)
        </p>
      </form>

      {/* Error */}
      {error && (
        <Card className="border-error/50 bg-error/5">
          <CardContent className="p-4 flex items-start gap-3">
            <span className="text-lg">{"\u274C"}</span>
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Card>
            <CardContent className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
          <p className="text-center text-sm text-text-secondary animate-pulse">
            {"\uD83E\uDD16"} L&apos;AI sta analizzando il tuo listing... ci vogliono 10-20 secondi
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Mock data banner */}
          {result.using_mock && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-3 flex items-center gap-2">
                <span>{"\u26A0\uFE0F"}</span>
                <p className="text-xs text-warning">
                  Scraping non riuscito: l&apos;analisi usa dati di esempio. Verifica che APIFY_API_TOKEN sia configurato e che l&apos;URL sia corretto.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Listing Summary */}
          {result.listing_summary && (
            <Card className="bg-surface">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{"\uD83C\uDFE0"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {result.listing_summary.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {result.listing_summary.propertyType} {"\u00B7"} {result.listing_summary.location}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-text-secondary">
                      <span>{"\uD83D\uDCB0"} {result.listing_summary.price}</span>
                      <span>{"\u2B50"} {result.listing_summary.rating}/5 ({result.listing_summary.reviewCount} recensioni)</span>
                      <span>{"\uD83D\uDCF8"} {result.listing_summary.photoCount} foto</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Score - Big circle */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Score circle */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-surface"
                    />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.overall_score / 100) * 264} 264`}
                      className={getScoreColor(result.overall_score)}
                    />
                  </svg>
                  <span className={cn("absolute text-2xl font-bold", getScoreColor(result.overall_score))}>
                    {result.overall_score}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">Punteggio complessivo</h2>
                  <p className={cn("text-sm font-semibold", getScoreColor(result.overall_score))}>
                    {getScoreLabel(result.overall_score)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Media pesata di titolo, foto, descrizione, amenities e prezzo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold px-1">Dettaglio punteggi</h2>
            {SCORE_AREAS.map((area) => {
              const score = result[area.scoreField] as number;
              const review = result[area.reviewField] as string;
              return (
                <Card key={area.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{area.emoji}</span>
                        <span className="font-medium text-sm">{area.label}</span>
                      </div>
                      <Badge variant={getScoreBadge(score)}>
                        {score}/100
                      </Badge>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden mb-2">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", getScoreBg(score))}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    {/* Review text */}
                    {review && (
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {review}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {"\uD83D\uDCA1"} 5 consigli per migliorare
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white",
                      i === 0 ? "bg-primary" : "bg-dark/70"
                    )}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{tip}</p>
                      {i === 0 && (
                        <Badge variant="default" className="mt-1.5 text-[10px]">
                          Massimo impatto
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Analyze again */}
          <div className="text-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setUrl("");
              }}
            >
              {"\uD83D\uDD04"} Analizza un altro listing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
