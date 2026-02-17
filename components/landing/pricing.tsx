import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "per sempre",
    description: "Perfetto per iniziare e capire come migliorare",
    features: [
      "3 analisi listing",
      "Photo Coach (3 foto)",
      "Generatore titoli e descrizioni",
      "Risposte recensioni",
      "Task settimanali",
    ],
    cta: "Inizia gratis",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "19",
    period: "/mese",
    description: "Per host che vogliono risultati concreti, velocemente",
    features: [
      "Analisi listing illimitate",
      "Photo Coach (fino a 10 foto)",
      "Generatore titoli e descrizioni",
      "Risposte recensioni illimitate",
      "Task settimanali personalizzati",
      "Amenity Gap Finder",
      "Shopping list stanza per stanza",
      "Supporto prioritario",
    ],
    cta: "Prova Pro gratis",
    href: "/signup",
    highlighted: true,
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="py-20 px-4 md:px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Prezzi semplici, nessuna sorpresa
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Inizia gratis, passa a Pro quando sei pronto
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card rounded-lg border p-6 md:p-8 relative ${
                plan.highlighted
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-border shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Più popolare
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-dark">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-dark">
                    &euro;{plan.price}
                  </span>
                  <span className="text-text-secondary text-sm">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="block">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
