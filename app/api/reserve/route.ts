import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Lazy init so we can validate env and return helpful errors
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!key) throw new Error("ENV SUPABASE_SERVICE_ROLE_KEY is missing");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerClient();
    const body = (await req.json()) as { roundId?: string; amount?: number | string };
    const amountNum = typeof body.amount === "string" ? Number(body.amount) : body.amount;
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ message: "Invalid payload: amount" }, { status: 400 });
    }

    // If roundId is not provided, fetch the latest round
    let roundId = body.roundId as string | undefined;
    if (!roundId) {
      const { data, error } = await supabase
        .from("rounds")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
      roundId = data?.id;
      if (!roundId) return NextResponse.json({ message: "No round available" }, { status: 400 });
    }

    // Optional auth check via Bearer token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    let userId: string | null = null;
    if (token) {
      const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
      if (userErr) {
        return NextResponse.json({ message: "Auth failed" }, { status: 401 });
      }
      userId = userRes.user?.id ?? null;
    }

    // Call Postgres function for atomic reservation + counters
    const { data, error } = await supabase.rpc("reserve_transaction", {
      p_round_id: roundId,
      p_user_id: userId,
      p_amount: Math.round(amountNum),
    });
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(data ?? {});
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Server error" }, { status: 500 });
  }
}
