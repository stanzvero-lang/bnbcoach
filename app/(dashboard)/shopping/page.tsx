"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function ShoppingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shopping List</h1>
        <p className="text-text-secondary mt-1">
          Lista della spesa stanza per stanza per il tuo alloggio
        </p>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <ShoppingCart className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="font-medium">Funzionalità in arrivo</p>
          <p className="text-sm text-text-secondary mt-1">
            Completa l&apos;analisi del tuo listing per ricevere una shopping list personalizzata
          </p>
          <Badge variant="secondary" className="mt-3">
            Prossimamente
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
