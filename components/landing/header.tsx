import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-xl font-bold text-dark">
          BnBCoach<span className="text-primary">.ai</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
          <a href="#features" className="hover:text-foreground transition-colors">
            Funzionalità
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            Come funziona
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Prezzi
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Accedi
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Inizia gratis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
