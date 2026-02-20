"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 70) return { stroke: "#008A05", text: "text-success" };
  if (score >= 40) return { stroke: "#E07912", text: "text-warning" };
  return { stroke: "#C13515", text: "text-error" };
}

function scoreLabel(score: number) {
  if (score >= 80) return "Eccellente";
  if (score >= 70) return "Ottimo";
  if (score >= 55) return "Buono";
  if (score >= 40) return "Da migliorare";
  return "Critico";
}

export default function ScoreRing({
  score,
  size = 160,
  strokeWidth = 10,
  className,
}: {
  score: number | null;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (score === null) return;
    let frame: number;
    const start = performance.now();
    const duration = 1000;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const displayScore = score !== null ? animatedScore : null;
  const offset =
    displayScore !== null
      ? circumference - (displayScore / 100) * circumference
      : circumference;
  const colors = displayScore !== null ? scoreColor(displayScore) : null;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          {displayScore !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors!.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-4xl font-bold",
              colors?.text || "text-text-secondary"
            )}
          >
            {displayScore !== null ? displayScore : "--"}
          </span>
          <span className="text-xs text-text-secondary">/100</span>
        </div>
      </div>
      {displayScore !== null && (
        <span
          className={cn(
            "text-sm font-semibold",
            colors?.text
          )}
        >
          {scoreLabel(displayScore)}
        </span>
      )}
    </div>
  );
}
