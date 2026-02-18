"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, LogOut } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-text-secondary mt-1">Gestisci il tuo account</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Profilo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-text-secondary">
            Le informazioni del profilo vengono dal tuo onboarding.
          </p>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Abbonamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Piano attuale</span>
            <Badge>Free</Badge>
          </div>
          <p className="text-sm text-text-secondary">
            20 analisi gratuite. Passa a Pro per analisi illimitate.
          </p>
          <Button variant="outline" className="w-full">
            Upgrade a Pro
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-error hover:text-error"
        onClick={handleLogout}
        disabled={loading}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {loading ? "Uscita..." : "Esci"}
      </Button>
    </div>
  );
}
