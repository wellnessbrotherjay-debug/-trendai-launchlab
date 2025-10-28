export default function RiskGauge() {
  const bands = ["Low", "Moderate", "Elevated", "High"];
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-sm text-white/70 mb-2">Risk Gauge</div>
      <div className="grid grid-cols-4 gap-2">
        {bands.map((b, i) => (
          <div key={b} className={`h-8 rounded ${i === 1 ? "bg-neon-teal" : "bg-white/10"}`} />
        ))}
      </div>
      <div className="mt-2 text-xs text-white/60">Legend: Low (left) → High (right). Indicative only; real risk varies by execution.</div>
    </div>
  );
}
