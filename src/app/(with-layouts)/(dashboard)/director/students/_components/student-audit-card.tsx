import { CheckCircle1, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { Student360Data } from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

interface StudentAuditCardProps {
  data?: Student360Data;
}

export default function StudentAuditCard({ data }: StudentAuditCardProps) {
  const events = data?.auditEvents ?? [];

  return (
    <Card className="p-5">
      <CardHeader className="mb-4">
        <CardTitle>Nhật ký xử lý</CardTitle>
        <Badge color="primary">Đã kiểm soát</Badge>
      </CardHeader>
      {events.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có bản ghi nhật ký mới.</p>
      ) : (
        <ul className="divide-y divide-card-border">
          {events.map((event) => (
            <li key={`${event.actor}-${event.time}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                  event.tone === "success"
                    ? "bg-badge-success-background text-success-500"
                    : "bg-badge-primary-background text-badge-primary-text"
                }`}
                aria-hidden="true"
              >
                {event.tone === "success" ? <CheckCircle1 size={14} /> : <ClockThree size={14} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{event.action}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {event.actor || "-"} · {formatDateTime(event.time)}
                </p>
              </div>
              <Badge color={event.tone}>{event.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
