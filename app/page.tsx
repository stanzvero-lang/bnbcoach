import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold text-dark">
          BnBCoach<span className="text-primary">.ai</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Accedi
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Inizia gratis</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-dark max-w-2xl leading-tight md:text-5xl">
          Il tuo coach AI per diventare un{" "}
          <span className="text-primary">Superhost</span>
        </h2>
        <p className="mt-6 text-lg text-text-secondary max-w-xl">
          BnBCoach.ai ti guida passo dopo passo dall&apos;inizio
          all&apos;ottimizzazione completa del tuo annuncio Airbnb.
        </p>
        <Link href="/signup" className="mt-8">
          <Button size="lg" className="text-base px-8">
            Inizia gratis
          </Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-surface">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-dark mb-12">
            Tutto quello che ti serve per il tuo Airbnb
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-lg border border-border p-6 shadow-sm"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="font-bold text-dark mb-2">{feature.title}</h4>
                <p className="text-sm text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-text-secondary border-t border-border">
        <p>&copy; {new Date().getFullYear()} BnBCoach.ai - Tutti i diritti riservati</p>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: "📊",
    title: "Analisi Listing",
    description:
      "Analizza il tuo annuncio Airbnb e ricevi uno score dettagliato con consigli personalizzati.",
  },
  {
    icon: "📸",
    title: "Photo Coach AI",
    description:
      "Ottieni feedback professionale sulle tue foto con istruzioni specifiche per migliorarle.",
  },
  {
    icon: "✍️",
    title: "Titoli e Descrizioni",
    description:
      "Genera titoli e descrizioni ottimizzati per SEO con diverse varianti di tono.",
  },
  {
    icon: "✅",
    title: "Task Settimanali",
    description:
      "Ricevi 3 task personalizzati a settimana per migliorare il tuo annuncio step-by-step.",
  },
  {
    icon: "💬",
    title: "Risposte Recensioni",
    description:
      "Genera risposte professionali alle recensioni con un click.",
  },
  {
    icon: "🏠",
    title: "Amenity Gap Finder",
    description:
      "Scopri quali servizi mancano al tuo alloggio rispetto alla concorrenza.",
  },
];
