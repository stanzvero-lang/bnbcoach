"use client";

import { cn } from "@/lib/utils";

export default function TrendArrow({ trend }: { trend: number | null }) {
  if (trend === null) return null;

  const isPositive = trend > 0;
  const isZero = trend === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-semibold",
        isPositive && "text-success",
        !isPositive && !isZero && "text-error",
        isZero && "text-text-secondary"
      )}
    >
      {isPositive && "\u2191"}
      {!isPositive && !isZero && "\u2193"}
      {isZero && "="}
      {isPositive && "+"}
      {trend}
    </span>
  );
}
