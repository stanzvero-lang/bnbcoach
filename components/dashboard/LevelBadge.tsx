"use client";

import { cn } from "@/lib/utils";

const LEVELS: Record<string, { label: string; icon: string; color: string }> = {
  starter: { label: "Starter", icon: "\uD83C\uDF31", color: "bg-warning/10 text-warning" },
  growing: { label: "Growing", icon: "\uD83C\uDF3F", color: "bg-success/10 text-success" },
  thriving: { label: "Thriving", icon: "\uD83C\uDF33", color: "bg-success/10 text-success" },
};

export default function LevelBadge({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  const info = LEVELS[level] || LEVELS.starter;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        info.color,
        className
      )}
    >
      {info.icon} {info.label}
    </span>
  );
}
