"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getAudienceInsightsData } from "@/services/api/marketing";
import { useQuery } from "@tanstack/react-query";
import AudienceInsightsSkeleton from "./skeleton";
import { mapAudienceInsightsResponse } from "./utils";

export default function AudienceInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ["audience-insights"],
    queryFn: getAudienceInsightsData,
  });

  if (isLoading || !data) {
    return <AudienceInsightsSkeleton />;
  }

  const segments = mapAudienceInsightsResponse(data);

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>Who is engaging with your campaigns</CardTitle>
      </CardHeader>

      {/* Age breakdown */}
      <CardContent className="flex flex-col p-0">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="block text-sm leading-5 font-medium text-text-tertiary">Age Group</span>
          <span className="block text-sm leading-5 font-medium text-text-tertiary">Visitors</span>
        </div>

        <div className="flex flex-col gap-2">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center justify-between">
              <div className="flex h-8 max-w-[90%] flex-1 items-center">
                <div
                  className="flex h-full items-center rounded bg-background-gray-secondary_alt px-3"
                  style={{ width: `${segment.percentage}%` }}
                >
                  <span className="text-sm font-medium text-text-primary">{segment.label}</span>
                </div>
              </div>
              <span className="text-sm font-medium text-text-primary">{segment.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
