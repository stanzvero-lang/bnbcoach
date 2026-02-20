"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Slide data (7 slides per CLAUDE.md)
const TOTAL_SLIDES = 7;

interface OnboardingData {
  has_listing: boolean;
  airbnb_url: string;
  property_type: string;
  location_city: string;
  location_area: string;
  guest_target: string[];
  improvement_budget: string;
}

const PROPERTY_TYPES = [
  { icon: "\uD83C\uDFE2", label: "Appartamento" },
  { icon: "\uD83D\uDECF\uFE0F", label: "Stanza" },
  { icon: "\uD83C\uDFE1", label: "Casa" },
  { icon: "\uD83C\uDFD6\uFE0F", label: "Villa" },
  { icon: "\uD83C\uDFD9\uFE0F", label: "Loft" },
  { icon: "\uD83C\uDFD8\uFE0F", label: "Altro" },
];

const GUEST_TARGETS = [
  { icon: "\u2764\uFE0F", label: "Coppie" },
  { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66", label: "Famiglie" },
  { icon: "\uD83D\uDCBC", label: "Business" },
  { icon: "\uD83D\uDCBB", label: "Nomadi digitali" },
  { icon: "\uD83D\uDC6B", label: "Gruppi" },
];

const BUDGETS = [
  { icon: "\uD83C\uDD93", label: "\u20AC0", description: "Solo consigli gratuiti" },
  { icon: "\uD83D\uDCB5", label: "Fino a \u20AC300", description: "Piccoli miglioramenti" },
  { icon: "\uD83D\uDCB3", label: "Fino a \u20AC1000", description: "Miglioramenti medi" },
  { icon: "\uD83D\uDCB0", label: "\u20AC1000+", description: "Investimento serio" },
];

export default function OnboardingPage() {
  const [slide, setSlide] = useState(0);
  const [, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState("");
  const [data, setData] = useState<OnboardingData>({
    has_listing: false,
    airbnb_url: "",
    property_type: "",
    location_city: "",
    location_area: "",
    guest_target: [],
    improvement_budget: "",
  });
  const router = useRouter();
  const supabase = createClient();

  const progress = ((slide + 1) / TOTAL_SLIDES) * 100;

  function canProceed(): boolean {
    switch (slide) {
      case 0: return true; // Welcome slide
      case 1: return !data.has_listing || data.airbnb_url.includes("airbnb"); // Has listing?
      case 2: return data.property_type !== ""; // Property type
      case 3: return data.location_city.trim() !== ""; // Location
      case 4: return data.guest_target.length > 0; // Targets
      case 5: return data.improvement_budget !== ""; // Budget
      case 6: return true; // Loading slide (auto)
      default: return false;
    }
  }

  function handleNext() {
    if (slide < TOTAL_SLIDES - 1) {
      setSlide(slide + 1);
    }
  }

  function handleBack() {
    if (slide > 0) {
      setSlide(slide - 1);
    }
  }

  // Slide 7 (index 6): auto-save and optionally trigger analysis
  useEffect(() => {
    if (slide !== 6) return;

    let cancelled = false;

    async function saveAndRedirect() {
      setLoading(true);
      setError("");

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Sessione scaduta. Effettua di nuovo il login.");
          setLoading(false);
          return;
        }

        // Save profile
        const { error: saveError } = await supabase.from("profiles").upsert({
          id: user.id,
          has_listing: data.has_listing,
          property_type: data.property_type,
          location_city: data.location_city,
          location_area: data.location_area,
          guest_target: data.guest_target,
          improvement_budget: data.improvement_budget,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

        if (saveError) throw saveError;

        // Animate progress bar
        for (let i = 0; i <= 100; i += 5) {
          if (cancelled) return;
          setAnalysisProgress(i);
          await new Promise((r) => setTimeout(r, 80));
        }

        // If user provided URL, trigger analysis in background
        if (data.has_listing && data.airbnb_url) {
          try {
            // Fire the analysis (don't wait for completion to redirect)
            fetch("/api/ai/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: data.airbnb_url }),
            }).catch(() => {
              // Non-blocking: analysis runs in background
            });
          } catch {
            // Non-blocking: analysis failure is not a blocker for onboarding
          }
        }

        if (!cancelled) {
          router.push("/dashboard");
          router.refresh();
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Errore salvataggio profilo:", err);
          setError("Errore durante il salvataggio. Riprova.");
          setLoading(false);
        }
      }
    }

    saveAndRedirect();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-lg">
        {/* Progress bar (hidden on welcome and loading slides) */}
        {slide > 0 && slide < 6 && (
          <div className="mb-6">
            <Progress value={progress} />
            <p className="text-xs text-text-secondary mt-2 text-right">
              {slide} di {TOTAL_SLIDES - 2}
            </p>
          </div>
        )}

        {/* ==================== SLIDE 0: Welcome ==================== */}
        {slide === 0 && (
          <div className="text-center space-y-6">
            <span className="text-6xl block">{"\uD83C\uDFE0"}</span>
            <h1 className="text-2xl font-bold text-dark">
              Benvenuto su BnBCoach!
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              Ti guideremo passo passo per ottimizzare il tuo annuncio Airbnb
              e massimizzare le prenotazioni.
            </p>
            <Button onClick={handleNext} className="w-full text-base py-6">
              Iniziamo {"\u2192"}
            </Button>
          </div>
        )}

        {/* ==================== SLIDE 1: Has listing? ==================== */}
        {slide === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <span className="text-5xl block mb-3">{"\uD83D\uDD0D"}</span>
              <h1 className="text-2xl font-bold text-dark">Hai già un annuncio?</h1>
              <p className="text-text-secondary mt-1">
                Hai già un annuncio pubblicato su Airbnb?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setData((p) => ({ ...p, has_listing: true }))}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all",
                  data.has_listing
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="text-3xl">{"\u2705"}</span>
                <span className={cn("text-sm font-medium", data.has_listing && "text-primary")}>
                  Sì, ho un listing
                </span>
              </button>
              <button
                onClick={() => setData((p) => ({ ...p, has_listing: false, airbnb_url: "" }))}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all",
                  !data.has_listing
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="text-3xl">{"\uD83C\uDD95"}</span>
                <span className={cn("text-sm font-medium", !data.has_listing && "text-primary")}>
                  No, sto iniziando
                </span>
              </button>
            </div>

            {data.has_listing && (
              <div className="space-y-2">
                <label className="text-sm font-medium block">URL del tuo annuncio Airbnb</label>
                <Input
                  placeholder="https://www.airbnb.it/rooms/..."
                  value={data.airbnb_url}
                  onChange={(e) => setData((p) => ({ ...p, airbnb_url: e.target.value }))}
                  type="url"
                />
                <p className="text-xs text-text-secondary">
                  Lo analizzeremo automaticamente per darti un piano personalizzato
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Indietro
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Avanti
              </Button>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 2: Property type ==================== */}
        {slide === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <span className="text-5xl block mb-3">{"\uD83C\uDFE0"}</span>
              <h1 className="text-2xl font-bold text-dark">Tipo di proprietà</h1>
              <p className="text-text-secondary mt-1">
                Che tipo di alloggio gestisci (o vuoi gestire)?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.label}
                  onClick={() => setData((p) => ({ ...p, property_type: pt.label }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    data.property_type === pt.label
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{pt.icon}</span>
                  <span className={cn(
                    "text-xs font-medium leading-tight text-center",
                    data.property_type === pt.label ? "text-primary" : "text-dark"
                  )}>
                    {pt.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Indietro
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Avanti
              </Button>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 3: Location ==================== */}
        {slide === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <span className="text-5xl block mb-3">{"\uD83D\uDCCD"}</span>
              <h1 className="text-2xl font-bold text-dark">Dove si trova?</h1>
              <p className="text-text-secondary mt-1">
                La posizione ci aiuta a darti consigli specifici per la tua zona
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Città</label>
                <Input
                  placeholder="es. Roma, Milano, Firenze..."
                  value={data.location_city}
                  onChange={(e) => setData((p) => ({ ...p, location_city: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Quartiere / Zona (opzionale)</label>
                <Input
                  placeholder="es. Centro, Trastevere, Navigli..."
                  value={data.location_area}
                  onChange={(e) => setData((p) => ({ ...p, location_area: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Indietro
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Avanti
              </Button>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 4: Guest target ==================== */}
        {slide === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <span className="text-5xl block mb-3">{"\uD83D\uDC65"}</span>
              <h1 className="text-2xl font-bold text-dark">Chi vuoi ospitare?</h1>
              <p className="text-text-secondary mt-1">
                Puoi scegliere più di uno
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {GUEST_TARGETS.map((gt) => {
                const isSelected = data.guest_target.includes(gt.label);
                return (
                  <button
                    key={gt.label}
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        guest_target: isSelected
                          ? p.guest_target.filter((t) => t !== gt.label)
                          : [...p.guest_target, gt.label],
                      }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{gt.icon}</span>
                    <span className={cn(
                      "text-xs font-medium text-center",
                      isSelected ? "text-primary" : "text-dark"
                    )}>
                      {gt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Indietro
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Avanti
              </Button>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 5: Budget ==================== */}
        {slide === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <span className="text-5xl block mb-3">{"\uD83D\uDCB0"}</span>
              <h1 className="text-2xl font-bold text-dark">Budget per miglioramenti</h1>
              <p className="text-text-secondary mt-1">
                Quanto vuoi investire per migliorare il tuo alloggio?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BUDGETS.map((b) => (
                <button
                  key={b.label}
                  onClick={() => setData((p) => ({ ...p, improvement_budget: b.label }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    data.improvement_budget === b.label
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className={cn(
                    "text-sm font-bold",
                    data.improvement_budget === b.label ? "text-primary" : "text-dark"
                  )}>
                    {b.label}
                  </span>
                  <span className="text-xs text-text-secondary">{b.description}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-text-secondary text-center">
              Molti miglioramenti sono gratis!
            </p>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Indietro
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Completa {"\uD83C\uDF89"}
              </Button>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 6: Loading ==================== */}
        {slide === 6 && (
          <div className="text-center space-y-8">
            <span className="text-6xl block animate-bounce">
              {data.has_listing && data.airbnb_url ? "\uD83D\uDD0D" : "\uD83D\uDE80"}
            </span>
            <h1 className="text-2xl font-bold text-dark">
              {data.has_listing && data.airbnb_url
                ? "Analizziamo il tuo listing..."
                : "Prepariamo il tuo piano..."}
            </h1>
            <p className="text-text-secondary">
              {data.has_listing && data.airbnb_url
                ? "Stiamo recuperando i dati del tuo annuncio e preparando l'analisi AI"
                : "Stiamo creando il tuo percorso personalizzato"}
            </p>
            <div className="max-w-xs mx-auto">
              <Progress value={analysisProgress} />
              <p className="text-xs text-text-secondary mt-2">{analysisProgress}%</p>
            </div>
            {error && (
              <div className="space-y-3">
                <p className="text-sm text-error">{error}</p>
                <Button variant="outline" onClick={() => { setSlide(5); setLoading(false); }}>
                  Riprova
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
