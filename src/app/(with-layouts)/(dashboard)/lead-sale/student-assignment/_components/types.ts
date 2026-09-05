export type AssignmentStatus =
  | "assigned"
  | "no_match"
  | "missing_data"
  | "error";
export type AssignmentFilter =
  | "all"
  | "assigned"
  | "review"
  | "no_match"
  | "missing_data"
  | "error";
export type StepId =
  | "input"
  | "validation"
  | "classification"
  | "matching"
  | "review"
  | "assignment";

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  workload: number;
  capacity: number;
  remainingCapacity: number;
  score: number;
  eligible: boolean;
  reasons: string[];
}

export interface AssignmentRecord {
  id: string;
  name: string;
  initials: string;
  school: string;
  region: string;
  interest: string;
  source: string;
  time: string;
  status: AssignmentStatus;
  ownerId?: string;
  ownerName?: string;
  score?: number;
  method: "automatic" | "manual";
  reason?: string;
  revision: number;
  receivedAt: string;
}

export interface WorkflowStep {
  id: StepId;
  title: string;
  description: string;
  detail: string;
  rules: string[];
  tone: "neutral" | "blue" | "primary" | "warning" | "success";
  position: { x: number; y: number };
  status: "idle" | "running" | "success" | "warning" | "error";
  metrics: {
    processedCount: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
  };
}
