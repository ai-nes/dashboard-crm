import { ArrowUpward, CheckCircle1, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";

import type { Student360SectionProps } from "./types";

export default function StudentEngagementTab({ data }: Student360SectionProps) {
  const touchpoints = data.journey.map((event) => ({
    ...event,
    detail: event.description,
    tone:
      event.status === "completed"
        ? ("success" as const)
        : event.status === "current"
          ? ("primary" as const)
          : ("warning" as const),
  }));
  const totalTouches = data.channelPerformance?.reduce(
    (total, channel) => total + channel.touches,
    0,
  );
  const activeDays = data.engagement.find((item) =>
    /ngày/i.test(item.label),
  )?.value;
  const mostEffectiveChannel = [...(data.channelPerformance ?? [])].sort(
    (left, right) => right.touches - left.touches,
  )[0];

  return (
    <div className="space-y-5">
      <section className="grid items-stretch gap-4 sm:grid-cols-3">
        <Card className="h-full border-info-500/20 bg-badge-sky-background p-4">
          <p className="text-xs text-badge-sky-text">Tổng điểm chạm</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.6px] text-info-500">
            {totalTouches ?? "—"}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Theo dữ liệu API</p>
        </Card>
        <Card className="h-full border-success-500/20 bg-badge-success-background p-4">
          <p className="text-xs text-badge-success-text">Ngày hoạt động</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.6px] text-success-500">
            {activeDays ?? "—"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-success-500">
            <ArrowUpward size={11} /> Theo dữ liệu API
          </p>
        </Card>
        <Card className="h-full border-primary-200 bg-badge-primary-background p-4">
          <p className="text-xs text-badge-primary-text">Kênh hiệu quả nhất</p>
          <p className="mt-2 text-xl font-semibold text-text-primary">
            {mostEffectiveChannel?.channel ?? "Chưa có dữ liệu"}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            {mostEffectiveChannel
              ? `Tỷ lệ phản hồi ${mostEffectiveChannel.response}%`
              : "Chưa có dữ liệu từ API"}
          </p>
        </Card>
      </section>

      <Card className="p-5">
        <CardHeader className="mb-5">
          <div>
            <CardTitle>Lịch sử tương tác</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">Các điểm chạm gần nhất được sắp xếp theo thời gian.</p>
          </div>
          <Badge color="primary">{data.engagement.length} nhóm tín hiệu</Badge>
        </CardHeader>
        {touchpoints.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-tertiary">Chưa có dữ liệu lịch sử tương tác.</p>
        ) : (
          <ol className="grid gap-4 md:grid-cols-2">
            {touchpoints.map((item) => (
              <li key={`${item.date}-${item.title}`} className="flex gap-3 rounded-xl border border-card-border p-4">
                <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${item.tone === "success" ? "bg-badge-success-background text-success-500" : item.tone === "warning" ? "bg-badge-warning-background text-warning-500" : "bg-badge-primary-background text-badge-primary-text"}`} aria-hidden="true">
                  {item.tone === "warning" ? <ClockThree size={15} /> : item.tone === "success" ? <CheckCircle1 size={15} /> : <span className="size-2 rounded-full bg-primary-500" />}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <Badge color={item.tone}>{item.channel}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-tertiary">{formatDateTime(item.date)}</p>
                  <p className="mt-2 text-sm leading-5 text-text-secondary">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
