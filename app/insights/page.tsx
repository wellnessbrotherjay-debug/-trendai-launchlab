"use client";
import { useRouter } from "next/navigation";
import UnitEconomicsChart from "../../components/UnitEconomicsChart";
import FundingTimeline from "../../components/FundingTimeline";
import ProcessFlow from "../../components/ProcessFlow";
import ReturnCalculator from "../../components/ReturnCalculator";
import RiskGauge from "../../components/RiskGauge";
import NextTrends from "../../components/NextTrends";

export default function InsightsPage() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined") {
      try {
        const ref = document.referrer;
        if (ref) {
          const sameOrigin = new URL(ref).origin === window.location.origin;
          if (sameOrigin) {
            window.history.back();
            return;
          }
        }
      } catch {}
    }
    router.push("/");
  };
  return (
    <main className="min-h-screen bg-dark text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Campaign Insights</h1>
          <button
            onClick={handleBack}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            ← Back
          </button>
        </div>
        <p className="text-white/70">Ad spend bars, CPC/CPA, production timeline, and money breakdown.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <UnitEconomicsChart />
          <ReturnCalculator />
          <FundingTimeline />
          <ProcessFlow />
          <RiskGauge />
        </div>

        <div className="mt-8">
          <NextTrends />
        </div>
      </div>
    </main>
  );
}
