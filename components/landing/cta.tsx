import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="py-16 px-4 md:px-6 md:py-24 bg-dark">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-4xl mb-4">{"\uD83D\uDE80"}</p>
        <h2 className="text-3xl font-bold text-white md:text-4xl leading-tight">
          Pronto a migliorare
          <br className="hidden sm:block" />
          il tuo annuncio?
        </h2>
        <p className="mt-4 text-lg text-white/60 max-w-md mx-auto">
          Unisciti a migliaia di host che usano l&apos;AI per ottenere più prenotazioni.
        </p>
        <Link href="/signup" className="inline-block mt-8">
          <Button
            size="lg"
            className="text-base px-8 h-12 gap-2 bg-white text-dark hover:bg-white/90 rounded-lg"
          >
            Inizia gratis ora
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="mt-3 text-sm text-white/40">
          Nessuna carta di credito richiesta
        </p>
      </div>
    </section>
  );
}
