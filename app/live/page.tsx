export default function LivePage() {
  return (
    <main className="min-h-screen bg-dark text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Live Campaign Viewer</h1>
        <p className="mt-2 text-white/70">Mock data mode — connect Edge Functions for live metrics.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">KPI Strip (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">Reach vs Conversions Chart (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Spend by Channel Pie (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">ROI Gauge (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">Live Order Feed (mock)</div>
        </div>
      </div>
    </main>
  );
}

