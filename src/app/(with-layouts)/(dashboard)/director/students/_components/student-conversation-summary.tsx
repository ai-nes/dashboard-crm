"use client";

import type { InteractionIntelligence } from "@/services/api/interaction-intelligence/types";
import { buildStudentConversationSummaryModel } from "./student-conversation-summary-utils";

interface StudentConversationSummaryProps {
  intelligence?: InteractionIntelligence | null;
  callSummary?: string | null;
}

export default function StudentConversationSummary({
  intelligence,
  callSummary,
}: StudentConversationSummaryProps) {
  const summary = buildStudentConversationSummaryModel(intelligence, callSummary);
  if (!summary) return null;

  if (summary.kind === "fallback") {
    return (
      <section aria-label="Tóm tắt cuộc trò chuyện">
        <ConversationSummarySection
          title="Tóm tắt cuộc trò chuyện"
          description={summary.description}
        />
      </section>
    );
  }

  return (
    <section aria-label="Tóm tắt cuộc trò chuyện">
      <div className="space-y-4">
        <ConversationSummarySection
          title="Học sinh đã trao đổi"
          description={summary.studentDescription}
          emptyDescription="Chưa ghi nhận nội dung học sinh trao đổi."
        />
        <ConversationSummarySection
          title="Tư vấn viên đã tư vấn"
          description={summary.advisorDescription}
          emptyDescription="Chưa ghi nhận nội dung tư vấn viên tư vấn."
        />
        <section>
          <h4 className="text-sm font-medium text-text-primary">Kết quả</h4>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            <span className="font-medium">Tình trạng xử lý:</span>{" "}
            {summary.resolutionStatus}
          </p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {summary.resultDescription || "Chưa có kết quả được ghi nhận."}
          </p>
          {summary.nextAction && (
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Việc tiếp theo: {summary.nextAction}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

function ConversationSummarySection({
  title,
  description,
  emptyDescription = "Chưa có nội dung được ghi nhận.",
}: {
  title: string;
  description?: string | null;
  emptyDescription?: string;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      <p className="mt-1 text-sm leading-5 text-text-secondary">
        {description || emptyDescription}
      </p>
    </div>
  );
}
