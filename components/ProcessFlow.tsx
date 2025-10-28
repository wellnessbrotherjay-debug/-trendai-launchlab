export default function ProcessFlow() {
  const steps = [
    { title: "Detect", desc: "AI trend scanning" },
    { title: "Validate", desc: "Suppliers + margins" },
    { title: "Back", desc: "$200 tickets" },
    { title: "Launch", desc: "Go to market" },
    { title: "Share", desc: "Growth loops" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-sm text-white/70 mb-2">Process</div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-xl bg-white/5 p-3">
            <div className="font-medium">{s.title}</div>
            <div className="text-sm text-white/70">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

