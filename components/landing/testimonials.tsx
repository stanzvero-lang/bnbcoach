import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marco R.",
    location: "Roma",
    text: "In 3 settimane il mio annuncio è passato da 45 a 82 punti. I consigli sulle foto hanno fatto la differenza: ho riscattato tutto seguendo le istruzioni e le prenotazioni sono aumentate subito.",
    rating: 5,
  },
  {
    name: "Giulia T.",
    location: "Firenze",
    text: "Il generatore di titoli mi ha dato un'idea a cui non avrei mai pensato. Da quando ho cambiato titolo e descrizione, ho il 30% in più di click sul mio annuncio.",
    rating: 5,
  },
  {
    name: "Andrea M.",
    location: "Milano",
    text: "I task settimanali ti danno la motivazione giusta. Ogni settimana fai 3 cose concrete e vedi i risultati. È come avere un consulente che ti segue senza pagare 500 euro.",
    rating: 5,
  },
];

export function LandingTestimonials() {
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Host come te, risultati concreti
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Storie di chi ha già migliorato il proprio annuncio con BnBCoach.ai
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-lg border border-border p-6 shadow-sm"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-warning text-warning"
                  />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
