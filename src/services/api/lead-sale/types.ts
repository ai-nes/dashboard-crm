export type LeadSaleOverviewStatus = "available" | "partial" | "unavailable";
export type LeadSaleTrendRange = "4w" | "3m";

export interface LeadSaleOverviewMeta {
  viewer: { id: string; displayName: string };
  team: { id: string; name: string };
  admissionYear: number;
  date: string;
  asOf: string;
  timezone: string;
  status: LeadSaleOverviewStatus;
  warnings: string[];
}

export type LeadSaleKpiId =
  | "active"
  | "new"
  | "unassigned"
  | "needs-action"
  | "overdue"
  | "documents";

export interface LeadSaleKpi {
  id: LeadSaleKpiId;
  value: number;
}

export type LeadSaleInterventionId =
  | "unassigned"
  | "not-contacted"
  | "at-risk"
  | "blocked";

export interface LeadSaleIntervention {
  id: LeadSaleInterventionId;
  count: number;
}

export type LeadSaleTeamMemberStatus = "on-track" | "needs-support";

export interface LeadSaleTeamMember {
  id: string;
  displayName: string;
  activeStudents: number;
  consulted: number;
  admitted: number;
  status: LeadSaleTeamMemberStatus;
}

export type LeadSaleStudentStatusId =
  | "new"
  | "attempting"
  | "connected"
  | "qualified"
  | "disqualified";

export interface LeadSaleStudentStatusItem {
  id: LeadSaleStudentStatusId;
  label: string;
  count: number;
  share: number | null;
}

export interface LeadSaleStudentStatus {
  total: number;
  items: LeadSaleStudentStatusItem[];
}

export interface LeadSaleTrendPoint {
  label: string;
  periodStart: string;
  periodEnd: string;
  consulted: number;
  admitted: number;
}

export interface LeadSaleTrendRangeData {
  from: string;
  to: string;
  points: LeadSaleTrendPoint[];
}

export interface LeadSaleResultTrend {
  defaultRange: LeadSaleTrendRange;
  ranges: Record<LeadSaleTrendRange, LeadSaleTrendRangeData>;
}

export interface LeadSaleOverviewResponse {
  meta: LeadSaleOverviewMeta;
  kpis: LeadSaleKpi[];
  interventions: { items: LeadSaleIntervention[] };
  teamPerformance: { items: LeadSaleTeamMember[] };
  studentStatus: LeadSaleStudentStatus;
  resultTrend: LeadSaleResultTrend;
  dashboard: LeadSaleDashboardPayload;
}

export type LeadSaleDashboardStageId =
  | "new"
  | "attempting"
  | "connected"
  | "qualified";

export interface LeadSaleDashboardSummary {
  enrollment: number;
  target: number | null;
  achievement: number | null;
  remaining: number | null;
  expected: number;
  coverage: number | null;
  openOpportunities: number;
  newOpportunities: number;
  winRate: number;
  followUpDue: number;
  overdue: number;
  actionRequired: number;
}

export interface LeadSaleDashboardAction {
  id: "overdue" | "unassigned" | "due-today" | "aging";
  value: number;
  longestAgeDays: number;
}

export interface LeadSaleDashboardPriorityRecord {
  id: string;
  name: string;
  owner: string;
  stageId: LeadSaleDashboardStageId;
  stageLabel: string;
  issueCode: "overdue" | "missing-documents" | "uncontacted" | "aging";
  ageDays: number;
  nextAction: string;
  lastActivityAt: string;
}

export interface LeadSaleDashboardStage {
  id: LeadSaleDashboardStageId;
  label: string;
  volume: number;
  nextStepConversion: number | null;
  averageDays: number;
  actionItemCount: number;
}

export interface LeadSaleDashboardRep {
  id: string;
  displayName: string;
  target: number | null;
  enrollment: number;
  achievement: number | null;
  remaining: number | null;
  expected: number;
  coverage: number | null;
  winRate: number;
  closedOpportunities: number;
  wonOpportunities: number;
  openOpportunities: number;
  overdue: number;
  avgStageAgeDays: number;
  actionItemCount: number;
  pipeline: {
    newOpportunities: number;
    followUpDue: number;
    stageVolumes: Record<string, number>;
    stageActionItemCounts: Record<string, number>;
    agingBuckets: Record<string, number>;
    trend: LeadSaleDashboardTrendPoint[];
  };
}

export interface LeadSaleDashboardTrendPoint {
  period: string;
  stageCounts: Record<LeadSaleDashboardStageId, number>;
}

export interface LeadSaleDashboardAgingBucket {
  id: "0-2-days" | "3-5-days" | "6-10-days" | "over-10-days";
  count: number;
}

export interface LeadSaleDashboardPayload {
  summary: LeadSaleDashboardSummary;
  actions: LeadSaleDashboardAction[];
  priorityQueue: LeadSaleDashboardPriorityRecord[];
  stages: LeadSaleDashboardStage[];
  reps: LeadSaleDashboardRep[];
  trend: LeadSaleDashboardTrendPoint[];
  agingBuckets: LeadSaleDashboardAgingBucket[];
  status?: LeadSaleOverviewStatus;
}

export interface LeadSaleOverviewParams {
  admissionYear?: number;
  date?: string;
  trendRange?: LeadSaleTrendRange;
  timezone?: string;
  teamMemberLimit?: number;
}
