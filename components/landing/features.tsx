import {
  Search,
  Camera,
  Type,
  CheckSquare,
  MessageSquare,
  Package,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Analisi Listing",
    description:
      "Incolla l'URL del tuo annuncio e ricevi uno score 0-100 con breakdown dettagliato per titolo, foto, descrizione, amenities e prezzo. Più 5 consigli prioritizzati per migliorare subito.",
    color: "#FF385C",
    bgColor: "#FFF0F3",
  },
  {
    icon: Camera,
    title: "Photo Coach AI",
    description:
      "Carica le foto del tuo alloggio e l'AI ti dice esattamente cosa va bene, cosa migliorare e come riscattare ogni foto: ora del giorno, angolazione, cosa spostare.",
    color: "#E07912",
    bgColor: "#FFF4E5",
  },
  {
    icon: Type,
    title: "Titoli & Descrizioni",
    description:
      "Genera 5 varianti di titolo e descrizione ottimizzati per SEO, ciascuno con tono diverso: luxury, cozy, modern. Copia con un click e pubblica.",
    color: "#008A05",
    bgColor: "#E8F5E9",
  },
  {
    icon: CheckSquare,
    title: "Task Settimanali",
    description:
      "Ogni settimana ricevi 3 task personalizzati ordinati per impatto. Completa le azioni, traccia i progressi e costruisci una streak vincente.",
    color: "#0288D1",
    bgColor: "#E1F5FE",
  },
  {
    icon: MessageSquare,
    title: "Risposte Recensioni",
    description:
      "Incolla una recensione e ottieni una risposta professionale in un click. Scegli il tono: formale, amichevole o entusiasta.",
    color: "#7B1FA2",
    bgColor: "#F3E5F5",
  },
  {
    icon: Package,
    title: "Amenity Gap Finder",
    description:
      "Confronta i servizi del tuo alloggio con la concorrenza nella tua zona. Scopri cosa aggiungere per aumentare prenotazioni e punteggio.",
    color: "#6D4C41",
    bgColor: "#EFEBE9",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            6 strumenti AI per il tuo Airbnb
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Ogni aspetto del tuo annuncio viene analizzato e ottimizzato.
            Non serve esperienza, ci pensa il coach.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="inline-flex p-3 rounded-lg mb-4"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="font-bold text-dark mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
