import { ArrowRight } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

export default function JourneyTimeline({ data }: Student360SectionProps) {
  return <Card className="min-w-0 p-5"><CardHeader className="mb-5"><div><CardTitle>Hành trình tuyển sinh</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Tín hiệu và điểm chạm đã được xác thực theo thời gian.</p></div></CardHeader><ol className="space-y-0" aria-label="Các mốc hành trình tuyển sinh">{data.journey.map((event) => <li key={event.id} className="relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0"><span className="pt-0.5 text-xs font-medium text-text-tertiary">{event.date}</span><div className="relative min-w-0 pl-5 before:absolute before:top-1 before:left-0 before:size-3 before:rounded-full before:bg-card-background before:ring-2 before:ring-primary-400 after:absolute after:top-4 after:bottom-[-20px] after:left-1.25 after:w-px after:bg-card-border last:after:hidden"><div className={event.status === "current" ? "rounded-lg bg-badge-primary-background p-3" : ""}><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium text-text-primary">{event.title}</p>{event.status === "current" && <Badge color="primary">Tiếp theo</Badge>}</div><p className="mt-1 text-sm leading-5 text-text-secondary">{event.description}</p><p className="mt-1.5 text-xs text-text-tertiary">{event.channel}</p></div></div></li>)}</ol><button type="button" className="mt-5 flex items-center gap-1 text-sm font-medium text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">Xem toàn bộ hành trình <ArrowRight size={16} /></button></Card>;
}
