export type NextBestActionMetaStatus =
  | "available"
  | "partial"
  | "ai_unavailable";
export type NextBestActionAiStatus = "available" | "degraded" | "unavailable";
export type NextBestActionStatus = "today" | "soon" | "overdue";
export type NextBestActionPriority = "high" | "medium" | "low";
export type NextBestActionControlLevel = "automatic" | "review" | "approval";
export type NextBestActionState =
  | "proposed"
  | "assigned"
  | "deferred"
  | "dismissed"
  | "expired";
export type NextBestActionSlaTone = "success" | "warning" | "error";
export type NextBestActionRiskPriority = "high" | "watch";

export interface DirectorNextBestActionMeta {
  admissionYear: number;
  scope: string;
  scopeLabel: string;
  asOf: string;
  timezone: string;
  status: NextBestActionMetaStatus;
  aiStatus: NextBestActionAiStatus;
  modelVersion: string | null;
  policyVersion: string;
  warnings: string[] | null;
}

export interface DirectorNextBestActionItem {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  schoolId: string | null;
  school: string;
  interest: string | null;
  recommendationCode: string;
  recommendation: string;
  summary: string;
  dueAt: string | null;
  dueLabel: string;
  status: NextBestActionStatus;
  priority: NextBestActionPriority;
  impact: string;
  currentProbability: number | null;
  projectedProbability: number | null;
  confidence: number;
  suggestedAssigneeId: string | null;
  suggestedAssignee: string | null;
  evidence: string[];
  talkingPoints: string[];
  recentActivity: Array<{
    id: string;
    label: string;
    occurredAt: string;
    time: string | null;
  }>;
  controlLevel: NextBestActionControlLevel;
  state: NextBestActionState;
  generatedAt: string;
  expiresAt: string | null;
  version: number;
}

export interface DirectorNextBestActionQueue {
  actions: DirectorNextBestActionItem[];
  counts: {
    all: number;
    urgent: number;
    today: number;
    overdue: number;
    soon: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
  };
}

export interface DirectorNextBestActionSla {
  responseWindowHours: number;
  onTimeRate: number | null;
  onTimeDetail: string;
  statusBuckets: Array<{
    id: "within-sla" | "due-soon" | "overdue";
    label: string;
    count: number;
    share: number;
    detail: string;
    tone: NextBestActionSlaTone;
  }>;
  riskCases: Array<{
    studentId: string;
    name: string;
    school: string;
    probability: number | null;
    silentForHours: number | null;
    silentFor: string;
    ownerId: string | null;
    owner: string;
    priority: NextBestActionRiskPriority;
    href: string;
  }>;
  riskReasons: Array<{
    id: string;
    label: string;
    percentage: number;
    detail: string;
  }>;
}

export interface DirectorNextBestActionOutcomes {
  period: string;
  rows: Array<{
    id: string;
    label: string;
    submitted: number;
    accepted: number;
    executed: number;
    progressed: number;
    transitionRate: number | null;
  }>;
}

export interface DirectorNextBestActionControlPolicy {
  version: string;
  rows: Array<{
    level: NextBestActionControlLevel;
    label: string;
    actionTypes: string[];
    detail: string;
    execution: "system" | "business-rule" | "human-confirmation";
  }>;
}

export interface DirectorNextBestActionData {
  meta: DirectorNextBestActionMeta;
  queue: DirectorNextBestActionQueue;
  sla: DirectorNextBestActionSla;
  outcomes: DirectorNextBestActionOutcomes;
  controlPolicy: DirectorNextBestActionControlPolicy;
}

export type DirectorNextBestActionResponse = DirectorNextBestActionData;

export interface DirectorNextBestActionParams {
  admissionYear?: number;
  scope?: string;
  queueFilter?: "all" | "urgent";
  page?: number;
  pageSize?: number;
  outcomePeriod?: string;
}

export type ActionCommand = "assign" | "defer" | "dismiss";

export interface ActionCommandRequest {
  actionId: string;
  command: ActionCommand;
  assigneeId?: string;
  deferUntil?: string;
  reason?: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export interface ActionCommandResponse {
  actionId: string;
  command: ActionCommand;
  state: "assigned" | "deferred" | "dismissed";
  version: number;
  appliedAt: string;
  deferUntil: string | null;
  replayed: boolean;
  audit: {
    eventId: string | null;
    actorId: string;
    occurredAt: string;
  };
}
