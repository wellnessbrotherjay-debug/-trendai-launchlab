"use client";
import { useState, useMemo } from "react";

export default function ReturnCalculator({ platformShare = 0.15 }: { platformShare?: number }) {
  const [units, setUnits] = useState(1);
  const [marginMin, setMarginMin] = useState(0.10);
  const [marginMax, setMarginMax] = useState(0.20);
  const ticket = 200;
  const invest = units * ticket;
  const minAfter = useMemo(() => invest * marginMin * (1 - platformShare), [invest, marginMin, platformShare]);
  const maxAfter = useMemo(() => invest * marginMax * (1 - platformShare), [invest, marginMax, platformShare]);
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-sm text-white/70 mb-2">Return Calculator</div>
      <div className="space-y-3">
        <div className="text-sm">Units ($200 each): {units}</div>
        <input type="range" min={1} max={25} value={units} onChange={(e) => setUnits(Number(e.target.value))} className="w-full" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div>Min margin: {(marginMin * 100).toFixed(0)}%</div>
            <input type="range" min={5} max={30} value={marginMin * 100} onChange={(e) => setMarginMin(Number(e.target.value) / 100)} className="w-full" />
          </div>
          <div>
            <div>Max margin: {(marginMax * 100).toFixed(0)}%</div>
            <input type="range" min={5} max={40} value={marginMax * 100} onChange={(e) => setMarginMax(Number(e.target.value) / 100)} className="w-full" />
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-sm">
          <div className="text-white/70">Estimated return after {Math.round(platformShare * 100)}% platform share</div>
          <div className="mt-1">${minAfter.toFixed(0)} – ${maxAfter.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}

