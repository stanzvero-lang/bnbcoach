"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    emoji: "\uD83C\uDFE0",
    title: "Tipo di proprietà",
    description: "Che tipo di alloggio vuoi gestire?",
    field: "property_type" as const,
    options: [
      { emoji: "\uD83C\uDFE2", label: "Appartamento" },
      { emoji: "\uD83C\uDFE1", label: "Casa" },
      { emoji: "\uD83D\uDECF\uFE0F", label: "Stanza" },
      { emoji: "\uD83C\uDFD6\uFE0F", label: "Villa" },
      { emoji: "\uD83C\uDFD8\uFE0F", label: "Altro" },
    ],
  },
  {
    emoji: "\uD83D\uDCCD",
    title: "Posizione",
    description: "Dove si trova il tuo alloggio?",
    field: "location" as const,
    options: null,
  },
  {
    emoji: "\uD83D\uDCCA",
    title: "Esperienza",
    description: "Da quanto tempo sei host?",
    field: "experience_level" as const,
    options: [
      { emoji: "\uD83C\uDD95", label: "Nuovo, non ho ancora iniziato" },
      { emoji: "\uD83C\uDF31", label: "Meno di 6 mesi" },
      { emoji: "\uD83D\uDCAA", label: "6-12 mesi" },
      { emoji: "\u2B50", label: "Più di 1 anno" },
    ],
  },
  {
    emoji: "\uD83D\uDC65",
    title: "Guest target",
    description: "Chi sono i tuoi ospiti ideali? (puoi scegliere più di uno)",
    field: "guest_target" as const,
    options: [
      { emoji: "\uD83C\uDF0D", label: "Turisti" },
      { emoji: "\uD83D\uDCBC", label: "Business" },
      { emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66", label: "Famiglie" },
      { emoji: "\u2764\uFE0F", label: "Coppie" },
      { emoji: "\uD83D\uDCBB", label: "Digital nomad" },
    ],
  },
  {
    emoji: "\uD83D\uDCB0",
    title: "Budget miglioramenti",
    description: "Quanto vuoi investire per migliorare il tuo alloggio?",
    field: "improvement_budget" as const,
    options: [
      { emoji: "\uD83C\uDD93", label: "0 \u20AC - Solo consigli gratuiti" },
      { emoji: "\uD83D\uDCB5", label: "Fino a 200 \u20AC" },
      { emoji: "\uD83D\uDCB3", label: "200 - 500 \u20AC" },
      { emoji: "\uD83D\uDCB0", label: "500+ \u20AC" },
    ],
  },
];

interface FormData {
  property_type: string;
  location_city: string;
  location_area: string;
  experience_level: string;
  guest_target: string[];
  improvement_budget: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<FormData>({
    property_type: "",
    location_city: "",
    location_area: "",
    experience_level: "",
    guest_target: [],
    improvement_budget: "",
  });
  const router = useRouter();
  const supabase = createClient();

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  function selectOption(value: string) {
    if (currentStep.field === "guest_target") {
      setData((prev) => ({
        ...prev,
        guest_target: prev.guest_target.includes(value)
          ? prev.guest_target.filter((v) => v !== value)
          : [...prev.guest_target, value],
      }));
    } else if (currentStep.field === "location") {
      // handled by inputs
    } else {
      setData((prev) => ({ ...prev, [currentStep.field]: value }));
    }
  }

  function canProceed() {
    if (currentStep.field === "location") {
      return data.location_city.trim() !== "";
    }
    if (currentStep.field === "guest_target") {
      return data.guest_target.length > 0;
    }
    return (data[currentStep.field as keyof FormData] as string) !== "";
  }

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    // Last step - save to Supabase
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessione scaduta. Effettua di nuovo il login.");
        return;
      }

      const { error: saveError } = await supabase.from("profiles").upsert({
        id: user.id,
        property_type: data.property_type,
        location_city: data.location_city,
        location_area: data.location_area,
        experience_level: data.experience_level,
        guest_target: data.guest_target,
        improvement_budget: data.improvement_budget,
        updated_at: new Date().toISOString(),
      });

      if (saveError) throw saveError;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Errore salvataggio profilo:", err);
      setError("Errore durante il salvataggio. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} />
          <p className="text-xs text-text-secondary mt-2 text-right">
            {step + 1} di {STEPS.length}
          </p>
        </div>

        {/* Step header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">{currentStep.emoji}</span>
          <h1 className="text-2xl font-bold text-dark">{currentStep.title}</h1>
          <p className="text-text-secondary mt-1">{currentStep.description}</p>
        </div>

        {/* Step content */}
        <div className="space-y-3">
          {currentStep.field === "location" ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Città</label>
                <Input
                  placeholder="es. Roma, Milano, Firenze..."
                  value={data.location_city}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, location_city: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Quartiere / Zona</label>
                <Input
                  placeholder="es. Centro, Trastevere, Navigli..."
                  value={data.location_area}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, location_area: e.target.value }))
                  }
                />
              </div>
            </div>
          ) : (
            <div className={cn(
              "grid gap-3",
              currentStep.options && currentStep.options.length <= 4
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
            )}>
              {currentStep.options?.map((option) => {
                const isSelected =
                  currentStep.field === "guest_target"
                    ? data.guest_target.includes(option.label)
                    : data[currentStep.field as keyof FormData] === option.label;

                return (
                  <button
                    key={option.label}
                    onClick={() => selectOption(option.label)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 text-center",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-soft-lg scale-[1.02]"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-soft"
                    )}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className={cn(
                      "text-sm font-medium leading-tight",
                      isSelected ? "text-primary" : "text-dark"
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Indietro
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="flex-1"
            >
              {loading
                ? "Salvataggio..."
                : step === STEPS.length - 1
                ? "Completa \uD83C\uDF89"
                : "Avanti"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
