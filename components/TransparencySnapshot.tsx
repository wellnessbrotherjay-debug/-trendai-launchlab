export default function TransparencySnapshot() {
  const items = [
    { k: "Realtime Tracking", v: "Supabase + policies" },
    { k: "Mock Funds", v: "No charge until soft‑cap" },
    { k: "Audit Trail", v: "Every action logged" },
  ];
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <h3 className="font-semibold">Transparency Snapshot</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <div key={i.k} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm text-white/60">{i.k}</div>
            <div className="font-medium">{i.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

