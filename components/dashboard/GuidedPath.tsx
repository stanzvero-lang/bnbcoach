"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Prepara le foto", href: "/photos", icon: "\uD83D\uDCF8" },
  { label: "Scrivi il titolo", href: "/titles", icon: "\u270D\uFE0F" },
  { label: "Scrivi la descrizione", href: "/titles", icon: "\uD83D\uDCDD" },
  { label: "Scegli i servizi", href: "/amenities", icon: "\uD83D\uDECB\uFE0F" },
  { label: "Imposta il prezzo", href: "/pricing-coach", icon: "\uD83D\uDCB0" },
  { label: "Pubblica su Airbnb", href: "#", icon: "\uD83C\uDF10" },
  { label: "Analizza il listing", href: "/analyze", icon: "\uD83D\uDD0D" },
];

export default function GuidedPath() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-dark">Il tuo percorso</h2>
      <p className="text-sm text-text-secondary mb-4">
        Non hai ancora un listing? Segui questi passi per crearne uno perfetto.
      </p>
      <div className="space-y-2">
        {STEPS.map((step, i) => (
          <Link
            key={i}
            href={step.href}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border border-border bg-card",
              "hover:border-primary/30 hover:shadow-soft transition-all"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-sm font-bold text-text-secondary">
              {i + 1}
            </div>
            <span className="text-lg">{step.icon}</span>
            <span className="text-sm font-medium text-dark flex-1">
              {step.label}
            </span>
            <span className="text-text-secondary text-sm">&rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
