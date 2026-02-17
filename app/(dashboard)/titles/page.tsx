"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Type, Copy, RefreshCw } from "lucide-react";

interface Variant {
  text: string;
  seo_score: number;
  keywords: string[];
  tone: string;
}

interface GenerationResult {
  titles: Variant[];
  descriptions: Variant[];
}

export default function TitlesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante la generazione");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Titoli & Descrizioni</h1>
        <p className="text-text-secondary mt-1">
          Genera titoli e descrizioni ottimizzati per il tuo annuncio
        </p>
      </div>

      <Button onClick={handleGenerate} disabled={loading} className="w-full">
        <Type className="h-4 w-4 mr-2" />
        {loading ? "Generazione in corso..." : "Genera varianti"}
      </Button>

      {error && (
        <Card className="border-error">
          <CardContent className="p-4">
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {result && (
        <>
          {/* Titles */}
          <div>
            <h2 className="text-lg font-bold mb-3">Titoli</h2>
            <div className="space-y-3">
              {result.titles.map((variant, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{variant.text}</p>
                      <button
                        onClick={() => copyToClipboard(variant.text)}
                        className="flex-shrink-0 text-text-secondary hover:text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary">SEO: {variant.seo_score}/10</Badge>
                      <Badge variant="outline">{variant.tone}</Badge>
                      {copied === variant.text && (
                        <span className="text-xs text-success">Copiato!</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <h2 className="text-lg font-bold mb-3">Descrizioni</h2>
            <div className="space-y-3">
              {result.descriptions.map((variant, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{variant.text}</p>
                      <button
                        onClick={() => copyToClipboard(variant.text)}
                        className="flex-shrink-0 text-text-secondary hover:text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary">SEO: {variant.seo_score}/10</Badge>
                      <Badge variant="outline">{variant.tone}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button variant="outline" onClick={handleGenerate} disabled={loading} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rigenera varianti
          </Button>
        </>
      )}
    </div>
  );
}
