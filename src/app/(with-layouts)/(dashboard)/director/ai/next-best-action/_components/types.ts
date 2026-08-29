export type ActionStatus = "today" | "soon" | "overdue";

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
  suggestedAssignee: string;
  evidence: string[];
  talkingPoints: string[];
  recentActivity: { label: string; time: string }[];
}
