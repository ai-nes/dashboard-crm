"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  ConversationEvidenceReference,
  InteractionIntelligence,
} from "@/services/api/interaction-intelligence/types";

interface StudentConversationSummaryProps {
  interactionId: string;
  intelligence?: InteractionIntelligence | null;
}

const STATUS_LABELS: Record<string, string> = {
  resolved: "Đã giải quyết",
  partially_resolved: "Giải quyết một phần",
  unresolved: "Chưa giải quyết",
  completed: "Đã hoàn tất",
  follow_up_required: "Cần theo dõi tiếp",
  no_response: "Chưa có phản hồi",
  not_interested: "Chưa quan tâm",
  unknown: "Chưa đủ thông tin",
};

export default function StudentConversationSummary({
  interactionId,
  intelligence,
}: StudentConversationSummaryProps) {
  const summary = intelligence?.conversation_summary;
  const hasFlatSummary = Boolean(intelligence?.summary);

  if (!hasFlatSummary && !summary) return null;

  return (
    <section aria-labelledby={`conversation-summary-${interactionId}`}>
      <h3
        id={`conversation-summary-${interactionId}`}
        className="text-sm font-semibold text-text-primary"
      >
        Tóm tắt toàn bộ cuộc trò chuyện
      </h3>
      {hasFlatSummary ? (
        <p className="mt-3 rounded-lg border border-card-border bg-card-background p-3 text-sm leading-5 text-text-secondary">
          {intelligence?.summary}
        </p>
      ) : null}

      {summary ? (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <ConversationSummarySection
            title="Vấn đề"
            status={summary.problem.identified ? "Đã xác định" : "Chưa rõ"}
            description={summary.problem.description}
            evidenceRefs={summary.problem.evidence_refs}
          />
          <ConversationSummarySection
            title="Giải quyết"
            status={STATUS_LABELS[summary.resolution.status] ?? summary.resolution.status}
            description={summary.resolution.description}
            evidenceRefs={summary.resolution.evidence_refs}
          />
          <ConversationSummarySection
            title="Kết quả"
            status={STATUS_LABELS[summary.result.status] ?? summary.result.status}
            description={summary.result.description}
            nextAction={summary.result.next_action}
            evidenceRefs={summary.result.evidence_refs}
          />
        </div>
      ) : null}
    </section>
  );
}

function ConversationSummarySection({
  title,
  status,
  description,
  nextAction,
  evidenceRefs,
}: {
  title: string;
  status: string;
  description: string;
  nextAction?: string;
  evidenceRefs: ConversationEvidenceReference[];
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
        <Badge color="sky" size="sm">
          {status}
        </Badge>
      </div>
      <p className="mt-2 min-h-10 text-sm leading-5 text-text-secondary">
        {description || "Chưa có kết luận rõ ràng."}
      </p>
      {nextAction ? (
        <p className="mt-2 text-xs leading-4 text-text-tertiary">
          Bước tiếp theo: {nextAction}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-text-tertiary">
        {evidenceRefs.length > 0
          ? `${evidenceRefs.length} căn cứ từ học sinh/phụ huynh`
          : "Chưa có căn cứ trực tiếp"}
      </p>
    </div>
  );
}
