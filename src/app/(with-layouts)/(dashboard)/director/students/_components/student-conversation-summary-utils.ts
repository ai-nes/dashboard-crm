import type { InteractionIntelligence } from "@/services/api/interaction-intelligence/types";

export type StudentConversationSummaryModel =
  | {
      kind: "structured";
      studentDescription: string | null;
      advisorDescription: string | null;
      resolutionStatus: string;
      resultDescription: string | null;
      nextAction: string | null;
    }
  | { kind: "fallback"; description: string }
  | null;

const resolutionStatusLabels: Record<string, string> = {
  resolved: "Đã giải quyết",
  partially_resolved: "Đã xử lý một phần",
  unresolved: "Chưa giải quyết",
  unknown: "Chưa đủ thông tin",
};

export function getResolutionStatusLabel(status: string | null | undefined): string {
  if (!status) return "Chưa đủ thông tin";
  return resolutionStatusLabels[status] ?? "Chưa đủ thông tin";
}

function cleanText(value?: string | null): string | null {
  return value?.trim() || null;
}

export function buildStudentConversationSummaryModel(
  intelligence?: InteractionIntelligence | null,
  callSummary?: string | null,
): StudentConversationSummaryModel {
  const structured = intelligence?.conversation_summary;
  if (hasCompleteStructuredSummary(structured)) {
    return {
      kind: "structured",
      studentDescription: cleanText(structured.problem?.description),
      advisorDescription: cleanText(structured.resolution?.description),
      resolutionStatus: getResolutionStatusLabel(structured.resolution?.status),
      resultDescription: cleanText(structured.result?.description),
      nextAction: cleanText(structured.result?.next_action),
    };
  }

  const description = cleanText(intelligence?.summary) || cleanText(callSummary);
  return description ? { kind: "fallback", description } : null;
}

function hasCompleteStructuredSummary(
  summary: InteractionIntelligence["conversation_summary"],
): summary is NonNullable<InteractionIntelligence["conversation_summary"]> {
  return Boolean(
    summary &&
      hasText(summary.problem?.description) &&
      hasText(summary.resolution?.status) &&
      hasText(summary.resolution?.description) &&
      hasText(summary.result?.status) &&
      hasText(summary.result?.description),
  );
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
