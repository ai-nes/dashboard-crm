"use client";

import { useState } from "react";
import type { Granularity } from "@/services/api/saas";
import CustomerGrowth from "./_component/customer-growth";
import PageHeader from "./_component/page-header";
import PlanMix from "./_component/plan-mix";
import RecentActivities from "./_component/recent-activities";
import RecentSignups from "./_component/recent-signups";
import RevenueOverview from "./_component/revenue-overview";

export default function SaasPage() {
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  return (
    <div className="mt-6 space-y-5">
      {/* Header Section */}
      <div className="px-2 lg:px-6">
        <PageHeader granularity={granularity} onGranularityChange={setGranularity} />
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <RevenueOverview granularity={granularity} />
          <CustomerGrowth granularity={granularity} />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_2fr]">
          <PlanMix />
          <RecentSignups />
        </div>

        <RecentActivities />
      </div>
    </div>
  );
}
