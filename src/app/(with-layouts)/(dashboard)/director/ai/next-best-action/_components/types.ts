export type ActionStatus = "today" | "soon" | "overdue";
export type ActionPriority = "high" | "medium" | "low";

export interface RecommendedAction {
  id: string;
  studentName: string;
  initials: string;
  school: string;
  interest: string;
  recommendation: string;
  summary: string;
  dueLabel: string;
  status: ActionStatus;
  priority: ActionPriority;
  impact: string;
  confidence: number;
  suggestedAssignee: string;
  evidence: string[];
  talkingPoints: string[];
  recentActivity: { label: string; time: string }[];
}

export interface ActionOutcome {
  label: string;
  submitted: number;
  accepted: number;
  executed: number;
  progressed: number;
  transitionRate: number;
}
