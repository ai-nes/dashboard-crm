import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentJourneyEvent } from "@/services/api/students/types";

type StudentSignalStreamProps = {
  events: StudentJourneyEvent[];
};

const channelTone = {
  Website: { badge: "sky" as const, dot: "bg-info-500" },
  "Sự kiện": { badge: "success" as const, dot: "bg-success-500" },
  "Cuộc gọi": { badge: "primary" as const, dot: "bg-brand-500" },
  Zalo: { badge: "warning" as const, dot: "bg-warning-500" },
  "Hồ sơ": { badge: "gray" as const, dot: "bg-background-soft-400" },
};

export default function StudentSignalStream({ events }: StudentSignalStreamProps) {
  const signals = events.filter((event) => event.status === "completed").slice(-4).reverse();

  return (
    <section className="border-t border-card-border p-5 lg:p-6" aria-labelledby="signal-stream-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="signal-stream-heading" className="text-lg font-semibold text-text-primary">Điểm chạm gần nhất</h3>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các tín hiệu mới nhất đang làm thay đổi quyết định chăm sóc.</p>
        </div>
        <Badge color="warning">{signals.length} tín hiệu gần nhất</Badge>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <ol className="flex min-w-[48rem] items-start" aria-label="Bốn điểm chạm gần nhất">
          {signals.map((event, index) => {
            const tone = channelTone[event.channel];
            const relativeDate = index === 0 && event.description.includes("phút") ? event.description.match(/\d+ phút trước/)?.[0] : event.date;
            return <li key={event.id} className="flex min-w-48 flex-1 items-start gap-3"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`size-3 shrink-0 rounded-full ring-4 ring-card-background ${tone.dot}`} aria-hidden="true" /><time className={`text-[11px] ${index === 0 ? "font-semibold text-warning-500" : "text-text-tertiary"}`}>{relativeDate ?? event.date}</time>{index === 0 ? <span className="rounded-full bg-badge-warning-background px-1.5 py-0.5 text-[9px] font-semibold text-badge-warning-text">Mới</span> : null}</div><p className="mt-3 truncate text-sm font-semibold text-text-primary" title={event.title}>{event.title}</p><p className="mt-1 truncate text-xs text-text-tertiary" title={event.description}>{event.description}</p><Badge color={tone.badge}>{event.channel}</Badge></div>{index < signals.length - 1 ? <span className="mt-1.5 h-px flex-1 bg-card-border" aria-hidden="true" /> : null}</li>;
          })}
        </ol>
      </div>
    </section>
  );
}
