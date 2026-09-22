"use client";

import StudentInteractionDetail from "./student-interaction-detail";
import StudentConversationSummary from "./student-conversation-summary";

interface CanonicalCallAnalysisProps {
  interactionId?: string | null;
  callSummary?: string | null;
}

export default function StudentCanonicalCallAnalysis({
  interactionId,
  callSummary,
}: CanonicalCallAnalysisProps) {
  const normalizedInteractionId = interactionId?.trim();

  if (!normalizedInteractionId) {
    return callSummary ? (
      <StudentConversationSummary callSummary={callSummary} />
    ) : null;
  }

  return (
    <StudentInteractionDetail
      interactionId={normalizedInteractionId}
      callSummary={callSummary}
    />
  );
}
