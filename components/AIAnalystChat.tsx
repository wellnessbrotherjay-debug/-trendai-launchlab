"use client";
import { useEffect, useRef, useState } from "react";

export default function AIAnalystChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I’m TrendAI Analyst. Ask about ROI, soft-cap, or risks." },
  ]);
  const mock = process.env.NEXT_PUBLIC_MOCK_MODE !== "false";
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    if (mock) {
      setTimeout(() => {
        const reply = mockReply(q);
        setMessages((m) => [...m, { role: "ai", text: reply }]);
      }, 500);
      return;
    }
    // Placeholder for live function call (ai_analyst)
    setMessages((m) => [...m, { role: "ai", text: "(live AI coming soon)" }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <div className="text-sm font-medium">AI Analyst</div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <div ref={boxRef} className="max-h-64 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "ai" ? "text-white/80" : "text-white"}>{m.text}</div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 rounded-lg border border-white/10 bg-transparent px-3 py-2 outline-none text-sm"
              placeholder="Ask about ROI or risk…"
            />
            <button onClick={send} className="rounded-lg bg-gradient-to-r from-neon-purple to-neon-teal px-3 py-2 text-dark text-sm">Send</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} className="rounded-full bg-gradient-to-r from-neon-purple to-neon-teal p-3 text-dark shadow-lg">
        {open ? "–" : "AI"}
      </button>
    </div>
  );
}

function mockReply(q: string) {
  const lower = q.toLowerCase();
  if (lower.includes("roi")) return "Projected ROI is 2.8×–3.4× over the 14‑day cycle given current velocity and CPC.";
  if (lower.includes("risk")) return "Risk tier: Balanced. Autopilot caps daily spend and rebalances if ROI < forecast by 20%.";
  if (lower.includes("soft")) return "Soft‑cap is $10,000. We’re tracking pledged and investors in realtime via Supabase.";
  return "Key drivers: creative CTR, CPC, and supplier lead times. Ask me about ROI, risks, or payouts.";
}

