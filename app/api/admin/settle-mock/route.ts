import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const { roundId } = (await req.json()) as { roundId?: string };
    if (!roundId) return NextResponse.json({ message: "roundId required" }, { status: 400 });

    const { data, error } = await supabase.rpc("settle_mock_round", { p_round_id: roundId });
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    return NextResponse.json(data ?? {});
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Server error" }, { status: 500 });
  }
}
