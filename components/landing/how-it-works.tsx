const steps = [
  {
    number: "1",
    emoji: "\uD83D\uDCDD",
    title: "Rispondi a 5 domande",
    description:
      "Tipo di propriet\u00E0, posizione, esperienza, target ospiti e budget. In 2 minuti il coach conosce il tuo profilo.",
  },
  {
    number: "2",
    emoji: "\uD83D\uDD0D",
    title: "Analizza il tuo annuncio",
    description:
      "Incolla l'URL Airbnb. L'AI analizza titolo, foto, descrizione, amenities e prezzo. Ricevi uno score 0-100.",
  },
  {
    number: "3",
    emoji: "\uD83D\uDE80",
    title: "Migliora ogni settimana",
    description:
      "Segui i task personalizzati, usa gli strumenti AI e guarda il tuo punteggio salire. Un passo alla volta.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-4 md:px-6 md:py-24 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
            Come funziona
          </p>
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Tre passi per trasformare il tuo annuncio
          </h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-border" />

          <div className="grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-lg mb-4 shadow-soft">
                  {step.number}
                </div>

                <span className="text-3xl mb-3">{step.emoji}</span>
                <h3 className="font-bold text-dark mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
