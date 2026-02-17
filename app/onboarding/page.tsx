"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Tipo di proprietà",
    description: "Che tipo di alloggio vuoi gestire?",
    field: "property_type" as const,
    options: ["Appartamento", "Casa", "Stanza", "Villa", "Altro"],
  },
  {
    title: "Posizione",
    description: "Dove si trova il tuo alloggio?",
    field: "location" as const,
    options: null,
  },
  {
    title: "Esperienza",
    description: "Da quanto tempo sei host?",
    field: "experience_level" as const,
    options: ["Nuovo, non ho ancora iniziato", "Meno di 6 mesi", "6-12 mesi", "Più di 1 anno"],
  },
  {
    title: "Guest target",
    description: "Chi sono i tuoi ospiti ideali? (puoi scegliere più di uno)",
    field: "guest_target" as const,
    options: ["Turisti", "Business", "Famiglie", "Coppie", "Digital nomad"],
  },
  {
    title: "Budget miglioramenti",
    description: "Quanto vuoi investire per migliorare il tuo alloggio?",
    field: "improvement_budget" as const,
    options: ["0 € - Solo consigli gratuiti", "Fino a 200 €", "200 - 500 €", "500+ €"],
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
    <main className="min-h-screen flex items-center justify-center px-6 bg-surface">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4">
            <Progress value={progress} />
            <p className="text-xs text-text-secondary mt-2 text-right">
              {step + 1} di {STEPS.length}
            </p>
          </div>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentStep.field === "location" ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Città</label>
                <Input
                  placeholder="es. Roma, Milano, Firenze..."
                  value={data.location_city}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, location_city: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quartiere / Zona</label>
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
            currentStep.options?.map((option) => {
              const isSelected =
                currentStep.field === "guest_target"
                  ? data.guest_target.includes(option)
                  : data[currentStep.field as keyof FormData] === option;

              return (
                <button
                  key={option}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors text-sm",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {option}
                </button>
              );
            })
          )}

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
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
                ? "Completa"
                : "Avanti"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
