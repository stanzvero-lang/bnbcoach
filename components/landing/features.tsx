import { ArrowRight } from "lucide-react";

const features = [
  {
    emoji: "\uD83D\uDD0D",
    title: "Analisi Listing",
    description:
      "Incolla l'URL del tuo annuncio e ricevi uno score 0-100 con breakdown per titolo, foto, descrizione, amenities e prezzo. Pi\u00F9 5 consigli per migliorare subito.",
  },
  {
    emoji: "\uD83D\uDCF8",
    title: "Photo Coach AI",
    description:
      "Carica le foto e l'AI ti dice cosa va bene, cosa migliorare e come riscattare: ora del giorno, angolazione, cosa spostare.",
  },
  {
    emoji: "\u270D\uFE0F",
    title: "Titoli & Descrizioni",
    description:
      "5 varianti di titolo e descrizione ottimizzati SEO. Toni diversi: luxury, cozy, modern. Copia e pubblica con un click.",
  },
  {
    emoji: "\uD83D\uDCCB",
    title: "Task Settimanali",
    description:
      "3 task personalizzati a settimana, ordinati per impatto. Traccia i progressi e costruisci una streak vincente.",
  },
  {
    emoji: "\u2B50",
    title: "Risposte Recensioni",
    description:
      "Incolla una recensione, scegli il tono e ottieni una risposta professionale da copiare in un click.",
  },
  {
    emoji: "\uD83D\uDECB\uFE0F",
    title: "Amenity Gap Finder",
    description:
      "Confronta i servizi del tuo alloggio con la concorrenza. Scopri cosa aggiungere per pi\u00F9 prenotazioni.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-16 px-4 md:px-6 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
            Strumenti
          </p>
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Tutto quello che serve al tuo Airbnb
          </h2>
          <p className="mt-4 text-text-secondary max-w-lg mx-auto">
            6 strumenti AI progettati per migliorare ogni aspetto del tuo annuncio. Non serve esperienza.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-lg border border-border bg-card p-5 md:p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-4xl block mb-4">{f.emoji}</span>
              <h3 className="font-bold text-dark mb-1.5">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {f.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Scopri di pi\u00F9
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
