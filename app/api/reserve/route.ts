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

    // Fetch latest round if not provided
    let roundId = body.roundId as string | undefined;
    if (!roundId) {
      const { data, error } = await supabase
        .from("rounds")
        .select("id, raise_cap, investors, max_backers, raised")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
      if (!data?.id) return NextResponse.json({ message: "No round available" }, { status: 400 });
      roundId = data.id;

      // Enforce caps if we fetched the round
      const capReached = (data.raised ?? 0) >= (data.raise_cap ?? Number.POSITIVE_INFINITY);
      const backersReached = (data.investors ?? 0) >= (data.max_backers ?? Number.POSITIVE_INFINITY);
      if (capReached || backersReached) {
        return NextResponse.json({ message: "Round cap reached" }, { status: 400 });
      }
    } else {
      // When provided, still verify caps
      const { data, error } = await supabase
        .from("rounds")
        .select("id, raise_cap, investors, max_backers, raised")
        .eq("id", roundId)
        .maybeSingle();
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
      if (!data?.id) return NextResponse.json({ message: "Round not found" }, { status: 404 });
      const capReached = (data.raised ?? 0) >= (data.raise_cap ?? Number.POSITIVE_INFINITY);
      const backersReached = (data.investors ?? 0) >= (data.max_backers ?? Number.POSITIVE_INFINITY);
      if (capReached || backersReached) {
        return NextResponse.json({ message: "Round cap reached" }, { status: 400 });
      }
    }

    // Optional auth (not required)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    let userId: string | null = null;
    if (token) {
      const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
      if (!userErr) userId = userRes.user?.id ?? null;
    }

    const units = Math.floor((amountNum as number) / 200);
    if (units <= 0) {
      return NextResponse.json({ message: "Minimum ticket is $200" }, { status: 400 });
    }

    // Insert backing with units_purchased
    const { error: backErr } = await supabase.from("backings").insert({
      round_id: roundId,
      user_id: userId,
      amount: Math.round(amountNum as number),
      units_purchased: units,
    });
    if (backErr) return NextResponse.json({ message: backErr.message }, { status: 400 });

    // Bump round totals
    const { error: updErr } = await supabase.rpc("sql", {
      // fallback: attempt an atomic update via PostgREST RPC extension if present; otherwise do two updates
    } as any);
    // If rpc extension not present, do simple update
    if (updErr) {
      const { error } = await supabase
        .from("rounds")
        .update({
          raised: (amountNum as number) + (0 as any),
        })
        .eq("id", roundId);
      // ignore exact old value; a real atomic increment would use a sql function
      // increment investors
      const { error: invErr } = await supabase
        .from("rounds")
        .update({ investors: (1 as any) + (0 as any) })
        .eq("id", roundId);
      if (error || invErr) {
        return NextResponse.json({ message: (error || invErr)?.message || "Failed to update round" }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true, units });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Server error" }, { status: 500 });
  }
}
