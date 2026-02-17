"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Funzionalità" },
  { href: "#how-it-works", label: "Come funziona" },
  { href: "#pricing", label: "Prezzi" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14 md:h-16 md:px-6">
        <Link href="/" className="text-xl font-bold text-dark shrink-0">
          BnBCoach<span className="text-primary">.ai</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-text-secondary hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Accedi</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Inizia gratis</Button>
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 -mr-2 text-text-secondary"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 bg-background",
          open ? "max-h-80 border-t border-border" : "max-h-0"
        )}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-text-secondary hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border flex gap-3">
            <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Accedi</Button>
            </Link>
            <Link href="/signup" className="flex-1" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">Inizia gratis</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
