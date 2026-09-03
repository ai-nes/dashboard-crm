import {
  ACTION_TYPES,
  type ActionType,
  type NbaDisposition,
  type NbaPackageSeed,
} from "@/services/api/director-next-best-action";

export type ActionStatus = "today" | "soon" | "overdue";
export type ActionPriority = "high" | "medium" | "low";
export type ActionControlLevel = "automatic" | "review" | "approval";

export { ACTION_TYPES };
export type { ActionType, NbaDisposition, NbaPackageSeed };

/** End-user label per action type — mirrors `_action_label` on the backend. */
export const ACTION_TYPE_LABEL: Record<ActionType, string> = {
  CALL: "Gọi điện",
  EMAIL: "Gửi email",
  MESSAGE: "Nhắn tin",
  COUNSELING: "Tư vấn",
  MEETING: "Gặp trực tiếp",
  EVENT_INVITE: "Mời sự kiện",
  CAMPUS_VISIT: "Tham quan cơ sở",
  DOCUMENT_REQUEST: "Yêu cầu hồ sơ",
  APPLICATION_SUPPORT: "Hỗ trợ nộp hồ sơ",
  PARENT_CONTACT: "Liên hệ phụ huynh",
  HANDOFF: "Chuyển tiếp",
};

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
  controlLevel?: ActionControlLevel;
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
  actionType?: ActionType | null;
  disposition?: NbaDisposition;
  packageSeed?: NbaPackageSeed | null;
  whyNow?: string | null;
  approach?: string | null;
  expectedOutcome?: string | null;
  evidenceRefIds?: string[];
}

export interface ActionOutcome {
  label: string;
  submitted: number;
  accepted: number;
  executed: number;
  progressed: number;
  transitionRate: number | null;
}
