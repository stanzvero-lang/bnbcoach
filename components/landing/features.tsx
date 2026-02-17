import {
  Search,
  Camera,
  Type,
  CheckSquare,
  MessageSquare,
  Package,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Analisi Listing",
    description:
      "Incolla l'URL del tuo annuncio e ricevi uno score 0-100 con breakdown per titolo, foto, descrizione, amenities e prezzo. Più 5 consigli per migliorare subito.",
    color: "#FF385C",
    bgColor: "#FFF0F3",
  },
  {
    icon: Camera,
    title: "Photo Coach AI",
    description:
      "Carica le foto e l'AI ti dice cosa va bene, cosa migliorare e come riscattare: ora del giorno, angolazione, cosa spostare.",
    color: "#E07912",
    bgColor: "#FFF4E5",
  },
  {
    icon: Type,
    title: "Titoli & Descrizioni",
    description:
      "5 varianti di titolo e descrizione ottimizzati SEO. Toni diversi: luxury, cozy, modern. Copia e pubblica con un click.",
    color: "#008A05",
    bgColor: "#E8F5E9",
  },
  {
    icon: CheckSquare,
    title: "Task Settimanali",
    description:
      "3 task personalizzati a settimana, ordinati per impatto. Traccia i progressi e costruisci una streak vincente.",
    color: "#0288D1",
    bgColor: "#E1F5FE",
  },
  {
    icon: MessageSquare,
    title: "Risposte Recensioni",
    description:
      "Incolla una recensione, scegli il tono e ottieni una risposta professionale da copiare in un click.",
    color: "#7B1FA2",
    bgColor: "#F3E5F5",
  },
  {
    icon: Package,
    title: "Amenity Gap Finder",
    description:
      "Confronta i servizi del tuo alloggio con la concorrenza. Scopri cosa aggiungere per più prenotazioni.",
    color: "#455A64",
    bgColor: "#ECEFF1",
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
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-lg border border-border bg-card p-5 md:p-6 hover:shadow-md hover:border-border/80 transition-all"
              >
                <div
                  className="inline-flex p-2.5 rounded-lg mb-4"
                  style={{ backgroundColor: f.bgColor }}
                >
                  <Icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-dark mb-1.5">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {f.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Scopri di più
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
