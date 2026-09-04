import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";

import StudentCardEmptyState from "./student-card-empty-state";
import type { Student360SectionProps } from "./types";

const channelTone = {
  Website: { badge: "sky" as const, dot: "bg-info-500" },
  "Sự kiện": { badge: "success" as const, dot: "bg-success-500" },
  "Cuộc gọi": { badge: "primary" as const, dot: "bg-brand-500" },
  Zalo: { badge: "warning" as const, dot: "bg-warning-500" },
  "Hồ sơ": { badge: "gray" as const, dot: "bg-background-soft-400" },
};

const journeyStages = [
  "Chưa biết đến trường",
  "Đã biết đến trường",
  "Đang tìm hiểu",
  "Cân nhắc nghiêm túc",
  "Đã nộp hồ sơ",
  "Đã trúng tuyển",
  "Đã nhập học",
];

export default function JourneyTimeline({ data }: Student360SectionProps) {
  const currentStage = data.classification?.dimensions?.find((dimension) => dimension.id === "journey")?.value;
  const currentStageIndex = Math.max(0, journeyStages.indexOf(currentStage ?? ""));
  const journeyEvents = data.journey ?? [];
  const hasJourneyEvents = journeyEvents.length > 0;

  return (
    <Card className="flex min-w-0 flex-col p-5">
      <CardHeader className="mb-5">
        <CardTitle>Tiến độ tuyển sinh</CardTitle>
        <Badge color="success">Bước {currentStageIndex + 1}/{journeyStages.length}</Badge>
      </CardHeader>

      <div className="mb-5 overflow-x-auto rounded-xl border border-primary-200 bg-badge-primary-background p-3">
        <p className="text-[11px] font-semibold tracking-wide text-badge-primary-text uppercase">Giai đoạn</p>
        <ol className="mt-3 flex min-w-[42rem] items-start" aria-label="Bảy giai đoạn hành trình tuyển sinh">
          {journeyStages.map((stage, index) => {
            const complete = index < currentStageIndex;
            const current = index === currentStageIndex;
            return (
              <li key={stage} className="flex min-w-0 flex-1 items-start">
                <div className="flex min-w-0 flex-col items-center text-center">
                  <span className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-badge-success-background text-success-500" : current ? "bg-primary-500 text-primary-text" : "border border-card-border bg-card-background text-text-tertiary"}`} aria-current={current ? "step" : undefined}>{complete ? "✓" : index + 1}</span>
                  <span className={`mt-2 max-w-24 text-[10px] leading-4 ${current ? "font-semibold text-primary-500" : "text-text-tertiary"}`}>{stage}</span>
                </div>
                {index < journeyStages.length - 1 && <span className={`mt-3 h-px flex-1 ${index < currentStageIndex ? "bg-success-500/50" : "bg-card-border"}`} aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </div>

      {hasJourneyEvents ? (
        <ol className="flex flex-col" aria-label="Toàn bộ điểm chạm trong hành trình tuyển sinh">
          {journeyEvents.map((event) => {
            const tone = channelTone[event.channel as keyof typeof channelTone] ?? channelTone["Hồ sơ"];
            return (
              <li key={event.id} className="relative grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 pb-4 last:pb-0 sm:grid-cols-[10.5rem_minmax(0,1fr)]">
                <span className={`pt-1 text-xs font-semibold whitespace-nowrap ${event.status === "current" ? "text-brand-500" : "text-text-tertiary"}`}>
                  {formatDateTime(event.date)}
                </span>
                <div className="relative min-w-0 pl-6">
                  <span className={`absolute top-1 left-0 z-10 size-3 rounded-full ring-4 ring-card-background ${tone.dot}`} aria-hidden="true" />
                  {event.status !== "current" && <span className="absolute top-3 bottom-[-16px] left-1.5 w-px bg-card-border last:hidden" aria-hidden="true" />}
                  <div className={event.status === "current" ? "rounded-xl border border-primary-200 bg-badge-primary-background p-4" : "border-b border-card-border pb-4"}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-text-primary">{event.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge color={tone.badge}>{event.channel}</Badge>
                        {event.status === "current" && <Badge color="primary">Tiếp theo</Badge>}
                      </div>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-text-secondary">{event.description}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <StudentCardEmptyState
          message="Hiện tại chưa có tiến độ tuyển sinh cho học sinh này"
          className="py-10"
        />
      )}
    </Card>
  );
}

