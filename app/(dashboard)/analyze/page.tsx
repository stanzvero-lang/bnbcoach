"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface AnalysisResult {
  overall_score: number;
  title_score: number;
  photos_score: number;
  amenities_score: number;
  description_score: number;
  pricing_score: number;
  tips: string[];
}

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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante l'analisi");
      }

      const data = await res.json();
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

  function getScoreBadge(score: number) {
    if (score >= 70) return "success" as const;
    if (score >= 40) return "warning" as const;
    return "destructive" as const;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analisi Listing</h1>
        <p className="text-text-secondary mt-1">
          Inserisci l&apos;URL del tuo annuncio Airbnb per ricevere un&apos;analisi dettagliata
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="flex gap-2">
        <Input
          type="url"
          placeholder="https://www.airbnb.it/rooms/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Analisi..." : "Analizza"}
        </Button>
      </form>

      {error && (
        <Card className="border-error">
          <CardContent className="p-4">
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Punteggio complessivo</span>
                <span className={`text-3xl ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score}/100
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={result.overall_score} />
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dettaglio punteggi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Titolo", score: result.title_score },
                { label: "Foto", score: result.photos_score },
                { label: "Descrizione", score: result.description_score },
                { label: "Amenities", score: result.amenities_score },
                { label: "Prezzo", score: result.pricing_score },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant={getScoreBadge(item.score)}>
                    {item.score}/100
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consigli prioritizzati</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
