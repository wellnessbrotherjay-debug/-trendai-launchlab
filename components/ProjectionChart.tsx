"use client";
import { useMemo } from "react";

type Point = { day: number; revenue: number };

export default function ProjectionChart({ points }: { points?: Point[] }) {
  const data = useMemo(() => points ?? Array.from({ length: 14 }).map((_, i) => ({ day: i + 1, revenue: Math.round(200 + i * 80 + Math.random() * 60) })), [points]);
  const max = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="h-48 w-full">
        <svg viewBox="0 0 100 40" className="h-full w-full">
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#6C5CE7" />
              <stop offset="100%" stopColor="#00D1B2" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="url(#grad)"
            strokeWidth="1.5"
            points={data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 40 - (d.revenue / max) * 36 - 2;
                return `${x},${y}`;
              })
              .join(" ")}
          />
        </svg>
      </div>
      <div className="mt-2 text-xs text-white/60">Our model updates daily from velocity & ad spend signals.</div>
    </div>
  );
}

