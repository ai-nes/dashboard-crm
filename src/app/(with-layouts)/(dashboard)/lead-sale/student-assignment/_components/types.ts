export type AssignmentStatus =
  | "assigned"
  | "no_match"
  | "missing_data";
export type AssignmentFilter =
  | "all"
  | "assigned"
  | "review"
  | "no_match"
  | "missing_data";
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
  score?: number;
  method: "automatic" | "manual";
  reason?: string;
}

export interface WorkflowStep {
  id: StepId;
  title: string;
  description: string;
  detail: string;
  rules: string[];
  tone: "neutral" | "blue" | "primary" | "warning" | "success";
  position: { x: number; y: number };
}
