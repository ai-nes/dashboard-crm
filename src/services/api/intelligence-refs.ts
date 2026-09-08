export type IntelligenceReferenceContractVersion = "intelligence-reference-v1";
export type SubjectRef = {
  contract_version: IntelligenceReferenceContractVersion;
  kind: "student" | "school";
  subject_id: string;
  tenant_id: string;
  admission_year?: string | null;
  cohort?: string | null;
};
export type EvidenceRef = {
  contract_version: IntelligenceReferenceContractVersion;
  evidence_id: string;
  subject: SubjectRef;
  source_kind: string;
  source_id: string;
  source_revision: string;
  status: "verified" | "missing" | "unavailable" | "denied" | "stale" | "conflicting";
  freshness: "fresh" | "stale" | "unknown";
  visibility: "shareable" | "source_scoped";
  coverage_id?: string | null;
};
export type Coverage = {
  contract_version: IntelligenceReferenceContractVersion;
  coverage_id: string;
  state: "available" | "missing" | "unavailable" | "denied" | "truncated" | "conflicting";
  included_count: number;
  omitted_count: number;
  reason?: string | null;
};
export type FindingRef = {
  contract_version: IntelligenceReferenceContractVersion;
  finding_id: string;
  subject: SubjectRef;
  kind: "fact" | "derived_signal" | "inference" | "risk" | "opportunity" | "unknown";
  code: string;
  evidence_refs: string[];
  freshness: "fresh" | "stale" | "unknown";
  confidence?: number | null;
};
export type DecisionRef = {
  contract_version: IntelligenceReferenceContractVersion;
  decision_id: string;
  domain: "student_nba" | "school_recommendation";
  subject: SubjectRef;
  disposition: "recommend" | "wait" | "no_action" | "abstain" | "review";
  policy_revision: string;
  evidence_refs: string[];
  finding_refs: string[];
  expires_at?: string | null;
  abstention_reason?: string | null;
};
export type OutcomeRef = {
  contract_version: IntelligenceReferenceContractVersion;
  outcome_id: string;
  subject: SubjectRef;
  kind: "impression" | "decision" | "execution" | "verified_outcome" | "correction";
  status: string;
  decision_id?: string | null;
  source_revision: string;
  verified: boolean;
};

export function isIntelligenceReference(value: unknown): value is { contract_version: IntelligenceReferenceContractVersion } {
  return !!value && typeof value === "object" && (value as { contract_version?: unknown }).contract_version === "intelligence-reference-v1";
}

