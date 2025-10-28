import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

async function maybeCache(payload: any) {
  const sb = getServiceClient();
  if (!sb) return;
  try {
    await sb.from("trend_sources").insert({ payload });
  } catch {
    // ignore cache errors
  }
}

export async function GET(_req: NextRequest) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
  const FREE_TREND_SEEDS = (process.env.FREE_TREND_SEEDS || "Ramen Cat Shirt,Silent Desk Treadmill,AI Note Device").split(",").map(s => s.trim());

  // If we had keys, we'd call Google CSE to enrich with Amazon links.
  // To keep this free-mode and deployable without secrets, return a mock enriched set and cache.
  const mock = FREE_TREND_SEEDS.slice(0, 5).map((name, i) => ({
    rank: i + 1,
    trend_name: name,
    sources: [
      { type: "reddit", score: 1200 - i * 137 },
      { type: "youtube", score: 980 - i * 113 },
    ],
    amazon: [
      {
        title: `${name} – Top Listing`,
        url: `https://www.amazon.com/s?k=${encodeURIComponent(name)}`,
        image: "https://via.placeholder.com/200x200.png?text=Trend",
        price: 19.99 + i,
        rating: 4.2,
        reviews: 1234 - i * 77,
      },
    ],
  }));

  await maybeCache({ mode: "mock", items: mock });
  return NextResponse.json({ items: mock });
}

