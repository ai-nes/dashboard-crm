/** What crm-backend serves for the AI half of a student profile (`/api/v1/students/:id/ai`). */

export type StudentAiState = "idle" | "queued" | "running" | "failed";

export type AiLevel = "high" | "medium" | "low" | "unknown";

export interface AiRef {
  type: string;
  id: string;
}

export interface AiDimensionEvidence {
  ref: AiRef;
  note: string;
}

export interface AiDimension {
  code: string;
  level: AiLevel;
  level_source: "crm" | "ai";
  summary?: string | null;
  evidence?: AiDimensionEvidence[];
  missing?: string[];
}

export interface AiInsightCard {
  headline?: string | null;
  points?: string[];
  status_label?: string | null;
  refs?: AiRef[];
}

export interface AiInsight {
  insight_card: AiInsightCard;
  dimensions: AiDimension[];
  positives: Array<{ text: string; refs: AiRef[] }>;
}

export interface AiNbaItem {
  rank: number;
  need_code: string;
  need_score: number;
  action_code: string;
  title: string;
  goal: string;
  why: string;
  time: string;
  refs?: AiRef[];
}

export interface AiNba {
  run_id: string;
  disposition: "RECOMMEND" | "NO_ACTION" | "STOPPED";
  recheck_at: string | null;
  items: AiNbaItem[];
}

export interface StudentAnalysis {
  student_id: string;
  source_revision: number;
  generated_at: string;
  insight: AiInsight;
  nba: AiNba;
  ai_reused: boolean;
}

export interface StudentAiLabels {
  dimensions: Record<string, { label: string; levels: Record<string, string> }>;
  status: Record<string, string>;
  actions: Record<string, string>;
  needs: Record<string, string>;
  memory_types: Record<string, string>;
}

export interface StudentAiOverview {
  student_id: string;
  revision: number;
  /** False when crm-backend has no crm-ai configured, so nothing can be analysed. */
  enabled: boolean;
  state: StudentAiState;
  error?: string;
  analysis: StudentAnalysis | null;
  /** The analysis was made before the student's data last changed. */
  stale: boolean;
  labels: StudentAiLabels;
}

export type AiMemoryStatus = "open" | "done" | "contradicted" | "superseded";

export interface AiMemoryItem {
  id: string;
  type: string;
  subject: "student" | "parent" | "sale";
  text: string;
  due: string | null;
  status: AiMemoryStatus;
  /** Who wrote it last: the AI or a sale. */
  source: "ai" | "sale";
  valid_from: string;
  updated_at: string;
}

export interface AiMemoryEdit {
  text?: string;
  /** `null` clears the due date. */
  due?: string | null;
}
