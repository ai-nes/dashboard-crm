export type InteractionAnalysisState =
  | "no_intent"
  | "intent_bearing"
  | "unknown"
  | "failed";

export type InteractionDirection = "inbound" | "outbound" | "internal";
export type InteractionEpisodeState = "open" | "sealed";
export type IntentImportance = "Medium" | "High" | "Very High";

export const INTENT_TYPE_CODES = [
  "PROGRAM_INTEREST",
  "ADMISSION_REQUIREMENT",
  "TUITION_FEE",
  "SCHOLARSHIP",
  "APPLICATION_GUIDANCE",
  "APPLICATION_STATUS",
  "DOCUMENT_REQUIREMENT",
  "DEADLINE",
  "CAREER_COUNSELING",
  "CAMPUS_INFORMATION",
  "STUDENT_LIFE",
  "ENROLLMENT_CONFIRMATION",
  "WITHDRAWAL_OR_HESITATION",
  "REQUEST_CONTACT",
  "OTHER",
] as const;

export type IntentTypeCode = (typeof INTENT_TYPE_CODES)[number];

export const INTERACTION_TYPE_CODES = [
  "PHONE_CALL",
  "MESSAGE",
  "EMAIL",
  "MEETING",
  "FORM_SUBMISSION",
  "APPLICATION_UPDATE",
  "DOCUMENT_SUBMISSION",
  "EVENT_PARTICIPATION",
  "PAYMENT",
  "SYSTEM_ACTIVITY",
  "NOTE",
  "OTHER",
] as const;

export type InteractionTypeCode = (typeof INTERACTION_TYPE_CODES)[number];

export type InteractionSemanticChannel =
  | "email"
  | "chat"
  | "call"
  | "system"
  | "event"
  | "campaign"
  | "internal"
  | (string & {});

export type InteractionSemanticPurpose =
  | "outreach"
  | "conversation"
  | "counseling"
  | "lifecycle"
  | (string & {});

export type InteractionSemanticDisposition =
  | "sent"
  | "received"
  | "connected"
  | "stage_changed"
  | (string & {});

export type InteractionEvidenceKind =
  | "interaction"
  | "lifecycle_event"
  | "consent_event"
  | (string & {});

export interface InteractionSemantic {
  channel?: InteractionSemanticChannel | null;
  purpose?: InteractionSemanticPurpose | null;
  disposition?: InteractionSemanticDisposition | null;
  is_direct_touchpoint?: boolean | null;
  evidence_kind?: InteractionEvidenceKind | null;
}

export interface InteractionSummary {
  id: string;
  occurred_at?: string | null;
  interaction_type: InteractionTypeCode | (string & {});
  interaction_label?: string | null;
  channel?: InteractionSemanticChannel | null;
  direction?: InteractionDirection | (string & {}) | null;
  outcome?: string | null;
  summary?: string | null;
  episode_state?: InteractionEpisodeState | (string & {}) | null;
  analysis_state?: InteractionAnalysisState | (string & {}) | null;
  semantic?: InteractionSemantic | null;
  source_type?: string | null;
  source_id?: string | null;
  source_revision?: number | null;
  has_evidence?: boolean;
  evidence_available?: boolean;
}

export interface InteractionFeedResponse {
  contract_version?: string;
  items: InteractionSummary[];
  next_cursor?: string | null;
}

export interface InteractionIntent {
  id?: string;
  term_id?: string | null;
  semantic_key: IntentTypeCode | (string & {});
  display_name?: string | null;
  role?: string | null;
  polarity?: string | null;
  importance?: IntentImportance | (string & {}) | null;
  confidence?: number | null;
  analysis_result?: string | null;
  notes?: string | null;
  modified_at?: string | null;
}

export interface ConversationEvidenceReference {
  doctype: string;
  name: string;
  actor_role: "student" | "parent" | (string & {});
}

export interface ConversationProblem {
  identified: boolean;
  description: string;
  evidence_refs: ConversationEvidenceReference[];
}

export interface ConversationResolution {
  status: "resolved" | "partially_resolved" | "unresolved" | "unknown" | (string & {});
  description: string;
  evidence_refs: ConversationEvidenceReference[];
}

export interface ConversationResult {
  status:
    | "completed"
    | "follow_up_required"
    | "no_response"
    | "not_interested"
    | "unknown"
    | (string & {});
  description: string;
  next_action?: string;
  evidence_refs: ConversationEvidenceReference[];
}

export interface ConversationSummary {
  problem: ConversationProblem;
  resolution: ConversationResolution;
  result: ConversationResult;
}

export interface InteractionIntelligence {
  summary?: string | null;
  sentiment?: "positive" | "neutral" | "negative" | "mixed" | (string & {}) | null;
  entities?: Record<string, string[]> | null;
  readiness?: "ready" | "hesitant" | "unknown" | (string & {}) | null;
  concerns?: string[] | null;
  conversation_summary?: ConversationSummary | null;
}

export interface InteractionAnalysis {
  name?: string | null;
  analysis_run?: string | null;
  state: InteractionAnalysisState | (string & {});
  source_revision?: number | null;
  source_digest?: string | null;
  result_digest?: string | null;
  policy_revision?: string | number | null;
  model_revision?: string | null;
  intent?: string | null;
  terminal_reason?: string | null;
  intelligence?: InteractionIntelligence | null;
}

export interface InteractionScoreEffect {
  id?: string;
  source_score_input_revision?: number | null;
  policy_revision?: string | number | null;
  policy_hash?: string | null;
  scored_at?: string | null;
  final_score?: number | null;
  score_change?: number | null;
  delta?: number | null;
  display_reason?: string | null;
  source_key?: string | null;
  contributors?: Array<Record<string, unknown>>;
}

export interface InteractionRevision {
  source_revision?: number | null;
  evidence_digest?: string | null;
}

export interface InteractionEvidenceReference {
  id: string;
  speaker_role?: string | null;
  kind?: string | null;
  occurred_at?: string | null;
}

export interface InteractionDetailResponse {
  contract_version?: string;
  interaction: InteractionSummary;
  revision?: InteractionRevision | null;
  analysis?: InteractionAnalysis | null;
  intents: InteractionIntent[];
  score_effects: InteractionScoreEffect[];
  evidence_ref?: string | null;
  evidence_refs: InteractionEvidenceReference[];
}

export type InteractionNpsStatus = "scored" | "abstained" | "superseded";

export interface InteractionNpsPoint {
  name: string;
  interaction: string;
  analysis_run?: string | null;
  student?: string | null;
  sale?: string | null;
  sale_user?: string | null;
  agent_id?: string | null;
  interaction_datetime?: string | null;
  source_revision?: number | null;
  status: InteractionNpsStatus | (string & {});
  terminal_reason?: string | null;
  satisfaction_score?: number | null;
  resolution_score?: number | null;
  friction_score?: number | null;
  complaint_score?: number | null;
  total_score?: number | null;
  normalized_score?: number | null;
  confidence?: "low" | "medium" | "high" | (string & {}) | null;
  evidence_refs?: Record<string, unknown> | null;
  explanation?: string | null;
  policy_revision?: string | null;
  model_revision?: string | null;
  contract_version?: string | null;
  supersedes?: string | null;
  superseded_by?: string | null;
}

export interface InteractionNpsPointResponse {
  point: InteractionNpsPoint | null;
}

export interface NpsSaleSummary {
  sale: string;
  sale_user?: string | null;
  count: number;
  average_score: number;
  average_normalized_score: number;
}

export interface NpsSaleSummaryResponse {
  records: NpsSaleSummary[];
  total_points: number;
}

export interface InteractionEvidence {
  contract_version?: string;
  id: string;
  interaction?: string | null;
  kind?: string | null;
  state?: string | null;
  occurred_at?: string | null;
  channel?: string | null;
  direction?: string | null;
  speaker_role?: string | null;
  content?: string | null;
  content_redacted?: boolean;
}

export interface InteractionTarget {
  student?: string;
  contact?: string;
}

export interface InteractionFeedFilters {
  channel?: InteractionSemanticChannel;
  direction?: InteractionDirection | (string & {});
  status?: InteractionEpisodeState | (string & {});
  family?: InteractionSemanticPurpose;
  search?: string;
  interaction_type?: InteractionTypeCode | (string & {});
  outcome?: string;
  source_type?: string;
  source_id?: string;
  from_date?: string;
  to_date?: string;
  cursor?: string;
  limit?: number;
}

export interface InteractionCatalogItem {
  name?: string;
  code: string;
  display_name?: string | null;
  enabled: boolean;
  sort_order?: number | null;
  description?: string | null;
}

export interface InteractionType extends InteractionCatalogItem {
  code: InteractionTypeCode | (string & {});
  sort_order: number;
}

export interface IntentType extends InteractionCatalogItem {
  code: IntentTypeCode | (string & {});
  importance: IntentImportance;
  sort_order: number;
}

export interface InteractionCatalog {
  interactionTypes: InteractionType[];
  intentTypes: IntentType[];
}

export interface InteractionRequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface CreateInteractionInput {
  student: string;
  interaction_type: string;
  interaction_datetime?: string;
  outcome?: string;
  summary?: string;
  notes?: string;
}
