export default function FundingTimeline() {
  const steps = ["Detect", "Validate", "Back", "Launch", "Share"];
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-sm text-white/70 mb-2">Production Timeline</div>
      <div className="flex items-center gap-3 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3 whitespace-nowrap">
            <div className="px-3 py-1 rounded-full bg-white/10 text-sm">{s}</div>
            {i < steps.length - 1 && <div className="w-10 h-px bg-white/20" />}
          </div>
        ))}
      </div>
    </div>
  );
}

