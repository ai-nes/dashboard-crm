"use client";

import type { InteractionIntelligence } from "@/services/api/interaction-intelligence/types";

interface StudentConversationSummaryProps {
  intelligence?: InteractionIntelligence | null;
  callSummary?: string | null;
}

export default function StudentConversationSummary({
  intelligence,
  callSummary,
}: StudentConversationSummaryProps) {
  const summary = intelligence?.conversation_summary;
  const flatSummary = intelligence?.summary?.trim();
  const resultSummary = callSummary?.trim();
  const studentSummary = summary?.problem.description;
  const advisorSummary = summary?.resolution.description;
  const outcomeSummary =
    resultSummary ||
    summary?.result.description ||
    summary?.result.next_action ||
    flatSummary;

  if (!studentSummary && !advisorSummary && !outcomeSummary) return null;

  return (
    <section aria-label="Tóm tắt cuộc gọi">
      <div className="space-y-4">
        <ConversationSummarySection
          title="Học sinh đã trao đổi"
          description={studentSummary}
        />
        <ConversationSummarySection
          title="Tư vấn viên đã tư vấn"
          description={advisorSummary}
        />
        <ConversationSummarySection
          title="Kết quả"
          description={outcomeSummary}
        />
      </div>
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
    <div>
      <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      <p className="mt-1 text-sm leading-5 text-text-secondary">
        {description || "Chưa có thông tin rõ ràng."}
      </p>
    </div>
  );
}
