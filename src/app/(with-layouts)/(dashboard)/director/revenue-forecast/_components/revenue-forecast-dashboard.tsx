"use client";

import AiForecastExplanation from "./ai-forecast-explanation";
import RevenueByRegion from "./revenue-by-region";
import RevenueForecastChart from "./revenue-forecast-chart";
import RevenueForecastHeader from "./revenue-forecast-header";
import RevenueKpis from "./revenue-kpis";
import RevenueActivity from "./revenue-activity";
import RevenueCashflowChart from "./revenue-cashflow-chart";
import RevenueChannelMix from "./revenue-channel-mix";
import RevenueCollectionHealth from "./revenue-collection-health";
import RevenueDecisionCard from "./revenue-decision-card";
import RevenueModel from "./revenue-model";
import ScenarioSimulation from "./scenario-simulation";
import RevenueSignals from "./revenue-signals";
import RevenueSummaryRail from "./revenue-summary-rail";
import RevenueTargetPlan from "./revenue-target-plan";
import RevenueTransactions from "./revenue-transactions";
import { getRevenueForecast } from "@/services/api/director-revenue-forecast";
import { useQuery } from "@tanstack/react-query";
import { RevenueForecastDataProvider } from "./revenue-forecast-context";

export default function RevenueForecastDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["director-revenue-forecast", "frappe-v1"],
    queryFn: getRevenueForecast,
  });

  if (isLoading) return <div className="mt-4 min-h-[720px]" />;
  if (isError || !data)
    return <div className="mt-4 min-h-[720px]" onClick={() => refetch()} />;

  return (
    <RevenueForecastDataProvider data={data}>
      <div className="mt-4 min-w-0 space-y-6 overflow-hidden pb-8">
        <RevenueForecastHeader />

        <div className="space-y-5 px-2 lg:px-5">
          <RevenueKpis />

          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
            <RevenueSummaryRail />
            <RevenueForecastChart />
            <RevenueModel />

            <RevenueTargetPlan />
            <RevenueByRegion />
            <RevenueSignals />

            <RevenueCollectionHealth />
            <RevenueTransactions />
            <RevenueActivity />

            <RevenueChannelMix />
            <RevenueCashflowChart />
            <RevenueDecisionCard />
          </div>

          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <ScenarioSimulation />
            <AiForecastExplanation />
          </div>
        </div>
      </div>
    </RevenueForecastDataProvider>
  );
}
