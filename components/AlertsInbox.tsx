"use client";
import { useEffect, useState } from "react";

export default function AlertsInbox() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<{ id: string; kind: string; text: string; created_at?: string }[]>([]);

  useEffect(() => {
    // mock demo feed
    setAlerts([
      { id: "1", kind: "new_round", text: "New round opened: ZenCat Hoodie" },
      { id: "2", kind: "autopilot_change", text: "Autopilot increased TikTok budget +12%" },
    ]);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">Alerts {alerts.length ? `(${alerts.length})` : ""}</button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl text-white shadow-lg">
          <div className="text-xs text-white/60 mb-2">Recent alerts</div>
          <div className="space-y-2 text-sm">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-white/80">{a.text}</div>
                <div className="text-[10px] text-white/40 mt-1">{a.kind}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

