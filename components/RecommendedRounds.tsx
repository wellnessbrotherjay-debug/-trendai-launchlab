"use client";
import { useMemo, useState } from "react";

export default function RecommendedRounds() {
  const [risk, setRisk] = useState<"conservative" | "balanced" | "aggressive">("balanced");
  const rounds = useMemo(
    () => [
      { id: "eco", name: "EcoGlow Candle", roi: 3.1, risk: "balanced" },
      { id: "zen", name: "ZenCat Hoodie", roi: 3.0, risk: "aggressive" },
      { id: "bottle", name: "SmartGrip Bottle", roi: 2.7, risk: "conservative" },
    ],
    []
  );
  const list = rounds.filter((r) => r.risk === risk);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recommended Rounds</h3>
        <select value={risk} onChange={(e) => setRisk(e.target.value as any)} className="rounded border border-white/10 bg-transparent px-2 py-1 text-sm">
          <option value="conservative">Conservative</option>
          <option value="balanced">Balanced</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium">{r.name}</div>
            <div className="text-sm text-white/70">Est. ROI ×{r.roi}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

