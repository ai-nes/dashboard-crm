"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getRecentActivitiesData } from "@/services/api/marketing";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import RecentActivitiesSkeleton from "./skeleton";
import { toActivityViewModel } from "./utils";

export default function RecentActivities() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: getRecentActivitiesData,
  });

  if (isLoading || !data) {
    return <RecentActivitiesSkeleton />;
  }

  const activities = data.activities.map((activity) => toActivityViewModel(activity));

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>

      {/* Activity feed */}
      <div className="flex flex-col gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                activity.iconBgClass,
                activity.iconColorClass,
              )}
            >
              {activity.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-5 text-text-primary">
                <span className="font-medium">{activity.actor}</span> {activity.description}
              </p>
              <span className="text-xs leading-4 text-text-tertiary">{activity.relativeTime}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
