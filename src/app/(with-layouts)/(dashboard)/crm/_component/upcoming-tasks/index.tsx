"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getUpcomingTasksData } from "@/services/api/crm";
import { useQuery } from "@tanstack/react-query";
import DayColumn from "./day-column";
import UpcomingTasksSkeleton from "./skeleton";
import { buildWeekColumns } from "./utils";

export default function UpcomingTasks() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["crm-upcoming-tasks"],
    queryFn: getUpcomingTasksData,
  });

  const weekColumns = rawResponse ? buildWeekColumns(rawResponse) : [];

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Upcoming Tasks &amp; Meetings</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading || !rawResponse ? (
          <UpcomingTasksSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {weekColumns.map((day) => (
              <DayColumn key={day.dayOfWeek} day={day} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
