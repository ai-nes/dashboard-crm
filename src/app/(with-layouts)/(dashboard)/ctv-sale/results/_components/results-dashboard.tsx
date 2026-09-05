"use client";

import { useState } from "react";

import ContactOutcomes from "./contact-outcomes";
import ProcessingPerformance from "./processing-performance";
import ResultFunnel from "./result-funnel";
import ResultTrendChart from "./result-trend-chart";
import ResultsHeader from "./results-header";
import ResultsKpiStrip from "./results-kpi-strip";
import { resultsData, type ResultsPeriod } from "./data";

export default function ResultsDashboard() {
  const [period, setPeriod] = useState<ResultsPeriod>("current");
  const data = resultsData[period];

  return (
    <main id="main-content" className="min-w-0 space-y-5 overflow-x-hidden px-2 py-4 pb-8 lg:space-y-6 lg:px-6">
      <ResultsHeader data={data} period={period} onPeriodChange={setPeriod} />
      <ResultsKpiStrip kpis={data.kpis} />

      <section aria-label="Phân tích kết quả tư vấn" className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1.22fr)]">
        <ResultFunnel stages={data.funnel} />
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <ResultTrendChart data={data.trend} />
          <ContactOutcomes outcomes={data.outcomes} />
        </div>
      </section>

      <ProcessingPerformance metrics={data.performance} />
    </main>
  );
}
