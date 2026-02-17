import { ClipboardList, Zap, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: ClipboardList,
    title: "Rispondi a 5 domande",
    description:
      "Tipo di proprietà, posizione, esperienza, target ospiti e budget. In 2 minuti il coach conosce il tuo profilo.",
  },
  {
    number: "2",
    icon: Zap,
    title: "Analizza il tuo annuncio",
    description:
      "Incolla l'URL Airbnb. L'AI analizza titolo, foto, descrizione, amenities e prezzo. Ricevi uno score dettagliato.",
  },
  {
    number: "3",
    icon: TrendingUp,
    title: "Migliora settimana dopo settimana",
    description:
      "Segui i task personalizzati, usa gli strumenti AI e guarda il tuo punteggio salire. Ogni settimana, un passo avanti.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 md:px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Come funziona
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Tre passi per trasformare il tuo annuncio Airbnb
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-lg font-bold mb-6">
                  {step.number}
                </div>

                <div className="flex justify-center mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                <h3 className="font-bold text-dark text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
