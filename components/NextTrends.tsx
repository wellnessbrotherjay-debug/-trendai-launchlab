"use client";
import { useEffect, useState } from "react";
import TrendCardExpanded from "./TrendCardExpanded";

export default function NextTrends() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/trends');
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        setItems([]);
      }
    })();
  }, []);
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-sm text-white/70 mb-2">Next Trends</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it, idx) => (
          <TrendCardExpanded key={idx} item={it} />
        ))}
      </div>
    </div>
  );
}

