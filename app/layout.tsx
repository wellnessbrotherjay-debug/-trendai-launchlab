export const metadata = {
  title: "TrendAI LaunchLab",
  description: "Invest in the future, 14 days at a time.",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-dark">
      <body className="min-h-screen text-white bg-dark">{children}</body>
    </html>
  );
}

