export type ActionStatus = "today" | "soon" | "overdue";
export type ActionPriority = "high" | "medium" | "low";

export interface RecommendedAction {
  id: string;
  studentId?: string;
  studentName: string;
  initials: string;
  schoolId?: string | null;
  school: string;
  interest: string;
  recommendationCode?: string;
  recommendation: string;
  summary: string;
  dueAt?: string | null;
  dueLabel: string;
  status: ActionStatus;
  priority: ActionPriority;
  impact: string;
  currentProbability?: number | null;
  projectedProbability?: number | null;
  confidence: number;
  suggestedAssignee: string;
  suggestedAssigneeId?: string | null;
  evidence: string[];
  talkingPoints: string[];
  recentActivity: { id?: string; label: string; time: string }[];
  state?: "proposed" | "assigned" | "deferred" | "dismissed" | "expired";
  generatedAt?: string;
  expiresAt?: string | null;
  version?: number;
}

export interface ActionOutcome {
  label: string;
  submitted: number;
  accepted: number;
  executed: number;
  progressed: number;
  transitionRate: number | null;
}
