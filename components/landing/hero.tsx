import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5 text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Coaching AI per host Airbnb
          </Badge>

          <h1 className="text-4xl font-bold text-dark leading-[1.1] tracking-tight max-w-3xl md:text-5xl lg:text-6xl">
            Da nuovo host a{" "}
            <span className="text-primary">Superhost</span>
            <br className="hidden md:block" />
            {" "}con l&apos;AI al tuo fianco
          </h1>

          <p className="mt-6 text-lg text-text-secondary max-w-xl leading-relaxed md:text-xl">
            BnBCoach.ai analizza il tuo annuncio, migliora le tue foto,
            scrive i tuoi testi e ti guida settimana dopo settimana.
            Tutto con intelligenza artificiale.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-12 gap-2">
                Inizia gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                Come funziona
              </Button>
            </a>
          </div>

          <p className="mt-4 text-sm text-text-secondary">
            Gratis per sempre. 3 analisi incluse, nessuna carta richiesta.
          </p>
        </div>

        {/* Score preview mockup */}
        <div className="mt-16 max-w-lg mx-auto">
          <div className="rounded-lg border border-border bg-card shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">Punteggio del tuo annuncio</span>
              <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-full">Live demo</span>
            </div>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-5xl font-bold text-primary">73</span>
              <span className="text-lg text-text-secondary mb-1">/100</span>
            </div>
            <div className="h-3 rounded-full bg-surface overflow-hidden mb-6">
              <div className="h-full rounded-full bg-gradient-to-r from-warning to-primary" style={{ width: "73%" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Titolo", score: 85, color: "text-success" },
                { label: "Foto", score: 52, color: "text-warning" },
                { label: "Descrizione", score: 78, color: "text-success" },
                { label: "Prezzo", score: 65, color: "text-warning" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
