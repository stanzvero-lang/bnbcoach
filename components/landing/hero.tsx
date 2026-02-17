import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-background" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[2.5rem] leading-[1.08] font-bold text-dark tracking-tight max-w-3xl md:text-5xl lg:text-6xl">
            Il tuo coach AI per diventare{" "}
            <span className="text-primary">Superhost</span>
          </h1>

          <p className="mt-5 text-lg text-text-secondary max-w-lg leading-relaxed md:text-xl">
            Analizza, migliora e ottimizza il tuo annuncio Airbnb.
            Passo dopo passo, con l&apos;intelligenza artificiale.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-12 gap-2 rounded-lg">
                Inizia gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8 h-12 rounded-lg">
                Scopri come funziona
              </Button>
            </a>
          </div>

          <p className="mt-3 text-sm text-text-secondary">
            Nessuna carta richiesta &middot; 10 analisi gratuite incluse
          </p>
        </div>

        {/* Score card mockup */}
        <div className="mt-12 md:mt-16 max-w-md mx-auto">
          <div className="rounded-lg border border-border bg-card shadow-soft-lg overflow-hidden">
            {/* Card header */}
            <div className="bg-surface/60 px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Analisi annuncio
              </span>
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <TrendingUp className="h-3 w-3" />
                +18 punti in 3 settimane
              </span>
            </div>

            <div className="p-5">
              {/* Big score */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#F7F7F7" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#FF385C" strokeWidth="6" strokeDasharray={`${73 * 2.136} ${100 * 2.136}`} strokeLinecap="round" />
                  </svg>
                  <span className="text-2xl font-bold text-dark">73</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark">Buon inizio!</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Migliora foto e prezzo per salire a 85+
                  </p>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="space-y-2.5">
                {[
                  { label: "\u270D\uFE0F Titolo", score: 85, color: "#008A05" },
                  { label: "\uD83D\uDCDD Descrizione", score: 78, color: "#008A05" },
                  { label: "\uD83D\uDCB0 Prezzo", score: 65, color: "#E07912" },
                  { label: "\uD83D\uDCF8 Foto", score: 52, color: "#E07912" },
                  { label: "\uD83D\uDECB\uFE0F Amenities", score: 70, color: "#008A05" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-24 shrink-0">{item.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.score}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-7 text-right" style={{ color: item.color }}>
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social proof numbers */}
        <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { emoji: "\uD83D\uDC65", value: "2.400+", label: "Host iscritti" },
            { emoji: "\uD83D\uDCC8", value: "12.000+", label: "Analisi completate" },
            { emoji: "\u2B50", value: "4.8/5", label: "Valutazione media" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-lg block mb-1">{stat.emoji}</span>
              <p className="text-lg font-bold text-dark">{stat.value}</p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
