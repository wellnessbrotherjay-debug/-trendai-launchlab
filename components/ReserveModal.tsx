"use client";
import { useState } from "react";

export default function ReserveModal({ round, open, onClose }: { round: any; open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState<number>(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return null;

  const endsAt = round?.countdown_end ? new Date(round.countdown_end).getTime() : null;
  const expired = endsAt ? Date.now() >= endsAt : false;

  const reserve = async () => {
    if (expired) {
      setError("Round closed");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roundId: round?.id, amount }),
      });
      const data = await res
        .json()
        .catch(() => ({ message: "Unexpected response" }));
      if (!res.ok) throw new Error(data?.message || "Reserve failed");
      onClose();
    } catch (e: any) {
      setError(e?.message || "Error reserving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl text-white">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Reserve your spot</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <p className="mt-1 text-sm text-white/70">No payment required. Reservation increases the live soft‑cap progress.</p>

        <label className="mt-4 block text-sm text-white/70">Amount</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[200, 300, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className={`rounded-lg border border-white/10 px-3 py-2 text-sm ${amount === v ? "bg-white/10" : "bg-transparent hover:bg-white/5"}`}
            >
              ${v}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 outline-none"
            placeholder="Custom amount"
          />
        </div>
        {!round?.id && (
          <div className="mt-3 text-sm text-yellow-400">Loading round… your reservation will apply to the latest round.</div>
        )}
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        {expired && <div className="mt-3 text-sm text-white/60">Round ended — reservations disabled.</div>}

        <button
          onClick={reserve}
          disabled={loading || expired}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-teal px-5 py-3 font-medium text-dark disabled:opacity-50"
        >
          {loading ? "Reserving…" : "Reserve (no payment)"}
        </button>
      </div>
    </div>
  );
}
