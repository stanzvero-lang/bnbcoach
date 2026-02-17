"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Upload, X } from "lucide-react";

interface PhotoAnalysis {
  room_type: string;
  score: number;
  positives: string[];
  improvements: string[];
  reshoot_instructions: string;
}

export default function PhotosPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PhotoAnalysis[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []).slice(0, 10);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
    setResults([]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleAnalyze() {
    if (files.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("photos", file));

      const res = await fetch("/api/ai/photos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante l'analisi");
      }

      const data = await res.json();
      setResults(data.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Photo Coach AI</h1>
        <p className="text-text-secondary mt-1">
          Carica le foto del tuo alloggio per ricevere feedback e consigli di miglioramento
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          {previews.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-3 hover:border-primary transition-colors"
            >
              <Upload className="h-8 w-8 text-text-secondary" />
              <span className="text-sm text-text-secondary">
                Clicca per caricare le foto (max 10)
              </span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAnalyze} disabled={loading} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  {loading ? "Analisi in corso..." : "Analizza foto"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambia
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-error">
          <CardContent className="p-4">
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          {files.map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Results */}
      {results.map((analysis, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{analysis.room_type}</span>
              <Badge
                variant={
                  analysis.score >= 7
                    ? "success"
                    : analysis.score >= 4
                    ? "warning"
                    : "destructive"
                }
              >
                {analysis.score}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.positives.length > 0 && (
              <div>
                <p className="text-sm font-medium text-success mb-1">Cosa va bene:</p>
                <ul className="text-sm space-y-1">
                  {analysis.positives.map((p, j) => (
                    <li key={j}>+ {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.improvements.length > 0 && (
              <div>
                <p className="text-sm font-medium text-warning mb-1">
                  Cosa migliorare:
                </p>
                <ul className="text-sm space-y-1">
                  {analysis.improvements.map((p, j) => (
                    <li key={j}>- {p}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-surface p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Istruzioni reshoot:</p>
              <p className="text-sm text-text-secondary">
                {analysis.reshoot_instructions}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
