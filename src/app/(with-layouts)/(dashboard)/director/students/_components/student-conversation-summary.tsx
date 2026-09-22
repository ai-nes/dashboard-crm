"use client";

import type { InteractionIntelligence } from "@/services/api/interaction-intelligence/types";

interface StudentConversationSummaryProps {
  intelligence?: InteractionIntelligence | null;
}

export default function StudentConversationSummary({
  intelligence,
}: StudentConversationSummaryProps) {
  const summary = intelligence?.conversation_summary;
  const flatSummary = intelligence?.summary?.trim();

  if (!summary && !flatSummary) return null;

  return (
    <section aria-label="Tóm tắt cuộc gọi">
      {summary ? (
        <div className="grid gap-3 md:grid-cols-3">
          <ConversationSummarySection
            title="Học sinh đã trao đổi"
            description={summary.problem.description}
          />
          <ConversationSummarySection
            title="Tư vấn viên đã tư vấn"
            description={summary.resolution.description}
          />
          <ConversationSummarySection
            title="Kết quả"
            description={
              summary.result.description || summary.result.next_action
            }
          />
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-card-border bg-card-background p-3 text-sm leading-5 text-text-secondary">
          {flatSummary}
        </p>
      )}
    </section>
  );
}

function ConversationSummarySection({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3">
      <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      <p className="mt-2 min-h-10 text-sm leading-5 text-text-secondary">
        {description || "Chưa có thông tin rõ ràng."}
      </p>
    </div>
  );
}
