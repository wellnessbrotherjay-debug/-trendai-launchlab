"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ReserveModal from "../../../components/ReserveModal";
import ProjectionChart from "../../../components/ProjectionChart";

type Trend = {
  id: string;
  name: string;
  description?: string;
  ai_confidence?: number;
  projected_roi?: number;
  image_url?: string;
};

type Product = {
  id: string;
  trend_id: string;
  name: string;
  image_url?: string;
  supplier_url?: string;
  sku?: string;
  supplier_cost?: number;    // cost per item
  shipping_cost?: number;    // per unit shipping/fulfillment
  sale_price?: number;       // sale price
  fees_pct?: number;         // platform/payment fees percent (e.g., 6.5)
  moq?: number;              // minimum order qty
  notes?: string;
};

const sb = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  return url && key ? createClient(url, key) : null;
})();

export default function TrendDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trend, setTrend] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      if (!sb) {
        setTrend({ id: String(id), name: "EcoGlow Candle", description: "Fallback trend.", ai_confidence: 92, projected_roi: 3.2 });
        setLoading(false);
        return;
      }
      const { data, error } = await sb.from("trends").select("*").eq("id", id).single();
      if (!active) return;
      if (error) {
        router.replace("/");
        return;
      }
      setTrend(data as any);
      // fetch product linked to trend
      const { data: prod } = await sb
        .from("products")
        .select("*")
        .eq("trend_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prod) setProduct(prod as any);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [id, router]);

  const subtitle = useMemo(() => {
    if (!trend) return "";
    const conf = trend.ai_confidence ? `${Math.round(trend.ai_confidence)}% AI Confidence` : "AI Confidence pending";
    const roi = trend.projected_roi ? ` · Projected ROI ×${trend.projected_roi}` : "";
    return conf + roi;
  }, [trend]);

  const image = product?.image_url || trend?.image_url;
  const sale = product?.sale_price ?? null;
  const cost = (product?.supplier_cost ?? 0) + (product?.shipping_cost ?? 0);
  const fees = sale ? ((product?.fees_pct ?? 0) / 100) * sale : 0;
  const profit = sale ? Math.round((sale - cost - fees) * 100) / 100 : null;
  const marginPct = sale && profit !== null ? Math.round((profit / sale) * 100) : null;

  return (
    <main className="min-h-screen bg-dark text-white">
      <ReserveModal round={null} open={modalOpen} onClose={() => setModalOpen(false)} />

      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-white/70 hover:text-white text-sm">← Back</Link>
        <div className="text-sm text-white/50">Demo Mode</div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          {loading ? (
            <div className="h-40 w-full animate-pulse rounded bg-white/10" />
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={trend?.name || "Trend"} className="h-full w-full object-cover" />
                  ) : null}
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">AI Trend Report</div>
                <h1 className="mt-3 text-3xl font-semibold">{trend?.name}</h1>
                <p className="mt-2 text-sm text-white/60">{subtitle}</p>
                <p className="mt-4 text-white/80">{trend?.description || "This trend is gaining momentum across social channels and purchase intent signals."}</p>
                {product && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between"><span>Sale Price</span><span>{sale ? `$${sale.toFixed(2)}` : "—"}</span></div>
                    <div className="flex items-center justify-between"><span>Item + Shipping Cost</span><span>{cost ? `$${cost.toFixed(2)}` : "—"}</span></div>
                    <div className="flex items-center justify-between"><span>Fees</span><span>{fees ? `$${fees.toFixed(2)}` : "—"}</span></div>
                    <div className="mt-2 flex items-center justify-between font-medium"><span>Estimated Profit / Unit</span><span>{profit !== null ? `$${profit.toFixed(2)}` : "—"}{marginPct !== null ? ` (${marginPct}%)` : ""}</span></div>
                    <div className="mt-2 flex items-center justify-between"><span>MOQ</span><span>{product.moq ?? "—"}</span></div>
                    {product.supplier_url && (
                      <a href={product.supplier_url} target="_blank" className="mt-3 inline-block rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">View Supplier</a>
                    )}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">14‑day cycle</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">Supply verified</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">Creator‑ready</span>
                </div>
                <button onClick={() => setModalOpen(true)} className="mt-6 rounded-xl bg-gradient-to-r from-neon-purple to-neon-teal px-5 py-3 font-medium text-dark">Reserve $200 Spot</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold">Why this trend?</h2>
            <p className="mt-2 text-sm text-white/70">Spotter‑X detected accelerating velocity and strong conversion signals across key audiences. Product‑market fit indicators and supplier readiness suggest a fast path to launch.</p>
            <div className="mt-4"><ProjectionChart /></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Round Summary</h2>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between"><span>Soft Cap</span><span>$10,000</span></div>
              <div className="flex items-center justify-between"><span>Min Reserve</span><span>$200</span></div>
              <div className="flex items-center justify-between"><span>Status</span><span>Open (Demo)</span></div>
            </div>
            <button onClick={() => setModalOpen(true)} className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Join This Round</button>
            {product?.sku && <div className="mt-3 text-xs text-white/50">SKU: {product.sku}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
