export interface StudentWorklistOutcomeOption {
  value: string;
  label: string;
}

export interface StudentWorklistItem {
  name: string;
  student: string | null;
  actionType: string | null;
  objective: string;
  state: string;
  executionStatus: string | null;
  priority: string;
  dueAt: string | null;
  actionOwner: string | null;
  origin: string | null;
  revision: number;
  packageRevision: number;
  outcome: string | null;
  outcomeCodes: StudentWorklistOutcomeOption[];
  linkedInteraction: string | null;
  permittedTransitions: string[];
  isToday: boolean;
  isOverdue: boolean;
}

export interface StudentWorklistActionsResponse {
  items: StudentWorklistItem[];
}

export type ActionExecutionStatus =
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export interface StartActionParams {
  action: string;
  expectedActionRevision: number;
  idempotencyKey: string;
}

export interface StartActionResponse {
  name: string;
  executionStatus: string;
  revision: number;
}

export interface CompleteActionParams {
  action: string;
  expectedActionRevision: number;
  expectedPackageRevision: number;
  idempotencyKey: string;
  outcomeCode: string;
  outcomeEvidence?: string;
  outcomeNotes?: string;
}

export interface CompleteActionResponse {
  name: string;
  executionStatus: string;
  revision: number;
}
