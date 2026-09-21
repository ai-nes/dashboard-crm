"use client";

import type { InteractionIntelligence } from "@/services/api/interaction-intelligence/types";

interface StudentConversationSummaryProps {
  interactionId: string;
  intelligence?: InteractionIntelligence | null;
}

export default function StudentConversationSummary({
  interactionId,
  intelligence,
}: StudentConversationSummaryProps) {
  const summary = intelligence?.conversation_summary;
  const flatSummary = intelligence?.summary?.trim();
  const fallbackSummary = summary
    ? [
        summary.problem.description
          ? `Học sinh đã trao đổi về: ${summary.problem.description}`
          : null,
        summary.resolution.description
          ? `Sale đã tư vấn: ${summary.resolution.description}`
          : null,
        summary.result.description || summary.result.next_action
          ? `Kết quả: ${summary.result.description || summary.result.next_action}`
          : null,
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const displaySummary = flatSummary || fallbackSummary;

  if (!displaySummary) return null;

  return (
    <section aria-labelledby={`conversation-summary-${interactionId}`}>
      <h3
        id={`conversation-summary-${interactionId}`}
        className="text-sm font-semibold text-text-primary"
      >
        Tóm tắt toàn bộ cuộc trò chuyện
      </h3>
      <p className="mt-3 rounded-lg border border-card-border bg-card-background p-3 text-sm leading-5 text-text-secondary">
        {displaySummary}
      </p>
    </section>
  );
}
