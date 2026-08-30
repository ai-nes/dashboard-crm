import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const channelTone = {
  Website: { badge: "sky" as const, dot: "bg-info-500" },
  "Sự kiện": { badge: "success" as const, dot: "bg-success-500" },
  "Cuộc gọi": { badge: "primary" as const, dot: "bg-brand-500" },
  Zalo: { badge: "warning" as const, dot: "bg-warning-500" },
  "Hồ sơ": { badge: "gray" as const, dot: "bg-background-soft-400" },
};

export default function JourneyTimeline({ data }: Student360SectionProps) {
  return <Card className="flex min-w-0 flex-col p-5"><CardHeader className="mb-5"><div><CardTitle>Hành trình tuyển sinh</CardTitle><p className="mt-1 text-sm leading-6 text-text-tertiary">Toàn bộ điểm chạm được đọc như một chuỗi quyết định liên tục.</p></div><Badge color="success">5 mốc đã hoàn tất</Badge></CardHeader><ol className="flex flex-col" aria-label="Các mốc hành trình tuyển sinh">{data.journey.map((event) => {
    const tone = channelTone[event.channel];
    return <li key={event.id} className="relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 pb-4 last:pb-0"><span className={`pt-1 text-xs font-semibold ${event.status === "current" ? "text-brand-500" : "text-text-tertiary"}`}>{event.date}</span><div className="relative min-w-0 pl-6"><span className={`absolute top-1 left-0 z-10 size-3 rounded-full ring-4 ring-card-background ${tone.dot}`} aria-hidden="true" />{event.status !== "current" && <span className="absolute top-3 bottom-[-16px] left-1.5 w-px bg-card-border last:hidden" aria-hidden="true" />}<div className={event.status === "current" ? "rounded-xl border border-primary-200 bg-badge-primary-background p-4" : "border-b border-card-border pb-4"}><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-text-primary">{event.title}</p><div className="flex items-center gap-2"><Badge color={tone.badge}>{event.channel}</Badge>{event.status === "current" && <Badge color="primary">Tiếp theo</Badge>}</div></div><p className="mt-1 text-sm leading-5 text-text-secondary">{event.description}</p></div></div></li>;
  })}</ol><div className="mt-6 rounded-2xl bg-badge-success-background p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-badge-success-text">Động lượng hành trình</p><p className="mt-1 text-sm text-text-secondary">5/6 mốc đã có tín hiệu xác thực; bước tiếp theo phụ thuộc cuộc gọi với phụ huynh.</p></div><strong className="text-xl font-semibold text-success-500">83%</strong></div></div></Card>;
}
