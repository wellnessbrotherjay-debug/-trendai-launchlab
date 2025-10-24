"use client";
/**
 * Env setup (.env.local):
 * NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient, type PostgrestSingleResponse } from "@supabase/supabase-js";
import ReserveModal from "../components/ReserveModal";
import TrendCarousel from "../components/TrendCarousel";
import ProjectionChart from "../components/ProjectionChart";

type Round = {
  id: string;
  name: string;
  soft_cap: number;
  raised: number;
  investors: number;
  roi: number;
  status: string;
  countdown_end?: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function Page() {
  // Simulated percent for text only (bar uses CSS animation)
  const [pct, setPct] = useState(42);
  useEffect(() => {
    let dir = 1;
    const id = setInterval(() => {
      setPct((p) => {
        const next = p + dir * (Math.random() * 2 + 0.5);
        if (next >= 92) { dir = -1; return 92; }
        if (next <= 18) { dir = 1; return 18; }
        return next;
      });
    }, 160);
    return () => clearInterval(id);
  }, []);

  const [round, setRound] = useState<Round | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const subMounted = useRef(false);

  // Fetch latest round on mount
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!supabase) {
          // Fallback mock if env not set
          if (active) {
            setRound({
              id: "mock",
              name: "Ramen Cat Tee",
              soft_cap: 10000,
              raised: Math.round((pct / 100) * 10000),
              investors: 42,
              roi: 21.6,
              status: "Active",
            });
            setLoading(false);
          }
          return;
        }
        const { data, error }: PostgrestSingleResponse<Round[]> = await supabase
          .from("rounds")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);
        if (error) throw error;
        if (active) {
          setRound((data && data[0]) || null);
          setLoading(false);
        }
      } catch (e: any) {
        if (active) {
          // Graceful fallback when table doesn't exist (404) or other setup issues
          setError(e?.message || "Failed to load round");
          setRound({
            id: "mock",
            name: "Ramen Cat Tee",
            soft_cap: 10000,
            raised: Math.round((pct / 100) * 10000),
            investors: 21,
            roi: 2.3,
            status: "Active",
          });
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [pct]);

  // Realtime subscription
  useEffect(() => {
    if (!supabase || subMounted.current) return;
    const channel = supabase
      .channel("public:rounds")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds" },
        (payload) => {
          const next = payload.new as Round | null;
          if (next) setRound(next);
        }
      )
      .subscribe();
    subMounted.current = true;
    return () => {
      supabase.removeChannel(channel);
      subMounted.current = false;
    };
  }, []);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const softCap = round?.soft_cap ?? 250_000;
  const raised = round?.raised ?? Math.round((pct / 100) * softCap);
  const investors = round?.investors ?? 0;
  const roundName = round?.name ?? "Loading…";
  const status = round?.status ?? (loading ? "Loading" : "Collecting");
  const roiPct = round?.roi ?? 0;

  const progressPct = useMemo(() => {
    if (!softCap) return 0;
    const val = Math.max(0, Math.min(100, (raised / softCap) * 100));
    return val;
  }, [raised, softCap]);

  const endsAt = round?.countdown_end ? new Date(round.countdown_end).getTime() : null;
  const remainingMs = endsAt ? Math.max(0, endsAt - now) : null;
  const expired = remainingMs !== null && remainingMs <= 0;
  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const roiRows = useMemo(
    () => [
      { trend: roundName, confidence: `${Math.max(72, Math.min(97, Math.round(roiPct + 68)))}%`, softCap: `$${formatNumber(softCap)}`, estRoi: `${roiPct.toFixed(1)}%`, horizon: "14 days" },
      { trend: "AI Meeting Note Device", confidence: "88%", softCap: "$120k", estRoi: "19.7%", horizon: "14 days" },
      { trend: "Silent Desk Treadmill", confidence: "84%", softCap: "$200k", estRoi: "22.3%", horizon: "21 days" },
      { trend: "MagSafe Power Folio", confidence: "81%", softCap: "$95k", estRoi: "17.2%", horizon: "14 days" },
    ],
    [roundName, roiPct, softCap]
  );

  const steps = [
    { title: "Detect", desc: "Spotter‑X AI identifies breakout product trends across social graphs." },
    { title: "Build", desc: "We validate suppliers, margins, and launch readiness with partners." },
    { title: "Invest", desc: "Join a 24‑hour soft‑cap round with $200–$1000 tickets." },
    { title: "Launch", desc: "Products deploy with creative, landing pages, and distribution channels." },
    { title: "Distribute", desc: "Scale via content, affiliates, and retail pilots where applicable." },
  ];

  return (
    <main className="min-h-screen bg-dark text-white overflow-hidden">
      <ReserveModal round={round} open={modalOpen} onClose={() => setModalOpen(false)} />
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-20 bg-hero-radials" aria-hidden />
        {/* Floating particles */}
        <span className="absolute left-[10%] top-[15%] h-[10px] w-[10px] rounded-full bg-neon-purple opacity-70 animate-pulse" aria-hidden />
        <span className="absolute left-[25%] top-[70%] h-[8px] w-[8px] rounded-full bg-neon-teal opacity-70 animate-pulse" aria-hidden />
        <span className="absolute left-[65%] top-[20%] h-[12px] w-[12px] rounded-full bg-neon-purple opacity-70 animate-pulse" aria-hidden />
        <span className="absolute left-[80%] top-[60%] h-[9px] w-[9px] rounded-full bg-neon-teal opacity-70 animate-pulse" aria-hidden />
        <span className="absolute left-[40%] top-[85%] h-[7px] w-[7px] rounded-full bg-neon-purple opacity-70 animate-pulse" aria-hidden />
        {/* Vertical neon lines */}
        <span className="absolute inset-y-0 left-[15%] w-px bg-gradient-to-b from-transparent via-neon-purple/20 to-transparent" aria-hidden />
        <span className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-neon-purple/20 to-transparent" aria-hidden />
        <span className="absolute inset-y-0 left-[85%] w-px bg-gradient-to-b from-transparent via-neon-purple/20 to-transparent" aria-hidden />
      </div>

      {/* Top glow */}
      <div className="absolute -top-32 left-1/2 h-64 w-[50rem] -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-gradient-to-r from-neon-purple to-neon-teal" />

      {/* Nav */}
      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-neon-purple to-neon-teal glow-ring" />
            <span className="text-lg font-semibold tracking-wide">TrendAI LaunchLab</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <span className="text-white/70 hover:text-white transition">How it works</span>
            <span className="text-white/70 hover:text-white transition">Rounds</span>
            <span className="text-white/70 hover:text-white transition">Security</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-14 md:pt-16 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: copy + progress */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-neon-teal animate-pulse" />
                <span className="text-xs text-white/70">AI‑Powered Funding Rounds</span>
              </div>
              <h1 className="mt-5 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
                Invest in the Future,{" "}
                <span className="bg-gradient-to-r from-neon-purple to-neon-teal bg-clip-text text-transparent">14 Days at a Time</span>
              </h1>
              <p className="mt-4 text-white/70 max-w-xl">Join 24‑hour AI‑powered funding rounds. No charge until soft‑cap is met.</p>

              {/* Round name */}
              <div className="mt-4 text-sm text-white/60">
                Current Round: <span className="text-white/90 font-medium">{roundName}</span>
              </div>

              <div className="mt-8 rounded-2xl glass p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-white/60">Soft‑Cap Progress</p>
                    {loading ? (
                      <div className="mt-2 h-6 w-56 animate-pulse rounded bg-white/10" />
                    ) : (
                      <p className="mt-1 text-xl font-semibold tracking-wide transition-all">
                        ${formatNumber(raised)} <span className="text-sm text-white/50">of ${formatNumber(softCap)}</span>
                      </p>
                    )}
                    <p className="mt-2 text-xs text-white/50">Data auto‑refreshes in real‑time via Supabase 🔄</p>
                    {endsAt && (
                      <p className="mt-2 text-xs text-white/70">
                        Time remaining: {expired ? "00:00:00" : fmt(remainingMs!)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">Round Status</p>
                    {loading ? (
                      <span className="mt-1 inline-block h-6 w-28 animate-pulse rounded bg-white/10" />
                    ) : (
                      <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-neon-teal animate-ping" /> {status}
                      </span>
                    )}
                    {!!softCap && raised >= softCap && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-neon-teal/10 px-2 py-1 text-[10px] text-neon-teal">Soft Cap Reached</div>
                    )}
                  </div>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  {loading ? (
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-white/20" />
                  ) : (
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-teal transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                    />
                  )}
                </div>
                <div className="mt-2 text-right text-xs text-white/60">{loading ? "--" : `${progressPct.toFixed(0)}%`}</div>

                <button
                  onClick={() => setModalOpen(true)}
                  disabled={expired}
                  className="mt-5 w-full md:w-auto group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-teal px-5 py-3 font-medium tracking-wide text-dark transition-transform duration-300 hover:scale-[1.02] focus:scale-[1.01] focus:outline-none disabled:opacity-50"
                >
                  <span className="absolute -inset-0 rounded-xl opacity-40 blur-md transition group-hover:opacity-70 bg-gradient-to-r from-neon-purple to-neon-teal" />
                  <span className="relative">{expired ? "Round Ended" : "Join the Round"}</span>
                  <svg className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="#0f1220" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="mt-3 text-xs text-white/60">
                  {loading ? (
                    <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                  ) : (
                    <>
                      <span>{investors} investors</span>
                      <span className="mx-2">·</span>
                      <span>ROI forecast: {roiPct.toFixed(1)}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: cinematic visual (placeholder) */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl from-neon-purple/25 to-neon-teal/25 bg-gradient-to-br blur-2xl" />
              <div className="relative rounded-3xl glass p-6 backdrop-blur-2xl">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-panel-grad">
                  <div className="relative h-full w-full flex items-center justify-center">
                    <div className="absolute h-64 w-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_50%)] blur-xl" />
                    <div className="relative h-48 w-48 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center">
                      <div className="h-40 w-40 rounded-full bg-conic-core animate-slowspin" />
                      <div className="absolute h-24 w-24 rounded-full bg-dark border border-white/10 shadow-inner" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/60">
                      <span>Neural trend synthesis</span>
                      <span>v2.3 · Spotter‑X</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/60">
                  Replace with a <code className="text-white/80">video</code> or <code className="text-white/80">&lt;lottie-player&gt;</code> embed for production.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Trend Preview (#9) */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-14">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold">Next Trend Preview</h2>
            <span className="text-xs text-white/60">Top 3 by AI Confidence</span>
          </div>
          <TrendCarousel />
        </div>
      </section>

      {/* 30‑Day ROI Timeline (#10) */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="text-lg md:text-xl font-semibold">30‑Day ROI Timeline</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              "AI spots trend",
              "Product drafted",
              "Round opens",
              "Marketing launch",
              "Profit shared",
            ].map((t, i) => (
              <li key={t} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">{i + 1}</span>
                <div>{t}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 360° Execution System (#16) */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="text-2xl font-semibold">From Viral Idea to Global Sales — All Under One Roof</h2>
          <p className="mt-2 text-white/60 max-w-2xl">Six pillars that turn trends into brands.</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ["AI Trend Discovery", "Spotter‑X mines 20M+ signals daily."],
              ["Product Design & Branding", "Identity, packaging, landing pages."],
              ["Supplier Integration", "MOQ, QA, logistics, compliance."],
              ["Marketing Engine", "Creators, paid, UGC, affiliates."],
              ["Sales & Analytics", "Funnels, CAC/LTV, dashboards."],
              ["Investor Profit Sharing", "Transparent settlements in 30 days."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
          <button className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">See How a Trend Becomes a Brand</button>
        </div>
      </section>

      {/* Projection Engine Chart (#11) */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="text-lg md:text-xl font-semibold">Projection Engine</h2>
          <ProjectionChart />
        </div>
      </section>

      {/* Spotter‑X Visualization (#12) */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="text-lg md:text-xl font-semibold">Inside Spotter‑X</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">Sources</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">Neural Core</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">LaunchLab Output</div>
          </div>
          <p className="mt-2 text-xs text-white/60">Spotter‑X analyzes 20M+ data points daily; top 1% reach LaunchLab.</p>
        </div>
      </section>

      {/* Trust & Transparency (#14) */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="text-lg md:text-xl font-semibold">Trust & Transparency 2.0</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Stripe Pre‑Auth Vault", "Payments flip on only when enabled."],
              ["Live Supabase Tracking", "Every update visible in real‑time."],
              ["Refund Guarantee", "Rounds that miss soft‑cap won’t charge."],
            ].map(([t, d]) => (
              <div key={t as string} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-white/70">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">Test Mode · Demo funds only</div>
        </div>
      </section>

      {/* CTA (#15) */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-2xl font-semibold">Ready to reserve your seat in the next viral trend?</h2>
            <p className="mt-2 text-white/70">Join the next 24 h AI‑powered round and be part of the future.</p>
            <button onClick={() => setModalOpen(true)} className="mx-auto mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-purple to-neon-teal px-5 py-3 font-medium text-dark">Reserve Your Spot</button>
          </div>
        </div>
      </section>

      {/* ROI Forecast */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-14">
          <div className="rounded-3xl glass p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">Dynamic ROI Forecast</h2>
              <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">Simulated for demo</span>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/60">
                    <th className="px-3 py-2 font-medium">Trend</th>
                    <th className="px-3 py-2 font-medium">AI Confidence</th>
                    <th className="px-3 py-2 font-medium">Soft Cap</th>
                    <th className="px-3 py-2 font-medium">Est. ROI</th>
                    <th className="px-3 py-2 font-medium">Horizon</th>
                  </tr>
                </thead>
                <tbody>
                  {roiRows.map((r) => (
                    <tr key={r.trend} className="group transition-colors hover:bg-white/10/60">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-neon-teal group-hover:animate-ping" />
                          <span className="font-medium">{r.trend}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-white/80">{r.confidence}</td>
                      <td className="px-3 py-3 text-white/80">{r.softCap}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs">
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-neon-purple" />
                          {r.estRoi}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-white/60">{r.horizon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <p className="mt-2 text-white/60 max-w-2xl">Five steps from detection to distribution. Transparent, time‑boxed, and data‑driven.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((s, idx) => (
              <div key={s.title} className="group relative overflow-hidden rounded-2xl glass p-5 transition-transform hover:-translate-y-0.5">
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-30 transition-opacity bg-gradient-to-br from-neon-purple to-neon-teal blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">0{idx + 1}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-purple group-hover:bg-neon-teal transition" />
                  </div>
                  <h3 className="mt-3 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/60">© 2025 TrendAI LaunchLab — Powered by Spotter‑X AI</div>
          <div className="text-xs text-white/40">Security | Terms | Privacy</div>
        </div>
      </footer>
    </main>
  );
}

function formatNumber(n: number) {
  return n.toLocaleString();
}
