export const metadata = {
  title: "TrendAI LaunchLab",
  description: "Back new products in 24‑hour rounds. Reward‑based pre‑orders, not financial investments.",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-dark">
      <body className="min-h-screen text-white bg-dark">{children}</body>
    </html>
  );
}

