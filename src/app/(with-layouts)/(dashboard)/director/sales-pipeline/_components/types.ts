export const pipelineStages = [
  "new",
  "engaged",
  "qualified",
  "counselling",
  "application",
  "accepted",
  "enrolled",
] as const;

export type PipelineStage = (typeof pipelineStages)[number];
export type LeadRisk = "critical" | "attention" | "healthy" | "neutral";

export interface PipelineLead {
  id: string;
  name: string;
  initials: string;
  stage: PipelineStage;
  school: string;
  region: string;
  major: string;
  source: string;
  score: number;
  probability: number;
  lastInteraction: string;
  nextAction: string;
  owner: string;
  risk: LeadRisk;
  riskLabel?: string;
}

export interface DailyTask {
  id: string;
  leadId: string;
  title: string;
  dueLabel: string;
  type: "follow-up" | "hot" | "parent" | "application" | "visit";
  isOverdue?: boolean;
}
