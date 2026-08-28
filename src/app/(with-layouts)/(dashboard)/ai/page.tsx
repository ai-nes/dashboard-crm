"use client";

import { useState } from "react";

import type { AiGranularity } from "@/services/api/ai";
import AiAgents from "./_component/ai-agents";
import AiCostAnalytics from "./_component/ai-cost-analytics";
import AiProviderDistribution from "./_component/ai-provider-distribution";
import PageHeader from "./_component/page-header";
import RecentActivities from "./_component/recent-activities";
import TopUsage from "./_component/top-usage";
import WeeklyAiActivity from "./_component/weekly-ai-activity";

export default function AiPage() {
  const [granularity, setGranularity] = useState<AiGranularity>("monthly");

  return (
    <div className="mt-6 space-y-5">
      {/* Header Section */}
      <PageHeader granularity={granularity} setGranularity={setGranularity} />

      <div className="space-y-5 px-2 lg:px-5">
        <AiCostAnalytics granularity={granularity} />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]">
          <WeeklyAiActivity />
          <AiProviderDistribution />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TopUsage />
          <AiAgents />
        </div>

        <RecentActivities />
      </div>
    </div>
  );
}
