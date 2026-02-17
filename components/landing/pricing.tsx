import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const features = [
  { label: "Analisi listing", free: "3 analisi", pro: "Illimitate" },
  { label: "Photo Coach AI", free: "3 foto", pro: "10 foto" },
  { label: "Generatore titoli e descrizioni", free: true, pro: true },
  { label: "Risposte recensioni", free: true, pro: "Illimitate" },
  { label: "Task settimanali", free: true, pro: "Personalizzati" },
  { label: "Amenity Gap Finder", free: false, pro: true },
  { label: "Shopping list stanza per stanza", free: false, pro: true },
  { label: "Supporto prioritario", free: false, pro: true },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="py-16 px-4 md:px-6 md:py-24 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
            Prezzi
          </p>
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Inizia gratis, cresci con Pro
          </h2>
          <p className="mt-4 text-text-secondary max-w-md mx-auto">
            Nessuna sorpresa. Cancella quando vuoi.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Free plan */}
          <div className="rounded-lg border border-border bg-card p-6 md:p-8 shadow-soft">
            <h3 className="font-bold text-dark text-lg">Free</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-dark">&euro;0</span>
              <span className="text-sm text-text-secondary">per sempre</span>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Perfetto per iniziare e capire come migliorare
            </p>

            <Link href="/signup" className="block mt-6">
              <Button variant="outline" size="lg" className="w-full">
                Inizia gratis
              </Button>
            </Link>

            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f.label} className="flex items-start gap-2.5 text-sm">
                  {f.free ? (
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-text-secondary/40 mt-0.5 shrink-0" />
                  )}
                  <span className={f.free ? "" : "text-text-secondary/60"}>
                    {f.label}
                    {typeof f.free === "string" && (
                      <span className="text-text-secondary"> ({f.free})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className="rounded-lg border-2 border-primary bg-card p-6 md:p-8 relative shadow-soft-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
              Consigliato
            </div>

            <h3 className="font-bold text-dark text-lg">Pro</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-dark">&euro;19</span>
              <span className="text-sm text-text-secondary">/mese</span>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Per chi vuole risultati concreti, velocemente
            </p>

            <Link href="/signup" className="block mt-6">
              <Button size="lg" className="w-full">
                Prova Pro gratis
              </Button>
            </Link>

            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f.label} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>
                    {f.label}
                    {typeof f.pro === "string" && (
                      <span className="font-medium text-dark"> — {f.pro}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
