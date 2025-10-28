import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const canonical = process.env.NEXT_PUBLIC_SITE_URL || "https://trendailaunchlab.xyz";
  const canonicalHost = canonical.replace(/^https?:\/\//, "");
  const isVercelPreview = /\.vercel\.app$/i.test(host);
  // Redirect any *.vercel.app traffic to canonical domain
  if (isVercelPreview && !host.startsWith(canonicalHost)) {
    const url = new URL(req.nextUrl);
    url.host = canonicalHost;
    url.protocol = canonical.startsWith("https") ? "https" : "http";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};

