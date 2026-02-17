"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Camera, CheckSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/analyze", label: "Analizza", icon: Search },
  { href: "/photos", label: "Foto", icon: Camera },
  { href: "/tasks", label: "Task", icon: CheckSquare },
  { href: "/settings", label: "Profilo", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-3">
        <h1 className="text-lg font-bold text-dark">
          BnBCoach<span className="text-primary">.ai</span>
        </h1>
      </header>

      {/* Page content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors",
                  isActive ? "text-primary" : "text-text-secondary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
