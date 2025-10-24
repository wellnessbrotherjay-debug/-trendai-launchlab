export default function MarketplacePage() {
  const brands = [
    { id: "eco", name: "EcoGlow Candle", roi: 3.1, status: "active", investors: 124 },
    { id: "zen", name: "ZenCat Hoodie", roi: 2.9, status: "in_flight", investors: 88 },
  ];
  return (
    <main className="min-h-screen bg-dark text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Brand Marketplace</h1>
        <p className="mt-2 text-white/70">Mock portfolio. ROI updates connect via Supabase.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {brands.map((b) => (
            <div key={b.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="h-24 w-full rounded-lg bg-white/5" />
              <div className="mt-3 font-medium">{b.name}</div>
              <div className="text-sm text-white/70">ROI ×{b.roi} · {b.status} · {b.investors} investors</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

