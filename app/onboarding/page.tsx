"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
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

// Top 100 Italian cities for autocomplete
const ITALIAN_CITIES = [
  "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna",
  "Firenze", "Bari", "Catania", "Venezia", "Verona", "Messina", "Padova",
  "Trieste", "Brescia", "Parma", "Taranto", "Prato", "Modena", "Reggio Calabria",
  "Reggio Emilia", "Perugia", "Ravenna", "Livorno", "Cagliari", "Foggia",
  "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Giugliano in Campania",
  "Monza", "Siracusa", "Pescara", "Bergamo", "Forlì", "Trento", "Vicenza",
  "Terni", "Bolzano", "Novara", "Piacenza", "Ancona", "Andria", "Arezzo",
  "Udine", "Cesena", "Lecce", "Lucca", "Pesaro", "Alessandria", "Catanzaro",
  "Pistoia", "Brindisi", "Como", "Treviso", "Varese", "La Spezia", "Pisa",
  "Busto Arsizio", "Sesto San Giovanni", "Grosseto", "Caserta", "Ragusa",
  "Asti", "Cremona", "Marsala", "Trapani", "Cosenza", "Potenza", "Massa",
  "Mantova", "Caltanissetta", "Benevento", "Viterbo", "Avellino", "Lodi",
  "Matera", "Cuneo", "Teramo", "Pordenone", "Rovigo", "Savona", "Olbia",
  "Imperia", "Fermo", "Oristano", "Verbania", "Nuoro", "Aosta", "Enna",
  "Campobasso", "Rieti", "Vibo Valentia", "Isernia", "Crotone", "Sondrio",
  "Biella",
];

// ---------------------------------------------------------------------------
// Isolated CityAutocomplete — manages own state, no parent re-render per keystroke
// ---------------------------------------------------------------------------
const CityAutocomplete = memo(function CityAutocomplete({
  initialCity,
  onCityCommit,
}: {
  initialCity: string;
  onCityCommit: (city: string) => void;
}) {
  const [query, setQuery] = useState(initialCity);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 2
    ? ITALIAN_CITIES.filter((c) => c.toLowerCase().startsWith(query.toLowerCase())).slice(0, 8)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCity(city: string) {
    setQuery(city);
    setShowSuggestions(false);
    onCityCommit(city);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-medium mb-1.5 block">Città</label>
      <Input
        placeholder="Inizia a scrivere la città..."
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          setShowSuggestions(val.length >= 2);
        }}
        onBlur={() => {
          // Delay to allow click on suggestion before blur hides dropdown
          setTimeout(() => {
            onCityCommit(query);
          }, 200);
        }}
        onFocus={() => {
          if (query.length >= 2) setShowSuggestions(true);
        }}
        className="min-h-[48px]"
        autoComplete="off"
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-soft overflow-hidden max-h-[240px] overflow-y-auto">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => {
                // Prevent input blur from firing before click
                e.preventDefault();
                selectCity(city);
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-surface transition-colors border-b border-border last:border-b-0"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Isolated AreaInput — same pattern, local state
// ---------------------------------------------------------------------------
const AreaInput = memo(function AreaInput({
  initialArea,
  onAreaCommit,
}: {
  initialArea: string;
  onAreaCommit: (area: string) => void;
}) {
  const [value, setValue] = useState(initialArea);

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">Quartiere / Zona (opzionale)</label>
      <Input
        placeholder="es. Centro, Trastevere, Navigli..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onAreaCommit(value)}
        className="min-h-[48px]"
      />
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function OnboardingPage() {
  const [slide, setSlide] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState("");
  const [, setSaving] = useState(false);
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

  const progress = ((slide) / (TOTAL_SLIDES - 2)) * 100;

  function canProceed(): boolean {
    switch (slide) {
      case 0: return true;
      case 1: return !data.has_listing || data.airbnb_url.includes("airbnb");
      case 2: return data.property_type !== "";
      case 3: return data.location_city.trim() !== "";
      case 4: return data.guest_target.length > 0;
      case 5: return data.improvement_budget !== "";
      case 6: return true;
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

  // Stable callbacks for child components
  const onCityCommit = useCallback((city: string) => {
    setData((p) => ({ ...p, location_city: city }));
  }, []);

  const onAreaCommit = useCallback((area: string) => {
    setData((p) => ({ ...p, location_area: area }));
  }, []);

  // Slide 6: auto-save via server-side API and optionally trigger analysis
  const saveAndRedirect = useCallback(async (cancelled: { current: boolean }) => {
    setSaving(true);
    setError("");

    try {
      // First check user is still logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessione scaduta. Effettua di nuovo il login.");
        setSaving(false);
        return;
      }

      // Save via server-side API (bypasses RLS)
      const res = await fetch("/api/auth/save-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          has_listing: data.has_listing,
          property_type: data.property_type,
          location_city: data.location_city,
          location_area: data.location_area,
          guest_target: data.guest_target,
          improvement_budget: data.improvement_budget,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Save onboarding failed:", body);
        throw new Error(body.error || "Salvataggio fallito");
      }

      // Animate progress bar
      for (let i = 0; i <= 100; i += 5) {
        if (cancelled.current) return;
        setAnalysisProgress(i);
        await new Promise((r) => setTimeout(r, 80));
      }

      // If user provided URL, trigger analysis in background
      if (data.has_listing && data.airbnb_url) {
        fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: data.airbnb_url }),
        }).catch(() => { /* non-blocking */ });
      }

      if (!cancelled.current) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      if (!cancelled.current) {
        console.error("Errore salvataggio profilo:", err);
        const msg = err instanceof Error ? err.message : "Errore durante il salvataggio. Riprova.";
        setError(msg);
        setSaving(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, router]);

  useEffect(() => {
    if (slide !== 6) return;
    const cancelled = { current: false };
    saveAndRedirect(cancelled);
    return () => { cancelled.current = true; };
  }, [slide, saveAndRedirect]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main className="min-h-[100dvh] flex flex-col px-5 bg-surface">
      {/* Progress bar (slides 1-5 only) */}
      {slide > 0 && slide < 6 && (
        <div className="pt-6 pb-2 w-full max-w-lg mx-auto">
          <Progress value={progress} />
          <p className="text-xs text-text-secondary mt-1.5 text-right">
            {slide} di {TOTAL_SLIDES - 2}
          </p>
        </div>
      )}

      {/* ==================== SLIDE 0: Welcome ==================== */}
      {slide === 0 && (
        <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto py-6">
          <div className="text-center space-y-6">
            <span className="text-7xl block">{"\uD83C\uDFE0"}</span>
            <h1 className="text-[28px] font-bold text-dark leading-tight">
              Benvenuto su BnBCoach!
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              Ti guideremo passo passo per ottimizzare il tuo annuncio Airbnb
              e massimizzare le prenotazioni.
            </p>
            <Button
              onClick={handleNext}
              className="w-full min-h-[52px] text-base font-semibold"
            >
              Iniziamo &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* ==================== SLIDE 1: Has listing? ==================== */}
      {slide === 1 && (
        <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto py-6">
          <div className="text-center mb-4">
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
                "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all min-h-[100px]",
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
                "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all min-h-[100px]",
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
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium block">URL del tuo annuncio Airbnb</label>
              <Input
                placeholder="https://www.airbnb.it/rooms/..."
                value={data.airbnb_url}
                onChange={(e) => setData((p) => ({ ...p, airbnb_url: e.target.value }))}
                type="url"
                className="min-h-[48px]"
              />
              <p className="text-xs text-text-secondary">
                Lo analizzeremo automaticamente per darti un piano personalizzato
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={handleBack} className="flex-1 min-h-[48px] text-base">
              Indietro
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 min-h-[48px] text-base">
              Avanti
            </Button>
          </div>
        </div>
      )}

      {/* ==================== SLIDE 2: Property type ==================== */}
      {slide === 2 && (
        <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto py-6">
          <div className="text-center mb-4">
            <span className="text-5xl block mb-3">{"\uD83C\uDFE0"}</span>
            <h1 className="text-2xl font-bold text-dark">Tipo di proprietà</h1>
            <p className="text-text-secondary mt-1">
              Che tipo di alloggio gestisci (o vuoi gestire)?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PROPERTY_TYPES.map((pt) => (
              <button
                key={pt.label}
                onClick={() => setData((p) => ({ ...p, property_type: pt.label }))}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[88px]",
                  data.property_type === pt.label
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="text-2xl">{pt.icon}</span>
                <span className={cn(
                  "text-sm font-medium leading-tight text-center",
                  data.property_type === pt.label ? "text-primary" : "text-dark"
                )}>
                  {pt.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={handleBack} className="flex-1 min-h-[48px] text-base">
              Indietro
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 min-h-[48px] text-base">
              Avanti
            </Button>
          </div>
        </div>
      )}

      {/* ==================== SLIDE 3: Location ==================== */}
      {slide === 3 && (
        <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto py-6">
          <div className="text-center mb-4">
            <span className="text-5xl block mb-3">{"\uD83D\uDCCD"}</span>
            <h1 className="text-2xl font-bold text-dark">Dove si trova?</h1>
            <p className="text-text-secondary mt-1">
              La posizione ci aiuta a darti consigli specifici per la tua zona
            </p>
          </div>

          <div className="space-y-4">
            <CityAutocomplete
              initialCity={data.location_city}
              onCityCommit={onCityCommit}
            />
            <AreaInput
              initialArea={data.location_area}
              onAreaCommit={onAreaCommit}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={handleBack} className="flex-1 min-h-[48px] text-base">
              Indietro
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 min-h-[48px] text-base">
              Avanti
            </Button>
          </div>
        </div>
      )}

      {/* ==================== SLIDE 4: Guest target ==================== */}
      {slide === 4 && (
        <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto py-6">
          <div className="text-center mb-4">
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
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[88px]",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{gt.icon}</span>
                  <span className={cn(
                    "text-sm font-medium text-center",
                    isSelected ? "text-primary" : "text-dark"
                  )}>
                    {gt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={handleBack} className="flex-1 min-h-[48px] text-base">
              Indietro
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 min-h-[48px] text-base">
              Avanti
            </Button>
          </div>
        </div>
      )}

      {/* ==================== SLIDE 5: Budget ==================== */}
      {slide === 5 && (
        <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto py-6">
          <div className="text-center mb-4">
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
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[100px]",
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

          <p className="text-xs text-text-secondary text-center mt-3">
            Molti miglioramenti sono gratis!
          </p>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={handleBack} className="flex-1 min-h-[48px] text-base">
              Indietro
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 min-h-[48px] text-base">
              Completa {"\uD83C\uDF89"}
            </Button>
          </div>
        </div>
      )}

      {/* ==================== SLIDE 6: Loading ==================== */}
      {slide === 6 && (
        <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto py-6">
          <div className="text-center space-y-8">
            <span className="text-7xl block animate-bounce">
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
                <Button
                  variant="outline"
                  className="min-h-[48px]"
                  onClick={() => { setSlide(5); setSaving(false); setAnalysisProgress(0); }}
                >
                  Riprova
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
