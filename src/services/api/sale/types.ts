import type { NbaRecommendationPriority } from "@/services/api/nba/types";
import type { StudentStage } from "@/services/api/students/types";

export type SaleTrendRange = "4w" | "12w";
export type SaleOverviewStatus = "available" | "partial" | "unavailable";

export interface SaleOverviewMeta {
  viewer: { id: string; displayName: string };
  admissionYear: number;
  date: string;
  asOf: string;
  timezone: string;
  status: SaleOverviewStatus;
  warnings: string[];
}

export type SaleTaskType = "call" | "document" | "message" | "other";
export type SaleTaskPriority = "Low" | "Medium" | "High";
export type SaleTaskStatus =
  | "Backlog"
  | "Todo"
  | "In Progress"
  | "Done"
  | "Canceled";

export interface SaleTask {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  type: SaleTaskType;
  startAt: string | null;
  dueAt: string | null;
  context: string | null;
  priority: SaleTaskPriority;
  status: SaleTaskStatus;
  isOverdue: boolean;
}

export interface SaleTasks {
  priority: { overdueCount: number; items: SaleTask[] };
  summary: {
    today: { total: number; pending: number; completed: number };
    overdue: { count: number };
    upcoming: { count: number; horizonDays: number };
  };
}

export interface SaleConversionTrendPoint {
  label: string;
  periodStart: string;
  periodEnd: string;
  consulted: number;
}

export interface SaleConversionTrendRange {
  from: string;
  to: string;
  points: SaleConversionTrendPoint[];
}

export interface SaleConversionTrend {
  defaultRange: SaleTrendRange;
  ranges: Record<SaleTrendRange, SaleConversionTrendRange>;
}

export interface SaleStudentStageItem {
  stage: StudentStage;
  count: number;
  share: number | null;
}

export interface SaleStudentStages {
  total: number;
  items: SaleStudentStageItem[];
}

export interface SaleStudentActionNba {
  actionCode: string;
  title: string;
  priority: NbaRecommendationPriority;
  channel: string | null;
  reason: string | null;
  whyNow: string | null;
  salesNextStep: string | null;
  scheduledAt: string | null;
}

export interface SaleStudentAction {
  studentId: string;
  studentCode: string;
  studentName: string;
  studentStage: StudentStage;
  stageAgeDays?: number | null;
  lastActivityAt?: string | null;
  attentionReason?: string | null;
  nba?: SaleStudentActionNba | null;
}

export type SaleLeadProcessingStatus =
  | "NEW"
  | "PROCESSING"
  | "PROCESSED"
  | "ASSIGNED"
  | "CLOSED";
export type SaleLeadProcessingResolution =
  | "PENDING"
  | "MATCHED"
  | "CREATED"
  | "DUPLICATE"
  | "INVALID"
  | "SPAM"
  | "FAILED";

export interface SaleRecentLead {
  id: string;
  leadCode: string;
  name: string;
  phone: string | null;
  school: string | null;
  processingStatus: SaleLeadProcessingStatus;
  resolution: SaleLeadProcessingResolution;
  source: string;
  createdAt: string;
  contactNoAnswer: number;
  contactSuccess: number;
  nextAction: string;
}

export interface SaleRecentStudent {
  student: SaleStudentAction;
  school: string;
  major: string;
  source: string;
  latestActivity: string;
}

export interface SalePipelineAgingBucket {
  id: string;
  label: string;
  count: number;
}

export interface SalePipelineHealth {
  followUpDue: number;
  overdue: number;
  noActivity: number;
  agingBuckets: SalePipelineAgingBucket[];
}

export interface SaleOverviewResponse {
  meta: SaleOverviewMeta;
  tasks: SaleTasks;
  conversionTrend: SaleConversionTrend;
  studentStages: SaleStudentStages;
  studentActions: SaleStudentAction[];
  recentLeads: SaleRecentLead[];
  recentStudents: SaleRecentStudent[];
  health: SalePipelineHealth;
}

export interface SaleOverviewParams {
  admissionYear?: number;
  date?: string;
  trendRange?: SaleTrendRange;
  timezone?: string;
  priorityLimit?: number;
}
