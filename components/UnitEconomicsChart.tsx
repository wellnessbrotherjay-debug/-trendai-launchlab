"use client";
export default function UnitEconomicsChart({ unitCost = 8, shipping = 2, fees = 3, ad = 4, ops = 2, price = 25 }: { unitCost?: number; shipping?: number; fees?: number; ad?: number; ops?: number; price?: number }) {
  const costs = [
    { label: "COGS", value: unitCost },
    { label: "Shipping", value: shipping },
    { label: "Fees", value: fees },
    { label: "Ads", value: ad },
    { label: "Ops", value: ops },
  ];
  const totalCost = costs.reduce((s, c) => s + c.value, 0);
  const net = price - totalCost;
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-sm text-white/70 mb-2">Unit Economics</div>
      <div className="mb-3 text-xs text-white/60">Legend: purple = cost bars; teal = net.</div>
      <div className="space-y-2">
        {costs.map((c) => (
          <div key={c.label} className="text-sm flex items-center gap-3">
            <div className="w-28 text-white/70">{c.label}</div>
            <div className="flex-1 h-2 bg-white/10 rounded">
              <div className="h-2 rounded bg-neon-purple" style={{ width: `${Math.min(100, (c.value / price) * 100)}%` }} />
            </div>
            <div className="w-14 text-right text-white/80">${c.value.toFixed(2)}</div>
          </div>
        ))}
        <div className="text-sm flex items-center gap-3 mt-3">
          <div className="w-28 text-white/70">Net</div>
          <div className="flex-1 h-2 bg-white/10 rounded">
            <div className="h-2 rounded bg-neon-teal" style={{ width: `${Math.min(100, (net / price) * 100)}%` }} />
          </div>
          <div className="w-14 text-right text-white">${net.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
