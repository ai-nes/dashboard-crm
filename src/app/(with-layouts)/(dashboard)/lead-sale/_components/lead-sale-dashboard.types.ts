import type {
  LeadSaleDashboardAction,
  LeadSaleDashboardAgingBucket,
  LeadSaleDashboardPayload,
  LeadSaleDashboardRep,
  LeadSaleDashboardStage,
  LeadSaleDashboardSummary,
  LeadSaleDashboardTrendPoint,
} from "@/services/api/lead-sale";

export type LeadSaleTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "violet";

export type LeadSaleDetailKind =
  | "records"
  | "sales-breakdown"
  | "stage-breakdown";

export interface LeadSaleDashboardFilters {
  period: string;
  program: string;
  source: string;
  region: string;
  sales: string;
}

export const DEFAULT_LEAD_SALE_FILTERS: LeadSaleDashboardFilters = {
  period: "admission-2025-2026",
  program: "all-programs",
  source: "all-sources",
  region: "all-regions",
  sales: "all-sales",
};

export const LEAD_SALE_HEALTH_THRESHOLDS = {
  minCoverage: 1,
  maxOverdue: 8,
  maxAvgStageAgeDays: 5,
} as const;

export const LEAD_SALE_FILTER_OPTIONS = {
  period: [
    { id: "admission-2025-2026", label: "Kỳ tuyển sinh 2025–2026" },
    { id: "admission-2026-2027", label: "Kỳ tuyển sinh 2026–2027" },
  ],
  program: [
    { id: "all-programs", label: "Tất cả chương trình" },
    { id: "technology", label: "Công nghệ thông tin" },
    { id: "business", label: "Kinh doanh" },
    { id: "marketing", label: "Marketing" },
  ],
  source: [
    { id: "all-sources", label: "Tất cả nguồn Lead" },
    { id: "facebook", label: "Facebook" },
    { id: "website", label: "Website" },
    { id: "referral", label: "Giới thiệu" },
  ],
  region: [
    { id: "all-regions", label: "Tất cả khu vực" },
    { id: "ho-chi-minh", label: "TP. Hồ Chí Minh" },
    { id: "ha-noi", label: "Hà Nội" },
    { id: "other", label: "Tỉnh / thành khác" },
  ],
  sales: [{ id: "all-sales", label: "Tất cả nhân viên tư vấn" }],
} as const;

export type LeadSaleDetailId =
  | "enrollment"
  | "forecast"
  | "overdue"
  | "unassigned"
  | "due-today"
  | "aging"
  | "stage-new"
  | "stage-attempting"
  | "stage-connected"
  | "stage-qualified"
  | "aging-0-2"
  | "aging-3-5"
  | "aging-6-10"
  | "aging-over-10"
  | "rep-a"
  | "rep-b"
  | "rep-c"
  | "rep-d"
  | "rep-e"
  | "record-minh-khoi"
  | "record-thao-nguyen"
  | "record-gia-han";

export type LeadSaleSummary = LeadSaleDashboardSummary;

export type LeadSaleAction = LeadSaleDashboardAction & {
  label: string;
  description: string;
  subtext: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
};

export type LeadSaleQueueRecord = Omit<
  LeadSaleDashboardPayload["priorityQueue"][number],
  "stageId" | "stageLabel" | "issueCode" | "ageDays" | "lastActivityAt"
> & {
  initials: string;
  stage: string;
  issue: string;
  age: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
};

export type LeadSaleStageAnalysis = LeadSaleDashboardStage & {
  note: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
};

export type LeadSaleRepPerformance = LeadSaleDashboardRep & {
  name: string;
  initials: string;
  detailId: LeadSaleDetailId;
};

export type LeadSaleTrendPoint = LeadSaleDashboardTrendPoint;

export type LeadSaleAgingBucket = LeadSaleDashboardAgingBucket & {
  label: string;
  note: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
};

export interface LeadSaleDetailMetric {
  label: string;
  value: string;
  note?: string;
}

export interface LeadSaleDetailRecord {
  id: string;
  name: string;
  initials: string;
  owner: string;
  stage: string;
  issue: string;
  age: string;
  lastActivity: string;
  nextAction: string;
  tone: LeadSaleTone;
}

export interface LeadSaleDetailBreakdownRow {
  id: string;
  label: string;
  value: string;
  note: string;
  detailId?: LeadSaleDetailId;
}

export interface LeadSaleDetail {
  id: LeadSaleDetailId;
  kind?: LeadSaleDetailKind;
  eyebrow: string;
  title: string;
  description: string;
  tone: LeadSaleTone;
  metrics: LeadSaleDetailMetric[];
  breakdown?: LeadSaleDetailBreakdownRow[];
  records: LeadSaleDetailRecord[];
  recommendedAction: string;
}

export interface LeadSaleDashboardData {
  asOf: string;
  teamName: string;
  periodLabel: string;
  scopeLabel: string;
  activeFilters: LeadSaleDashboardFilters;
  summary: LeadSaleSummary;
  actions: LeadSaleAction[];
  priorityQueue: LeadSaleQueueRecord[];
  stages: LeadSaleStageAnalysis[];
  reps: LeadSaleRepPerformance[];
  trend: LeadSaleTrendPoint[];
  agingBuckets: LeadSaleAgingBucket[];
  details: Record<LeadSaleDetailId, LeadSaleDetail>;
}
