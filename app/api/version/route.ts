import { NextResponse } from "next/server";

export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || process.env.COMMIT_REF || "dev-local";
  const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || "local";
  const ts = new Date().toISOString();
  return NextResponse.json({ sha, branch, at: ts });
}

