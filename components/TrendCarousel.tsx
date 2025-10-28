"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const sb = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
})();

type Trend = {
  id: string;
  name: string;
  ai_confidence: number;
  projected_roi: number;
  description?: string;
  image_url?: string;
};

const fallback: Trend[] = [
  {
    id: "eco",
    name: "EcoGlow Candle",
    ai_confidence: 92,
    projected_roi: 3.2,
    description: "Eco decor trend",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "zen",
    name: "ZenCat Hoodie",
    ai_confidence: 90,
    projected_roi: 3.1,
    description: "Pet hoodie boom",
    image_url: "https://images.unsplash.com/photo-1542219550-3992a0e3ed5b?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "bottle",
    name: "SmartGrip Bottle",
    ai_confidence: 87,
    projected_roi: 2.9,
    description: "Smart bottle craze",
    image_url: "https://images.unsplash.com/photo-1526406915890-7a3f39ab3c49?auto=format&fit=crop&w=1200&q=60",
  },
];

export default function TrendCarousel() {
  const [trends, setTrends] = useState<Trend[]>(fallback);

  useEffect(() => {
    if (!sb) return; // keep fallback
    const load = async () => {
      const { data } = await sb
        .from("trends")
        .select("id,name,ai_confidence,projected_roi,description,image_url")
        .order("ai_confidence", { ascending: false })
        .limit(3);
      if (data && data.length) setTrends(data as any);
    };
    load();
    const ch = sb
      .channel("trends")
      .on("postgres_changes", { event: "*", schema: "public", table: "trends" }, () => load())
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-3">
      {trends.map((t) => (
        <Link href={`/trend/${t.id}`} key={t.id} className="group block">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-transform hover:-translate-y-0.5">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {t.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.image_url} alt={t.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <h3 className="mt-3 text-lg font-semibold">{t.name}</h3>
            <p className="mt-1 text-sm text-white/70 line-clamp-2">{t.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-white/70">
              <span>AI Confidence {Math.round(t.ai_confidence)}%</span>
              <span>ROI ×{t.projected_roi}</span>
            </div>
            <div className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm transition group-hover:bg-white/10">View Full Trend Report</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
