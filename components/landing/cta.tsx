import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="py-20 px-4 md:px-6 bg-dark">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Pronto a migliorare il tuo annuncio?
        </h2>
        <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
          Unisciti agli host che stanno già usando l&apos;AI per ottenere più
          prenotazioni e recensioni migliori.
        </p>
        <Link href="/signup" className="inline-block mt-8">
          <Button
            size="lg"
            className="text-base px-8 h-12 gap-2 bg-white text-dark hover:bg-white/90"
          >
            Inizia gratis ora
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="mt-4 text-sm text-white/50">
          Nessuna carta di credito richiesta
        </p>
      </div>
    </section>
  );
}
