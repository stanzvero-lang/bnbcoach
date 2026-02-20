"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    href: "/analyze",
    label: "Analisi Listing",
    description: "Score e consigli AI",
    icon: "\uD83D\uDD0D",
    color: "#FF385C",
  },
  {
    href: "/titles",
    label: "Titoli & Testi",
    description: "Genera varianti ottimizzate",
    icon: "\u270D\uFE0F",
    color: "#8B5CF6",
  },
  {
    href: "/photos",
    label: "Photo Coach",
    description: "Migliora le tue foto",
    icon: "\uD83D\uDCF8",
    color: "#06B6D4",
  },
  {
    href: "/tasks",
    label: "Task Settimanali",
    description: "Piano d'azione guidato",
    icon: "\u2705",
    color: "#6366F1",
  },
  {
    href: "/reviews",
    label: "Recensioni",
    description: "Risposte professionali AI",
    icon: "\u2B50",
    color: "#F59E0B",
  },
  {
    href: "/amenities",
    label: "Amenities",
    description: "Gap analysis servizi",
    icon: "\uD83D\uDECB\uFE0F",
    color: "#10B981",
  },
];

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FEATURES.map((f) => (
        <Link key={f.href} href={f.href}>
          <Card className="hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-start gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: f.color + "15" }}
              >
                {f.icon}
              </div>
              <span className="font-medium text-sm text-dark">{f.label}</span>
              <span className="text-xs text-text-secondary">{f.description}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
