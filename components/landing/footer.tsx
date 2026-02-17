import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-bold text-dark">
              BnBCoach<span className="text-primary">.ai</span>
            </Link>
            <p className="mt-3 text-sm text-text-secondary max-w-xs leading-relaxed">
              Il coach AI che ti guida dall&apos;inizio all&apos;ottimizzazione
              completa del tuo annuncio Airbnb.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-sm text-dark mb-3">Prodotto</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Funzionalità
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Prezzi
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  Come funziona
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-bold text-sm text-dark mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Accedi
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">
                  Registrati
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} BnBCoach.ai &mdash; Tutti i diritti riservati
          </p>
          <p className="text-xs text-text-secondary">
            Non affiliato con Airbnb, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
