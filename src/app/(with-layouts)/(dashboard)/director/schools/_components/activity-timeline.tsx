import { Calendar, CheckCircle1, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolActivity, SchoolActivityStat, SchoolIntelligenceData } from "@/services/api/schools/types";

interface ActivityTimelineProps {
  data: SchoolIntelligenceData;
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  const upcomingActivity = data.activities.find((activity) => activity.status === "scheduled");
  const completedActivities = data.activities.filter((activity) => activity.status === "completed");
  const maxConversionRate = Math.max(...data.activityStats.map((item) => item.conversionRate), 1);

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="min-w-0">
          <CardTitle>Lịch làm việc với trường</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Việc cần làm tiếp theo và hoạt động nên ưu tiên</p>
        </div>
        <Badge color="primary">{data.activities.length} hoạt động</Badge>
      </CardHeader>

      <div className="grid min-w-0 gap-6 p-5 lg:grid-cols-2 lg:p-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">Việc tiếp theo</p>
          {upcomingActivity ? <UpcomingActivity activity={upcomingActivity} /> : <EmptyUpcomingActivity />}

          <div className="mt-5 border-t border-card-border pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-primary">Đã hoàn thành</p>
              <span className="text-xs text-text-tertiary">{completedActivities.length} việc</span>
            </div>
            <ul className="mt-3 divide-y divide-card-border">
              {completedActivities.map((activity) => <CompletedActivity key={activity.id} activity={activity} />)}
            </ul>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-card-border pt-4">
            <SummaryItem label="Đã hoàn thành" value={String(completedActivities.length)} />
            <SummaryItem label="Cần lên lịch" value={upcomingActivity ? "1" : "0"} tone="text-primary-500" />
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-card-border lg:pl-6">
          <p className="text-sm font-semibold text-text-primary">Hoạt động nên ưu tiên</p>
          <p className="mt-1 text-xs text-text-tertiary">Xếp theo tỷ lệ tạo hồ sơ nhập học</p>

          <ul className="mt-4 space-y-2">
            {data.activityStats.map((item) => <ActivityStatRow key={item.label} item={item} maxConversionRate={maxConversionRate} />)}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function UpcomingActivity({ activity }: { activity: SchoolActivity }) {
  return (
    <div className="mt-3 rounded-2xl border border-primary-200 bg-badge-primary-background p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-background text-primary-500" aria-hidden="true"><Calendar size={18} /></span>
        <Badge color="primary">Sắp tới</Badge>
      </div>
      <p className="mt-3 text-lg font-semibold leading-6 text-text-primary">{activity.title}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary"><ClockThree size={15} />{activity.date}</p>
    </div>
  );
}

function EmptyUpcomingActivity() {
  return (
    <div className="mt-3 rounded-2xl border border-card-border bg-background-soft-50 p-4">
      <p className="text-lg font-semibold text-text-primary">Chưa có lịch tiếp theo</p>
      <p className="mt-2 text-sm leading-5 text-text-secondary">Đặt một buổi tư vấn để tiếp tục làm việc với trường.</p>
    </div>
  );
}

function CompletedActivity({ activity }: { activity: SchoolActivity }) {
  return (
    <li className="flex min-w-0 items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className="mt-0.5 shrink-0 text-success-500" aria-hidden="true"><CheckCircle1 size={16} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary" title={activity.title}>{activity.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary"><ClockThree size={13} />{activity.date}</p>
      </div>
      <Badge color="success">Đã xong</Badge>
    </li>
  );
}

function ActivityStatRow({ item, maxConversionRate }: { item: SchoolActivityStat; maxConversionRate: number }) {
  return (
    <li className={`rounded-xl border px-3 py-2.5 ${item.recommended ? "border-success-500/25 bg-badge-success-background" : "border-card-border bg-card-background"}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-medium text-text-primary">{item.label}</p>
            {item.recommended ? <Badge color="success">Ưu tiên</Badge> : null}
          </div>
          <p className="mt-1 text-xs text-text-tertiary">{item.audience} · {item.costPerActivity} triệu</p>
        </div>
        <strong className="shrink-0 text-sm font-semibold text-text-primary">{item.conversionRate}%</strong>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-soft-100" aria-hidden="true">
        <div className={`h-full rounded-full ${item.recommended ? "bg-success-500" : "bg-primary-300"}`} style={{ width: `${(item.conversionRate / maxConversionRate) * 100}%` }} />
      </div>
    </li>
  );
}

function SummaryItem({ label, value, tone = "text-text-primary" }: { label: string; value: string; tone?: string }) {
  return <div className="min-w-0"><p className="text-[11px] text-text-tertiary">{label}</p><p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p></div>;
}
