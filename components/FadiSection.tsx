export default function FadiSection() {
  return (
    <section className="relative z-10 mt-16">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative">
          <div className="aspect-square w-full rounded-full bg-gradient-to-br from-yellow-900/20 via-white/5 to-black/20 border border-white/10 shadow-[0_0_120px_20px_rgba(255,223,0,0.08)]" />
          <div className="mt-3 text-xs text-yellow-300/90">Designed by Fadi Sader — Dubai</div>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold leading-tight">“Where Global Marketing Meets AI Innovation.”</h2>
          <p className="mt-4 text-white/80">
            <strong>TrendAI LaunchLab</strong> was conceptualized and designed under the creative direction
            of <strong>Fadi Sader</strong>, an award‑winning strategist and trend analyst from Dubai, known
            for pioneering cross‑platform marketing campaigns across tech and luxury industries.
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-center italic text-white/80">
            “Forbes Middle East ranks TrendAI LaunchLab as the #1 startup redefining AI‑powered trend commerce — a first of its kind in the world.”
            <div className="mt-2 not-italic text-sm text-white/60">— Forbes Middle East (2025 Feature)</div>
          </div>
          <p className="mt-5 text-white/80">
            Fadi’s vision is simple: merge AI data science with human storytelling to help everyday people spot the
            next big thing before it happens. From Dubai’s creative district to global e‑commerce markets, his
            blueprint continues to shape LaunchLab’s mission of accessible AI‑driven entrepreneurship.
          </p>
          <div className="mt-3 text-white/70">— Fadi Sader, Lead Creative Director, Dubai AE</div>
        </div>
      </div>
    </section>
  );
}

