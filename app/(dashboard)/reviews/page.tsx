"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "formale" | "amichevole" | "entusiasta";

export default function ReviewsPage() {
  const [reviewText, setReviewText] = useState("");
  const [tone, setTone] = useState<Tone>("amichevole");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/ai/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: reviewText, tone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante la generazione");
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risposte Recensioni</h1>
        <p className="text-text-secondary mt-1">
          Genera risposte professionali alle recensioni dei tuoi ospiti
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Recensione dell&apos;ospite
          </label>
          <Textarea
            placeholder="Incolla qui la recensione..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tono della risposta</label>
          <div className="flex gap-2">
            {(["formale", "amichevole", "entusiasta"] as Tone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize",
                  tone === t
                    ? "bg-primary text-white border-primary"
                    : "bg-background border-border text-foreground hover:border-primary"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading || !reviewText.trim()} className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          {loading ? "Generazione in corso..." : "Genera risposta"}
        </Button>
      </form>

      {error && (
        <Card className="border-error">
          <CardContent className="p-4">
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && <Skeleton className="h-32 w-full" />}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Risposta generata</span>
              <button
                onClick={copyToClipboard}
                className="text-text-secondary hover:text-primary"
              >
                <Copy className="h-4 w-4" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{response}</p>
            {copied && (
              <p className="text-xs text-success mt-2">Copiato negli appunti!</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
