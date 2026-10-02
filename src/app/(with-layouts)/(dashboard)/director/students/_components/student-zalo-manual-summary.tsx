import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentZaloMessage } from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";
import { interactionOutcomeLabels } from "./student-interaction-utils";

export default function StudentZaloManualSummary({
  message,
}: {
  message: StudentZaloMessage;
}) {
  return (
    <article>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {message.recordedBy || "Chưa xác định"}
            <span className="ml-2 font-normal text-text-tertiary">
              Người ghi nhận
            </span>
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Ghi nhận trao đổi qua Zalo
          </p>
        </div>
        <time className="shrink-0 text-xs text-text-tertiary">
          {formatDateTime(message.time)}
        </time>
      </div>
      <div className="mt-3 w-fit max-w-2xl rounded-2xl rounded-tl-md bg-background-gray-secondary px-4 py-3">
        <p className="whitespace-pre-line break-words text-sm leading-6 text-text-primary">
          {message.summary ||
            (!message.notes ? message.content : "Ghi nhận Zalo")}
        </p>
        {message.notes ? (
          <div className="mt-3 border-t border-card-border pt-3">
            <p className="text-xs font-medium text-text-tertiary">Ghi chú</p>
            <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-text-secondary">
              {message.notes}
            </p>
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        <Badge color="sky">Ghi nhận thủ công</Badge>
        {message.outcome ? (
          <Badge color="gray">
            Kết quả:{" "}
            {interactionOutcomeLabels[message.outcome] || message.outcome}
          </Badge>
        ) : null}
      </div>
    </article>
  );
}
