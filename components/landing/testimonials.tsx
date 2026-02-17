const testimonials = [
  {
    name: "Marco R.",
    location: "Roma",
    property: "Appartamento, Trastevere",
    text: "In 3 settimane il mio annuncio è passato da 45 a 82 punti. I consigli sulle foto hanno fatto la differenza: ho riscattato tutto seguendo le istruzioni e le prenotazioni sono aumentate subito.",
    highlight: "\uD83D\uDCC8 Da 45 a 82 punti",
  },
  {
    name: "Giulia T.",
    location: "Firenze",
    property: "Casa, Centro storico",
    text: "Il generatore di titoli mi ha dato un'idea a cui non avrei mai pensato. Da quando ho cambiato titolo e descrizione, ho il 30% in più di click sul mio annuncio.",
    highlight: "\uD83D\uDE80 +30% click sull'annuncio",
  },
  {
    name: "Andrea M.",
    location: "Milano",
    property: "Stanza, Navigli",
    text: "I task settimanali ti danno la motivazione giusta. Ogni settimana fai 3 cose concrete e vedi i risultati. È come avere un consulente che ti segue senza pagare 500 euro.",
    highlight: "\uD83C\uDFC6 Come un consulente personale",
  },
];

export function LandingTestimonials() {
  return (
    <section className="py-16 px-4 md:px-6 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
            Testimonianze
          </p>
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Host come te, risultati concreti
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-lg border border-border bg-card p-5 md:p-6 flex flex-col shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3 text-base">
                {"\u2B50\u2B50\u2B50\u2B50\u2B50"}
              </div>

              {/* Highlight pill */}
              <span className="inline-block self-start text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-full mb-3">
                {t.highlight}
              </span>

              {/* Quote */}
              <p className="text-sm text-foreground leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {t.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-text-secondary truncate">{t.property}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
