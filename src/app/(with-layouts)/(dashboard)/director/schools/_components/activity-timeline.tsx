import { Calendar, CheckCircle1, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface ActivityTimelineProps {
  data: SchoolIntelligenceData;
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  return (
    <Card className="h-full min-w-0 border-success-200/60 p-5">
      <CardHeader className="mb-5">
        <div>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Lịch sử tương tác và hành động sắp tới tại trường.
          </p>
        </div>
      </CardHeader>
      <ol className="space-y-0">
        {data.activities.map((activity, index) => (
          <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < data.activities.length - 1 && (
              <span
                className="absolute top-8 bottom-0 left-3.5 w-px bg-card-border"
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ${activity.status === "scheduled" ? "bg-badge-primary-background text-badge-primary-text" : "bg-badge-success-background text-badge-success-text"}`}
              aria-hidden="true"
            >
              {activity.status === "scheduled" ? (
                <Calendar size={14} />
              ) : (
                <CheckCircle1 size={14} />
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-text-primary">
                  {activity.title}
                </p>
                <Badge
                  color={
                    activity.status === "scheduled" ? "primary" : "success"
                  }
                >
                  {activity.status === "scheduled"
                    ? "Đã lên lịch"
                    : "Hoàn thành"}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                <ClockThree size={13} />
                {activity.date}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                {activity.owner}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
