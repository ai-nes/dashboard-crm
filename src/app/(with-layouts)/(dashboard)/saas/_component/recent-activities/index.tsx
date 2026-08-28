"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getRecentActivitiesData } from "@/services/api/saas";
import { useQuery } from "@tanstack/react-query";
import { ActivityIcon } from "./icons";
import RecentActivitiesSkeleton from "./skeleton";
import { ACTIVITY_LABEL_MAP, toRecentActivityViewModel } from "./utils";

export default function RecentActivities() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["saas-recent-activities"],
    queryFn: getRecentActivitiesData,
  });

  const activities = rawResponse?.data.map((item) => toRecentActivityViewModel(item)) ?? [];

  return (
    <Card>
      <CardHeader className="mb-2">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>

      {isLoading || activities.length === 0 ? (
        <RecentActivitiesSkeleton />
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary-alt">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 py-3">
              <ActivityIcon type={activity.activityType} />
              <div className="flex-1">
                <p className="text-sm leading-5 text-text-primary">
                  <span className="font-medium">{ACTIVITY_LABEL_MAP[activity.activityType]}</span>
                  {" — "}
                  {activity.description}
                </p>
                <span className="text-xs leading-4 text-text-tertiary">
                  {activity.relativeTime}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
