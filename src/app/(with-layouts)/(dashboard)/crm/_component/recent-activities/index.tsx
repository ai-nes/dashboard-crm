"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getRecentActivitiesData } from "@/services/api/crm";
import { useQuery } from "@tanstack/react-query";
import ActivityIcon from "./activity-icon";
import RecentActivitiesSkeleton from "./skeleton";
import { toActivityViewModel } from "./utils";

export default function RecentActivities() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["crm-recent-activities"],
    queryFn: getRecentActivitiesData,
  });

  const activities = rawResponse?.data.map((item) => toActivityViewModel(item)) ?? [];

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <RecentActivitiesSkeleton />
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <ActivityIcon type={activity.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 text-text-primary">
                    <span className="font-medium">{activity.actorName}</span>{" "}
                    {activity.description}
                  </p>
                  <p className="mt-0.5 text-xs leading-4 text-text-tertiary">
                    {activity.relativeTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <div className="mt-5 border-t border-border-primary pt-4 text-center">
        <a
          href="#"
          className="text-sm leading-5 font-medium text-brand-500 hover:text-brand-600"
        >
          View All Activities
        </a>
      </div>
    </Card>
  );
}
