export type AnalysisRunKind = "student" | "school";

export type AnalysisRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "abstained"
  | "failed"
  | "dead_lettered";

export type AnalysisStageKind = "student_360" | "next_best_action" | "school_360";

export type AnalysisClaimKind = "fact" | "inference" | "uncertainty" | "recommendation";

export type AnalysisVisibilityLabel = "shareable" | "source_scoped";

export interface AnalysisClaim {
  claimKind: AnalysisClaimKind;
  statement: string;
  provenanceIds: string[];
  visibilityLabel: AnalysisVisibilityLabel;
  confidence: number | null;
}

export interface AnalysisRunStage {
  id?: string;
  stageKind: AnalysisStageKind;
  status: AnalysisRunStatus;
  claims: AnalysisClaim[];
  terminalReason: string | null;
  policyRevision: string | null;
  modelRevision: string | null;
}

export interface AnalysisRunSnapshot {
  runId: string;
  runKind: AnalysisRunKind;
  receiptId?: string;
  status: AnalysisRunStatus;
  stages: AnalysisRunStage[];
  sourceRevision?: number | null;
  sourceDigest?: string | null;
  expiresAt?: string | null;
  reusedExistingRun?: boolean;
}

export interface StudentAnalysisRunRequest {
  studentId: string;
}

export interface SchoolAnalysisRunRequest {
  highSchool: string;
  admissionYear?: number;
}

export type AnalysisRunRequest =
  | { kind: "student"; studentId: string }
  | { kind: "school"; highSchool: string; admissionYear?: number };
