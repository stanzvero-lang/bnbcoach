"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Devo già avere un annuncio Airbnb per usare BnBCoach?",
    a: "No! BnBCoach è perfetto sia per chi sta creando il primo annuncio sia per chi vuole ottimizzare uno esistente. L'onboarding ti guida in entrambi i casi.",
  },
  {
    q: "L'AI genera le foto al posto mio?",
    a: "No, BnBCoach non genera immagini artificiali. Il Photo Coach analizza le tue foto reali e ti dà istruzioni precise per riscattarle meglio: ora del giorno, angolazione, cosa spostare, come migliorare la luce.",
  },
  {
    q: "In che lingua funziona?",
    a: "BnBCoach funziona in italiano. Tutti i consigli, titoli, descrizioni e risposte alle recensioni sono generati in italiano. Il supporto per altre lingue arriverà presto.",
  },
  {
    q: "Posso usare i testi generati direttamente su Airbnb?",
    a: "Assolutamente sì. I titoli e le descrizioni generate sono pronti per essere copiati e incollati nel tuo annuncio. Ti consigliamo di personalizzarli leggermente per renderli ancora più unici.",
  },
  {
    q: "Come funzionano i task settimanali?",
    a: "Ogni lunedì ricevi 3 task personalizzati in base al tuo profilo e punteggio attuale. Ogni task ha una descrizione chiara, il tempo stimato e l'impatto previsto. Completali per migliorare il tuo annuncio progressivamente.",
  },
  {
    q: "Posso cancellare l'abbonamento Pro in qualsiasi momento?",
    a: "Sì, puoi cancellare quando vuoi dalla pagina Impostazioni. Il piano Free resta sempre disponibile con le sue funzionalità base.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 px-4 md:px-6 md:py-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
            FAQ
          </p>
          <h2 className="text-3xl font-bold text-dark md:text-4xl">
            Domande frequenti
          </h2>
        </div>

        <div className="divide-y divide-border border-t border-b border-border">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-4 md:py-5 text-left gap-4"
              >
                <span className="font-medium text-sm md:text-base text-dark">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-text-secondary shrink-0 transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === i ? "max-h-40 pb-4 md:pb-5" : "max-h-0"
                )}
              >
                <p className="text-sm text-text-secondary leading-relaxed pr-8">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
