"use client";
import { useParams } from "next/navigation";
export default function OpsPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="min-h-screen bg-dark text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Operations · Round {String(id).slice(0, 6)}</h1>
        <p className="mt-2 text-white/70">Milestones, KPIs, ledger, payouts, activity log (mock).</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Milestones (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">KPIs + Charts (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Ledger (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Payouts (mock)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">Activity Log (mock)</div>
        </div>
      </div>
    </main>
  );
}

