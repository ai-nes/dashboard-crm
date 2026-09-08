import type { DecisionRef, EvidenceRef, SubjectRef } from "../intelligence-refs";

export type ConsultationWorkspace = {
  contract_version: "consultation-workspace-v1";
  subject?: SubjectRef;
  decision?: DecisionRef;
  context_revision?: string;
  status: "ready" | "stale" | "expired" | "denied" | "not_found" | "insufficient" | "unavailable";
  evidence: EvidenceRef[];
  findings: unknown[];
  opportunities: string[];
  verified_facts: string[];
  risks: string[];
  goal?: string | null;
  missing_evidence: string[];
  verification_questions: string[];
};

export async function getConsultationWorkspace(
  recommendationId: string,
  options: { baseUrl?: string; sourceRevision?: string } = {},
): Promise<ConsultationWorkspace> {
  if (!recommendationId.trim()) throw new Error("recommendationId is required");
  const baseUrl = (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(/\/+$/, "");
  if (!baseUrl) throw new Error("Frappe URL is not configured");
  const query = new URLSearchParams({ recommendation: recommendationId.trim() });
  if (options.sourceRevision) query.set("source_revision", options.sourceRevision);
  const response = await fetch(`${baseUrl}/api/method/crm.api.consultation_workspace.get_consultation_workspace?${query}`, { credentials: "include" });
  if (!response.ok) throw new Error(`Unable to load consultation workspace (${response.status})`);
  const body = (await response.json()) as { message?: ConsultationWorkspace };
  if (!body.message || body.message.contract_version !== "consultation-workspace-v1") throw new Error("Consultation workspace response is invalid");
  return body.message;
}
