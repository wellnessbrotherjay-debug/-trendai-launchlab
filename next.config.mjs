/** @type {import('next').NextConfig} */
const CANONICAL = process.env.NEXT_PUBLIC_SITE_URL || "https://trendailaunchlab.xyz";

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    const host = CANONICAL.replace(/^https?:\/\//, "");
    return [
      {
        source: "/:path*",
        has: [
          { type: "host", value: ".*vercel\.app$" },
        ],
        destination: `${CANONICAL}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
