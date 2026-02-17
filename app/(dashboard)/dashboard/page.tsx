import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Search,
  Camera,
  Type,
  MessageSquare,
  Package,
  ShoppingCart,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Il tuo punteggio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">--</div>
            <div className="flex-1">
              <Progress value={0} />
              <p className="text-sm text-text-secondary mt-2">
                Analizza il tuo listing per ottenere il punteggio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Strumenti</h2>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-start gap-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: tool.bgColor }}
                  >
                    <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                  </div>
                  <span className="font-medium text-sm">{tool.label}</span>
                  <span className="text-xs text-text-secondary">
                    {tool.description}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Weekly Tasks Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Task della settimana</CardTitle>
          <Badge variant="secondary">0/3</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Completa l&apos;onboarding per ricevere i tuoi primi task personalizzati.
          </p>
          <Link
            href="/tasks"
            className="text-sm text-primary font-medium mt-2 inline-block"
          >
            Vai ai task →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

const tools = [
  {
    href: "/analyze",
    label: "Analisi Listing",
    description: "Score e consigli",
    icon: Search,
    color: "#FF385C",
    bgColor: "#FFF0F3",
  },
  {
    href: "/photos",
    label: "Photo Coach",
    description: "Migliora le foto",
    icon: Camera,
    color: "#E07912",
    bgColor: "#FFF4E5",
  },
  {
    href: "/titles",
    label: "Titoli & Testi",
    description: "Genera varianti",
    icon: Type,
    color: "#008A05",
    bgColor: "#E8F5E9",
  },
  {
    href: "/reviews",
    label: "Recensioni",
    description: "Risposte AI",
    icon: MessageSquare,
    color: "#1A1A2E",
    bgColor: "#EDE7F6",
  },
  {
    href: "/amenities",
    label: "Amenities",
    description: "Gap analysis",
    icon: Package,
    color: "#0288D1",
    bgColor: "#E1F5FE",
  },
  {
    href: "/shopping",
    label: "Shopping List",
    description: "Cosa comprare",
    icon: ShoppingCart,
    color: "#6D4C41",
    bgColor: "#EFEBE9",
  },
];
