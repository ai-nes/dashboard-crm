import { Calendar, CheckCircle1, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface ActivityTimelineProps {
  data: SchoolIntelligenceData;
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  return (
    <Card className="min-w-0 p-5 lg:p-6">
      <CardHeader className="mb-5 items-start">
        <div className="min-w-0">
          <CardTitle>Hoạt động & điểm chạm</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Lịch sử triển khai tại trường và kết quả cần ghi nhận tiếp.</p>
        </div>
        <Badge color="primary">{data.activities.length} hoạt động</Badge>
      </CardHeader>

      <ol className="space-y-0">
        {data.activities.map((activity, index) => (
          <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < data.activities.length - 1 && <span className="absolute top-8 bottom-0 left-3.5 w-px bg-card-border" aria-hidden="true" />}
            <span className={"relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full " + (activity.status === "scheduled" ? "bg-badge-primary-background text-badge-primary-text" : "bg-badge-success-background text-badge-success-text")} aria-hidden="true">
              {activity.status === "scheduled" ? <Calendar size={14} /> : <CheckCircle1 size={14} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary"><ClockThree size={13} />{activity.date}</p>
                </div>
                <Badge color={activity.status === "scheduled" ? "primary" : "success"}>{activity.status === "scheduled" ? "Sắp tới" : "Hoàn thành"}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-text-tertiary">{activity.outcome ?? activity.owner}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-card-border pt-4">
        <ActivityStat label="Lần chạm gần nhất" value={data.relationship.lastTouch} />
        <ActivityStat label="Cần kích hoạt" value={data.relationship.nextTouch} tone="text-primary-500" />
      </div>
    </Card>
  );
}

function ActivityStat({ label, value, tone = "text-text-primary" }: { label: string; value: string; tone?: string }) {
  return <div className="min-w-0"><p className="text-[11px] text-text-tertiary">{label}</p><p className={"mt-1 truncate text-sm font-semibold " + tone} title={value}>{value}</p></div>;
}
