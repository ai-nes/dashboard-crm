"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getRecentActivitiesData } from "@/services/api/ai";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";

import { activityDisplayConfig } from "./data";
import RecentActivitiesSkeleton from "./skeleton";
import type { RecentActivityViewModel } from "./types";
import { toRecentActivityViewModel } from "./utils";

export default function RecentActivities() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: getRecentActivitiesData,
  });

  if (isLoading || !rawResponse) {
    return <RecentActivitiesSkeleton />;
  }

  const activities: RecentActivityViewModel[] = rawResponse.data.map((item) =>
    toRecentActivityViewModel(item, rawResponse.generated_at),
  );

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>

      {/* Activity list */}
      <CardContent className="flex flex-col p-0">
        {activities.map((activity) => {
          const display = activityDisplayConfig[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 border-b border-border-primary py-3.5 first:pt-0 last:border-0 last:pb-0"
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  display.iconBgClass,
                  display.iconColorClass,
                )}
              >
                {display.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-5 font-medium text-text-primary">{activity.title}</p>
                <p className="mt-0.5 text-sm leading-5 text-text-tertiary">
                  {activity.description}
                </p>
              </div>
              <span className="shrink-0 text-xs leading-4 whitespace-nowrap text-text-tertiary">
                {activity.relativeTime}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
