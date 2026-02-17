"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function AmenitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Amenity Gap Finder</h1>
        <p className="text-text-secondary mt-1">
          Scopri quali servizi mancano al tuo alloggio rispetto alla concorrenza
        </p>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <Package className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="font-medium">Funzionalità in arrivo</p>
          <p className="text-sm text-text-secondary mt-1">
            Analizza prima il tuo listing per sbloccare il confronto amenities
          </p>
          <Badge variant="secondary" className="mt-3">
            Prossimamente
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
