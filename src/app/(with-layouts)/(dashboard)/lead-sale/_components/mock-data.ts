export type LeadSaleTone = "primary" | "success" | "warning" | "danger" | "violet";

export type LeadSaleDetailKind = "records" | "sales-breakdown" | "stage-breakdown";

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
  sales: [
    { id: "all-sales", label: "Tất cả nhân viên tư vấn" },
    { id: "a", label: "Nguyễn Minh Anh" },
    { id: "b", label: "Trần Quốc Bảo" },
    { id: "c", label: "Lê Hoàng Châu" },
    { id: "d", label: "Phạm Gia Duy" },
    { id: "e", label: "Võ Thảo My" },
  ],
} as const;

export type LeadSaleDetailId =
  | "enrollment"
  | "forecast"
  | "overdue"
  | "unassigned"
  | "due-today"
  | "aging"
  | "stage-opportunity"
  | "stage-lead"
  | "stage-contacted"
  | "stage-qualified"
  | "stage-application"
  | "stage-enrollment"
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

export interface LeadSaleMockSummary {
  enrollment: number;
  target: number;
  achievement: number;
  remaining: number;
  expected: number;
  coverage: number;
  openOpportunities: number;
  newOpportunities: number;
  winRate: number;
  followUpDue: number;
  overdue: number;
  agingOverSla: number;
}

export interface LeadSaleActionSummary {
  id: string;
  label: string;
  value: number;
  description: string;
  subtext: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
}

export interface LeadSaleQueueRecord {
  id: string;
  name: string;
  initials: string;
  owner: string;
  stage: string;
  issue: string;
  age: string;
  nextAction: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
}

export interface LeadSaleStageAnalysis {
  id: string;
  label: string;
  volume: number;
  nextStepConversion: number | null;
  averageDays: number;
  slaDays: number;
  stalledCount: number;
  note: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
}

export interface LeadSaleRepPerformance {
  id: string;
  name: string;
  initials: string;
  target: number;
  enrollment: number;
  achievement: number;
  remaining: number;
  expected: number;
  coverage: number;
  winRate: number;
  closedOpportunities: number;
  wonOpportunities: number;
  openOpportunities: number;
  overdue: number;
  avgStageAgeDays: number;
  agingOverSlaCount: number;
  pipeline: LeadSaleRepPipelineProfile;
  detailId: LeadSaleDetailId;
}

export interface LeadSaleRepPipelineProfile {
  newOpportunities: number;
  followUpDue: number;
  stageVolumes: Record<string, number>;
  stageStalledCounts: Record<string, number>;
  agingBuckets: Record<string, number>;
  trend: LeadSaleTrendPoint[];
}

export interface LeadSaleTrendPoint {
  period: string;
  enrollment: number;
  target: number;
  newOpportunities: number;
}

export interface LeadSaleAgingBucket {
  id: string;
  label: string;
  count: number;
  note: string;
  tone: LeadSaleTone;
  detailId: LeadSaleDetailId;
}

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

export interface LeadSaleMockDashboardData {
  asOf: string;
  teamName: string;
  periodLabel: string;
  scopeLabel: string;
  activeFilters: LeadSaleDashboardFilters;
  summary: LeadSaleMockSummary;
  actions: LeadSaleActionSummary[];
  priorityQueue: LeadSaleQueueRecord[];
  stages: LeadSaleStageAnalysis[];
  reps: LeadSaleRepPerformance[];
  trend: LeadSaleTrendPoint[];
  agingBuckets: LeadSaleAgingBucket[];
  details: Record<LeadSaleDetailId, LeadSaleDetail>;
}

const detailRecord = (
  value: Omit<LeadSaleDetailRecord, "tone"> & { tone?: LeadSaleTone },
): LeadSaleDetailRecord => ({ tone: "warning", ...value });

const stageDetail = (config: {
  id: Extract<LeadSaleDetailId, "stage-opportunity" | "stage-lead" | "stage-contacted" | "stage-qualified" | "stage-application" | "stage-enrollment">;
  title: string;
  description: string;
  volume: number;
  nextStepConversion: number | null;
  averageDays: number;
  slaDays: number;
  stalledCount: number;
  tone: LeadSaleTone;
  records: LeadSaleDetailRecord[];
  recommendedAction: string;
}): LeadSaleDetail => ({
  id: config.id,
  kind: "records",
  eyebrow: "PHÂN TÍCH GIAI ĐOẠN",
  title: config.title,
  description: config.description,
  tone: config.tone,
  metrics: [
    { label: "Hồ sơ", value: String(config.volume) },
    {
      label: "Tỷ lệ chuyển đổi",
      value: config.nextStepConversion === null ? "—" : `${config.nextStepConversion}%`,
    },
    { label: "Hồ sơ vượt SLA", value: config.stalledCount ? `${config.stalledCount} hồ sơ` : "Không có" },
    {
      label: "Thời gian TB / SLA",
      value: config.slaDays ? `${config.averageDays.toFixed(1).replace(".", ",")} / ${config.slaDays} ngày` : "Giai đoạn cuối",
    },
  ],
  records: config.records,
  recommendedAction: config.recommendedAction,
});

const agingDetail = (config: {
  id: Extract<LeadSaleDetailId, "aging-0-2" | "aging-3-5" | "aging-6-10" | "aging-over-10">;
  title: string;
  description: string;
  label: string;
  count: number;
  tone: LeadSaleTone;
  records: LeadSaleDetailRecord[];
  recommendedAction: string;
}): LeadSaleDetail => ({
  id: config.id,
  kind: "records",
  eyebrow: "TUỔI HỒ SƠ",
  title: config.title,
  description: config.description,
  tone: config.tone,
  metrics: [
    { label: "Số hồ sơ", value: String(config.count) },
    { label: "Khoảng thời gian", value: config.label },
    { label: "Cần theo dõi", value: config.id === "aging-0-2" ? "Theo lịch" : "Có" },
  ],
  records: config.records,
  recommendedAction: config.recommendedAction,
});

const repDetail = (config: {
  id: Extract<LeadSaleDetailId, "rep-a" | "rep-b" | "rep-c" | "rep-d" | "rep-e">;
  title: string;
  description: string;
  tone: LeadSaleTone;
  metrics: LeadSaleDetailMetric[];
  records: LeadSaleDetailRecord[];
  recommendedAction: string;
}): LeadSaleDetail => ({
  id: config.id,
  kind: "records",
  eyebrow: "CHI TIẾT THEO SALE",
  title: config.title,
  description: config.description,
  tone: config.tone,
  metrics: config.metrics,
  records: config.records,
  recommendedAction: config.recommendedAction,
});

const createRepTrend = (rows: Array<[number, number, number]>): LeadSaleTrendPoint[] =>
  rows.map(([enrollment, target, newOpportunities], index) => ({
    period: `Tuần ${index + 1}`,
    enrollment,
    target,
    newOpportunities,
  }));

const REP_TRENDS: Record<string, LeadSaleTrendPoint[]> = {
  a: createRepTrend([[1, 2, 5], [3, 4, 6], [5, 6, 5], [8, 8, 9], [11, 10, 7], [13, 11, 8], [14, 12, 7], [16, 20, 8]]),
  b: createRepTrend([[1, 2, 4], [2, 3, 6], [4, 5, 5], [6, 7, 8], [8, 10, 7], [9, 10, 8], [10, 12, 6], [11, 20, 5]]),
  c: createRepTrend([[2, 2, 6], [4, 3, 7], [6, 5, 6], [9, 7, 10], [13, 10, 8], [15, 11, 8], [16, 12, 7], [18, 20, 9]]),
  d: createRepTrend([[1, 1, 5], [2, 3, 7], [3, 5, 7], [6, 7, 9], [8, 10, 8], [9, 11, 9], [10, 13, 8], [10, 20, 7]]),
  e: createRepTrend([[1, 1, 4], [2, 2, 5], [3, 3, 5], [5, 4, 6], [6, 6, 6], [7, 9, 6], [7, 9, 6], [8, 20, 6]]),
};

export const MOCK_LEAD_SALE_DASHBOARD: LeadSaleMockDashboardData = {
  asOf: "16/09/2026 · 10:30",
  teamName: "Đội tuyển sinh toàn quốc",
  periodLabel: "Kỳ tuyển sinh 2025–2026",
  scopeLabel: "Toàn đội · Tất cả chương trình · Tất cả nguồn · Tất cả khu vực",
  activeFilters: DEFAULT_LEAD_SALE_FILTERS,
  summary: {
    enrollment: 63,
    target: 100,
    achievement: 63,
    remaining: 37,
    expected: 41,
    coverage: 1.11,
    openOpportunities: 160,
    newOpportunities: 35,
    winRate: 35,
    followUpDue: 12,
    overdue: 31,
    agingOverSla: 12,
  },
  actions: [
    {
      id: "overdue",
      label: "Công việc quá hạn",
      value: 31,
      description: "Hồ sơ đang chờ xử lý nhưng đã quá hạn.",
      subtext: "Lâu nhất: 6 ngày",
      tone: "danger",
      detailId: "overdue",
    },
    {
      id: "unassigned",
      label: "Lead chưa phân công",
      value: 18,
      description: "Lead mới chưa có người phụ trách.",
      subtext: "Cần điều phối ngay",
      tone: "violet",
      detailId: "unassigned",
    },
    {
      id: "due-today",
      label: "Liên hệ hôm nay",
      value: 12,
      description: "Hồ sơ có lịch gọi lại hoặc tư vấn trong ngày.",
      subtext: "5 hồ sơ có nhu cầu cao",
      tone: "primary",
      detailId: "due-today",
    },
    {
      id: "aging",
      label: "Hồ sơ vượt SLA",
      value: 12,
      description: "Hồ sơ đã vượt mốc xử lý của giai đoạn hiện tại.",
      subtext: "Tập trung ở giai đoạn Cơ hội",
      tone: "warning",
      detailId: "aging",
    },
  ],
  priorityQueue: [
    {
      id: "minh-khoi",
      name: "Nguyễn Minh Khôi",
      initials: "MK",
      owner: "Phạm Gia Duy",
      stage: "Cơ hội",
      issue: "Quá hạn 3 ngày",
      age: "8 ngày ở giai đoạn này",
      nextAction: "Gọi lại trước 11:00",
      tone: "danger",
      detailId: "record-minh-khoi",
    },
    {
      id: "thao-nguyen",
      name: "Nguyễn Thảo",
      initials: "NT",
      owner: "Trần Quốc Bảo",
      stage: "Đủ điều kiện",
      issue: "Chưa có lần liên hệ đầu",
      age: "2 ngày chưa liên hệ",
      nextAction: "Gọi lần đầu hôm nay",
      tone: "warning",
      detailId: "record-thao-nguyen",
    },
    {
      id: "gia-han",
      name: "Lê Gia Hân",
      initials: "GH",
      owner: "Võ Thảo My",
      stage: "Làm hồ sơ",
      issue: "Thiếu 2 giấy tờ",
      age: "4 ngày chờ bổ sung",
      nextAction: "Nhắc bổ sung hồ sơ",
      tone: "violet",
      detailId: "record-gia-han",
    },
  ],
  stages: [
    {
      id: "lead",
      label: "Lead mới",
      volume: 500,
      nextStepConversion: 84,
      averageDays: 0.8,
      slaDays: 1,
      stalledCount: 18,
      note: "Nguồn đầu vào của đội",
      tone: "primary",
      detailId: "stage-lead",
    },
    {
      id: "contacted",
      label: "Đã liên hệ",
      volume: 420,
      nextStepConversion: 67,
      averageDays: 1.9,
      slaDays: 2,
      stalledCount: 9,
      note: "Đã ghi nhận phản hồi",
      tone: "primary",
      detailId: "stage-contacted",
    },
    {
      id: "qualified",
      label: "Đủ điều kiện",
      volume: 280,
      nextStepConversion: 57,
      averageDays: 4.8,
      slaDays: 3,
      stalledCount: 7,
      note: "Nút thắt lớn nhất trước Cơ hội",
      tone: "warning",
      detailId: "stage-qualified",
    },
    {
      id: "opportunity",
      label: "Cơ hội",
      volume: 160,
      nextStepConversion: 56,
      averageDays: 6.2,
      slaDays: 5,
      stalledCount: 5,
      note: "Nhiều hồ sơ có nguy cơ đứng lâu",
      tone: "danger",
      detailId: "stage-opportunity",
    },
    {
      id: "application",
      label: "Làm hồ sơ",
      volume: 90,
      nextStepConversion: 70,
      averageDays: 3.1,
      slaDays: 7,
      stalledCount: 0,
      note: "Đang trong mốc xử lý",
      tone: "success",
      detailId: "stage-application",
    },
    {
      id: "enrollment",
      label: "Nhập học",
      volume: 63,
      nextStepConversion: null,
      averageDays: 0,
      slaDays: 0,
      stalledCount: 0,
      note: "Kết quả cuối cùng",
      tone: "success",
      detailId: "stage-enrollment",
    },
  ],
  reps: [
    {
      id: "a", name: "Nguyễn Minh Anh", initials: "MA", target: 20, enrollment: 16, achievement: 80, remaining: 4, expected: 6, coverage: 1.5, winRate: 45, closedOpportunities: 20, wonOpportunities: 9, openOpportunities: 32, overdue: 2, avgStageAgeDays: 1, agingOverSlaCount: 1, detailId: "rep-a",
      pipeline: { newOpportunities: 8, followUpDue: 2, stageVolumes: { lead: 110, contacted: 92, qualified: 60, opportunity: 34, application: 20, enrollment: 16 }, stageStalledCounts: { lead: 3, contacted: 2, qualified: 1, opportunity: 1, application: 0, enrollment: 0 }, agingBuckets: { "0-2-days": 18, "3-5-days": 8, "6-10-days": 5, "over-10-days": 1 }, trend: REP_TRENDS.a },
    },
    {
      id: "b", name: "Trần Quốc Bảo", initials: "QB", target: 20, enrollment: 11, achievement: 55, remaining: 9, expected: 5, coverage: 0.56, winRate: 20, closedOpportunities: 20, wonOpportunities: 4, openOpportunities: 26, overdue: 9, avgStageAgeDays: 7, agingOverSlaCount: 3, detailId: "rep-b",
      pipeline: { newOpportunities: 5, followUpDue: 3, stageVolumes: { lead: 100, contacted: 84, qualified: 55, opportunity: 26, application: 14, enrollment: 11 }, stageStalledCounts: { lead: 5, contacted: 2, qualified: 2, opportunity: 1, application: 0, enrollment: 0 }, agingBuckets: { "0-2-days": 14, "3-5-days": 7, "6-10-days": 4, "over-10-days": 1 }, trend: REP_TRENDS.b },
    },
    {
      id: "c", name: "Lê Hoàng Châu", initials: "HC", target: 20, enrollment: 18, achievement: 90, remaining: 2, expected: 4, coverage: 2, winRate: 40, closedOpportunities: 20, wonOpportunities: 8, openOpportunities: 38, overdue: 1, avgStageAgeDays: 0, agingOverSlaCount: 2, detailId: "rep-c",
      pipeline: { newOpportunities: 9, followUpDue: 2, stageVolumes: { lead: 120, contacted: 102, qualified: 70, opportunity: 38, application: 22, enrollment: 18 }, stageStalledCounts: { lead: 2, contacted: 1, qualified: 1, opportunity: 0, application: 0, enrollment: 0 }, agingBuckets: { "0-2-days": 20, "3-5-days": 8, "6-10-days": 6, "over-10-days": 4 }, trend: REP_TRENDS.c },
    },
    {
      id: "d", name: "Phạm Gia Duy", initials: "GD", target: 20, enrollment: 10, achievement: 50, remaining: 10, expected: 7, coverage: 0.7, winRate: 30, closedOpportunities: 20, wonOpportunities: 6, openOpportunities: 40, overdue: 14, avgStageAgeDays: 4, agingOverSlaCount: 4, detailId: "rep-d",
      pipeline: { newOpportunities: 7, followUpDue: 3, stageVolumes: { lead: 95, contacted: 82, qualified: 50, opportunity: 40, application: 18, enrollment: 10 }, stageStalledCounts: { lead: 6, contacted: 3, qualified: 2, opportunity: 2, application: 0, enrollment: 0 }, agingBuckets: { "0-2-days": 16, "3-5-days": 10, "6-10-days": 8, "over-10-days": 6 }, trend: REP_TRENDS.d },
    },
    {
      id: "e", name: "Võ Thảo My", initials: "TM", target: 20, enrollment: 8, achievement: 40, remaining: 12, expected: 19, coverage: 1.58, winRate: 40, closedOpportunities: 20, wonOpportunities: 8, openOpportunities: 24, overdue: 5, avgStageAgeDays: 2, agingOverSlaCount: 2, detailId: "rep-e",
      pipeline: { newOpportunities: 6, followUpDue: 2, stageVolumes: { lead: 75, contacted: 60, qualified: 45, opportunity: 22, application: 16, enrollment: 8 }, stageStalledCounts: { lead: 2, contacted: 1, qualified: 1, opportunity: 1, application: 0, enrollment: 0 }, agingBuckets: { "0-2-days": 14, "3-5-days": 6, "6-10-days": 4, "over-10-days": 0 }, trend: REP_TRENDS.e },
    },
  ],
  trend: [
    // Cố ý tạo nhịp tăng không đều để nhìn ra tuần hụt, tuần bứt tốc và điểm giao với kế hoạch.
    { period: "Tuần 1", enrollment: 6, target: 8, newOpportunities: 24 },
    { period: "Tuần 2", enrollment: 13, target: 15, newOpportunities: 31 },
    { period: "Tuần 3", enrollment: 21, target: 24, newOpportunities: 28 },
    { period: "Tuần 4", enrollment: 34, target: 33, newOpportunities: 42 },
    { period: "Tuần 5", enrollment: 46, target: 46, newOpportunities: 36 },
    { period: "Tuần 6", enrollment: 53, target: 52, newOpportunities: 39 },
    { period: "Tuần 7", enrollment: 57, target: 58, newOpportunities: 34 },
    { period: "Tuần 8", enrollment: 63, target: 66, newOpportunities: 35 },
  ],
  agingBuckets: [
    {
      id: "0-2-days",
      label: "0–2 ngày",
      count: 82,
      note: "Đang trong mốc xử lý",
      tone: "success",
      detailId: "aging-0-2",
    },
    {
      id: "3-5-days",
      label: "3–5 ngày",
      count: 39,
      note: "Cần theo dõi sát",
      tone: "warning",
      detailId: "aging-3-5",
    },
    {
      id: "6-10-days",
      label: "6–10 ngày",
      count: 27,
      note: "Đã vượt mốc ở một số bước",
      tone: "danger",
      detailId: "aging-6-10",
    },
    {
      id: "over-10-days",
      label: "Trên 10 ngày",
      count: 12,
      note: "Cần can thiệp ngay",
      tone: "danger",
      detailId: "aging-over-10",
    },
  ],
  details: {
    "stage-lead": stageDetail({
      id: "stage-lead",
      title: "Lead mới",
      description: "500 Lead mới đang chờ được tiếp nhận; 18 hồ sơ đã đứng quá mốc một ngày và có nguy cơ chậm lần liên hệ đầu tiên.",
      volume: 500,
      nextStepConversion: 84,
      averageDays: 0.8,
      slaDays: 1,
      stalledCount: 18,
      tone: "primary",
      records: [
        detailRecord({ id: "stage-lead-1", name: "Đỗ Minh Quân", initials: "MQ", owner: "Chưa phân công", stage: "Lead mới", issue: "Chờ phân công", age: "31 giờ", lastActivity: "Lead tạo · hôm qua", nextAction: "Phân công ngay", tone: "danger" }),
        detailRecord({ id: "stage-lead-2", name: "Nguyễn Hà Linh", initials: "HL", owner: "Chưa phân công", stage: "Lead mới", issue: "Chờ phân công", age: "8 giờ", lastActivity: "Lead tạo · hôm nay", nextAction: "Phân công trong ngày", tone: "primary" }),
        detailRecord({ id: "stage-lead-3", name: "Trần Hoàng Nam", initials: "HN", owner: "Chưa phân công", stage: "Lead mới", issue: "Chờ phân công", age: "5 giờ", lastActivity: "Lead tạo · hôm nay", nextAction: "Phân công trong ngày", tone: "primary" }),
      ],
      recommendedAction: "Phân công trước 4 hồ sơ đã quá 24 giờ, sau đó chia đều 14 hồ sơ còn lại theo sức chứa của từng nhân viên tư vấn.",
    }),
    "stage-contacted": stageDetail({
      id: "stage-contacted",
      title: "Đã liên hệ",
      description: "420 hồ sơ đã được liên hệ; 67% chuyển sang Đủ điều kiện nhưng 9 hồ sơ đang thiếu lịch hẹn hoặc kết quả xử lý tiếp theo.",
      volume: 420,
      nextStepConversion: 67,
      averageDays: 1.9,
      slaDays: 2,
      stalledCount: 9,
      tone: "primary",
      records: [
        detailRecord({ id: "stage-contacted-1", name: "Phạm Ngọc Anh", initials: "NA", owner: "Nguyễn Minh Anh", stage: "Đã liên hệ", issue: "Chưa có lịch tiếp theo", age: "2 ngày", lastActivity: "Gọi ra · 15/09", nextAction: "Đặt lịch tư vấn", tone: "warning" }),
        detailRecord({ id: "stage-contacted-2", name: "Đỗ Khánh Vy", initials: "KV", owner: "Lê Hoàng Châu", stage: "Đã liên hệ", issue: "Chưa ghi nhận nhu cầu", age: "2 ngày", lastActivity: "Nhắn tin · 15/09", nextAction: "Cập nhật kết quả liên hệ", tone: "warning" }),
        detailRecord({ id: "stage-contacted-3", name: "Vũ Minh Đức", initials: "MĐ", owner: "Võ Thảo My", stage: "Đã liên hệ", issue: "Chờ phản hồi", age: "3 ngày", lastActivity: "Gọi ra · 14/09", nextAction: "Gọi lại lần hai", tone: "danger" }),
      ],
      recommendedAction: "Rà lại 9 hồ sơ chưa có bước tiếp theo; mỗi hồ sơ cần có một lịch gọi, lịch tư vấn hoặc lý do chờ rõ ràng.",
    }),
    "stage-qualified": stageDetail({
      id: "stage-qualified",
      title: "Đủ điều kiện",
      description: "280 hồ sơ đã đủ điều kiện nhưng chỉ 57% chuyển thành Cơ hội. Thời gian xử lý trung bình 4,8 ngày, vượt mốc 3 ngày.",
      volume: 280,
      nextStepConversion: 57,
      averageDays: 4.8,
      slaDays: 3,
      stalledCount: 7,
      tone: "warning",
      records: [
        detailRecord({ id: "stage-qualified-1", name: "Nguyễn Thảo", initials: "NT", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Chưa liên hệ đầu", age: "2 ngày", lastActivity: "Lead tạo · 14/09", nextAction: "Gọi lần đầu hôm nay", tone: "danger" }),
        detailRecord({ id: "stage-qualified-2", name: "Trần Ngọc Mai", initials: "NM", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Vượt mốc 1 ngày", age: "4 ngày", lastActivity: "Gọi ra · 15/09", nextAction: "Xác nhận lý do chưa chuyển bước", tone: "warning" }),
        detailRecord({ id: "stage-qualified-3", name: "Lê Minh Tâm", initials: "MT", owner: "Phạm Gia Duy", stage: "Đủ điều kiện", issue: "Thiếu lịch tư vấn", age: "5 ngày", lastActivity: "Nhắn tin · 14/09", nextAction: "Chốt lịch tư vấn", tone: "warning" }),
      ],
      recommendedAction: "Tập trung gỡ 7 hồ sơ đã vượt mốc trước, sau đó kiểm tra lý do 43% hồ sơ chưa chuyển thành Cơ hội để điều chỉnh kịch bản tư vấn.",
    }),
    enrollment: {
      id: "enrollment",
      kind: "sales-breakdown",
      eyebrow: "KẾT QUẢ ĐỘI",
      title: "Hồ sơ đã nhập học",
      description: "Các hồ sơ đã hoàn tất bước nhập học trong kỳ đang theo dõi.",
      tone: "success",
      metrics: [
        { label: "Chỉ tiêu", value: "100" },
        { label: "Đã đạt", value: "63%" },
        { label: "So với kỳ trước", value: "+8", note: "Nhập học" },
      ],
      breakdown: [
        { id: "enroll-ma", label: "Nguyễn Minh Anh", value: "16 hồ sơ", note: "80% chỉ tiêu · 32 cơ hội mở", detailId: "rep-a" },
        { id: "enroll-hc", label: "Lê Hoàng Châu", value: "18 hồ sơ", note: "90% chỉ tiêu · 38 cơ hội mở", detailId: "rep-c" },
        { id: "enroll-qb", label: "Trần Quốc Bảo", value: "11 hồ sơ", note: "55% chỉ tiêu · cần hỗ trợ", detailId: "rep-b" },
        { id: "enroll-gd", label: "Phạm Gia Duy", value: "10 hồ sơ", note: "50% chỉ tiêu · nhiều việc quá hạn", detailId: "rep-d" },
        { id: "enroll-tm", label: "Võ Thảo My", value: "8 hồ sơ", note: "40% chỉ tiêu · độ phủ 1,58x", detailId: "rep-e" },
      ],
      records: [],
      recommendedAction: "Tiếp tục giữ nhịp xử lý ở giai đoạn Cơ hội và Hồ sơ để không hụt chỉ tiêu cuối kỳ.",
    },
    forecast: {
      id: "forecast",
      kind: "stage-breakdown",
      eyebrow: "DỰ BÁO KẾT QUẢ",
      title: "Dự báo nhập học",
      description: "Dự báo được tính từ số lượng hồ sơ đang mở và xác suất của từng giai đoạn.",
      tone: "violet",
      metrics: [
        { label: "Còn thiếu", value: "37" },
        { label: "Dự kiến", value: "41" },
        { label: "Độ phủ", value: "1,11x", note: "Có dư địa" },
      ],
      breakdown: [
        { id: "forecast-opportunity", label: "Cơ hội", value: "18 dự kiến", note: "160 cơ hội đang mở · chuyển bước 56%", detailId: "stage-opportunity" },
        { id: "forecast-application", label: "Làm hồ sơ", value: "23 dự kiến", note: "90 hồ sơ đang mở · chuyển bước 70%", detailId: "stage-application" },
      ],
      records: [],
      recommendedAction: "Độ phủ đang đủ theo dự báo, nhưng nhân viên tư vấn B và D vẫn thiếu luồng cơ hội riêng; cần điều phối theo từng người.",
    },
    overdue: {
      id: "overdue",
      kind: "sales-breakdown",
      eyebrow: "HÀNG ĐỢI HÀNH ĐỘNG",
      title: "Công việc quá hạn",
      description: "Các việc chưa hoàn tất sau thời điểm cần liên hệ hoặc cập nhật hồ sơ.",
      tone: "danger",
      metrics: [
        { label: "Tổng quá hạn", value: "31" },
        { label: "Lâu nhất", value: "6 ngày" },
        { label: "Nhân viên tư vấn bị ảnh hưởng", value: "4" },
      ],
      breakdown: [
        { id: "overdue-gd", label: "Phạm Gia Duy", value: "14 việc", note: "Nhiều nhất · chủ yếu ở Cơ hội", detailId: "rep-d" },
        { id: "overdue-qb", label: "Trần Quốc Bảo", value: "9 việc", note: "Tập trung ở Đủ điều kiện", detailId: "rep-b" },
        { id: "overdue-tm", label: "Võ Thảo My", value: "5 việc", note: "Chủ yếu chờ bổ sung giấy tờ", detailId: "rep-e" },
        { id: "overdue-ma", label: "Nguyễn Minh Anh", value: "2 việc", note: "Trong ngưỡng kiểm soát", detailId: "rep-a" },
        { id: "overdue-hc", label: "Lê Hoàng Châu", value: "1 việc", note: "Trong ngưỡng kiểm soát", detailId: "rep-c" },
      ],
      records: [
        detailRecord({ id: "overdue-1", name: "Nguyễn Minh Khôi", initials: "MK", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Quá hạn 3 ngày", age: "8 ngày ở giai đoạn này", lastActivity: "Gọi ra · 13/09", nextAction: "Gọi lại trước 11:00", tone: "danger" }),
        detailRecord({ id: "overdue-2", name: "Phan Đức Long", initials: "ĐL", owner: "Phạm Gia Duy", stage: "Đủ điều kiện", issue: "Quá hạn 2 ngày", age: "5 ngày chưa chuyển bước", lastActivity: "Nhắn tin · 14/09", nextAction: "Xác nhận nhu cầu", tone: "danger" }),
        detailRecord({ id: "overdue-3", name: "Trần Ngọc Mai", initials: "NM", owner: "Trần Quốc Bảo", stage: "Làm hồ sơ", issue: "Quá hạn 1 ngày", age: "2 ngày chờ giấy tờ", lastActivity: "Gọi ra · 15/09", nextAction: "Nhắc bổ sung hồ sơ", tone: "warning" }),
      ],
      recommendedAction: "Xử lý theo thứ tự: quá hạn lâu nhất, hồ sơ gần Nhập học, sau đó đến các hồ sơ có nhu cầu cao.",
    },
    unassigned: {
      id: "unassigned",
      eyebrow: "PHÂN CÔNG LEAD",
      title: "Lead chưa phân công",
      description: "Lead đã vào hệ thống nhưng chưa có nhân viên tư vấn chịu trách nhiệm tiếp nhận.",
      tone: "violet",
      metrics: [
        { label: "Chưa phân công", value: "18" },
        { label: "Mới trong hôm nay", value: "7" },
        { label: "Quá 24 giờ", value: "4" },
      ],
      records: [
        detailRecord({ id: "unassigned-1", name: "Đỗ Minh Quân", initials: "MQ", owner: "Chưa phân công", stage: "Lead mới", issue: "Chờ phân công", age: "31 giờ", lastActivity: "Lead tạo · hôm qua", nextAction: "Phân công người phụ trách", tone: "violet" }),
        detailRecord({ id: "unassigned-2", name: "Nguyễn Hà Linh", initials: "HL", owner: "Chưa phân công", stage: "Lead mới", issue: "Chờ phân công", age: "8 giờ", lastActivity: "Lead tạo · hôm nay", nextAction: "Phân công trong ngày", tone: "violet" }),
        detailRecord({ id: "unassigned-3", name: "Trần Hoàng Nam", initials: "HN", owner: "Chưa phân công", stage: "Lead mới", issue: "Chờ phân công", age: "5 giờ", lastActivity: "Lead tạo · hôm nay", nextAction: "Phân công trong ngày", tone: "violet" }),
      ],
      recommendedAction: "Ưu tiên phân công 4 Lead đã quá 24 giờ trước khi chúng mất cơ hội liên hệ đầu tiên.",
    },
    "due-today": {
      id: "due-today",
      eyebrow: "VIỆC TRONG NGÀY",
      title: "Liên hệ hôm nay",
      description: "Danh sách được sắp theo thời gian hẹn và mức độ sẵn sàng chuyển bước.",
      tone: "primary",
      metrics: [
        { label: "Cần liên hệ", value: "12" },
        { label: "Nhu cầu cao", value: "5" },
        { label: "Gần Nhập học", value: "3" },
      ],
      records: [
        detailRecord({ id: "due-1", name: "Nguyễn Thảo", initials: "NT", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Hẹn gọi 10:30", age: "2 ngày trong giai đoạn", lastActivity: "Nhắn tin · 15/09", nextAction: "Gọi xác nhận nhu cầu", tone: "primary" }),
        detailRecord({ id: "due-2", name: "Lê Gia Hân", initials: "GH", owner: "Võ Thảo My", stage: "Làm hồ sơ", issue: "Hẹn nhắc giấy tờ 14:00", age: "4 ngày chờ bổ sung", lastActivity: "Gọi ra · 15/09", nextAction: "Nhắc bổ sung hồ sơ", tone: "primary" }),
        detailRecord({ id: "due-3", name: "Hoàng Đức Anh", initials: "ĐA", owner: "Nguyễn Minh Anh", stage: "Cơ hội", issue: "Hẹn tư vấn 15:30", age: "3 ngày ở giai đoạn này", lastActivity: "Tư vấn · 15/09", nextAction: "Chốt bước làm hồ sơ", tone: "primary" }),
      ],
      recommendedAction: "Nên hoàn tất 3 hồ sơ gần Nhập học trước; đây là nhóm có khả năng tạo kết quả nhanh nhất.",
    },
    aging: {
      id: "aging",
      kind: "sales-breakdown",
      eyebrow: "SỨC KHỎE LUỒNG CƠ HỘI",
      title: "Hồ sơ vượt SLA",
      description: "Tuổi hồ sơ được tính từ lần chuyển vào giai đoạn hiện tại đến lúc xem dashboard.",
      tone: "warning",
      metrics: [
        { label: "Vượt mốc", value: "12" },
        { label: "Giai đoạn chính", value: "Cơ hội" },
        { label: "Tuổi cao nhất", value: "11 ngày" },
      ],
      breakdown: [
        { id: "aging-qualified", label: "Đủ điều kiện", value: "7 hồ sơ", note: "TB 4,8 ngày / SLA 3 ngày", detailId: "stage-qualified" },
        { id: "aging-opportunity", label: "Cơ hội", value: "5 hồ sơ", note: "TB 6,2 ngày / SLA 5 ngày", detailId: "stage-opportunity" },
      ],
      records: [
        detailRecord({ id: "aging-1", name: "Nguyễn Minh Khôi", initials: "MK", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Vượt mốc 3 ngày", age: "8 ngày ở giai đoạn này", lastActivity: "Gọi ra · 13/09", nextAction: "Gọi lại và chốt bước tiếp", tone: "danger" }),
        detailRecord({ id: "aging-2", name: "Phan Đức Long", initials: "ĐL", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Vượt mốc 2 ngày", age: "7 ngày ở giai đoạn này", lastActivity: "Nhắn tin · 14/09", nextAction: "Đặt lịch tư vấn lại", tone: "warning" }),
        detailRecord({ id: "aging-3", name: "Trần Ngọc Mai", initials: "NM", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Vượt mốc 1 ngày", age: "4 ngày ở giai đoạn này", lastActivity: "Gọi ra · 15/09", nextAction: "Xác nhận lý do chưa chuyển bước", tone: "warning" }),
      ],
      recommendedAction: "Tập trung các hồ sơ vừa có tuổi cao vừa có việc quá hạn; đây là nhóm dễ mất cơ hội nếu tiếp tục chờ.",
    },
    "aging-0-2": agingDetail({
      id: "aging-0-2",
      title: "0–2 ngày",
      description: "Đây là nhóm hồ sơ mới hoặc vừa có hoạt động gần đây. Chưa cần can thiệp đặc biệt nhưng phải giữ đúng lịch tiếp theo.",
      label: "0–2 ngày",
      count: 82,
      tone: "success",
      records: [
        detailRecord({ id: "aging-0-2-1", name: "Hoàng Đức Anh", initials: "ĐA", owner: "Nguyễn Minh Anh", stage: "Cơ hội", issue: "Đúng mốc xử lý", age: "2 ngày", lastActivity: "Tư vấn · 15/09", nextAction: "Chốt lịch làm hồ sơ", tone: "success" }),
        detailRecord({ id: "aging-0-2-2", name: "Lê Gia Hân", initials: "GH", owner: "Võ Thảo My", stage: "Làm hồ sơ", issue: "Đúng mốc xử lý", age: "2 ngày", lastActivity: "Gọi ra · 15/09", nextAction: "Theo dõi giấy tờ còn thiếu", tone: "success" }),
      ],
      recommendedAction: "Duy trì lịch nhắc và cập nhật hoạt động kế tiếp để nhóm hồ sơ này không chuyển sang nhóm quá hạn.",
    }),
    "aging-3-5": agingDetail({
      id: "aging-3-5",
      title: "3–5 ngày",
      description: "Nhóm hồ sơ đã ở một giai đoạn đủ lâu để cần kiểm tra lại lịch xử lý, nhưng chưa phải nhóm rủi ro cao nhất.",
      label: "3–5 ngày",
      count: 39,
      tone: "warning",
      records: [
        detailRecord({ id: "aging-3-5-1", name: "Nguyễn Thảo", initials: "NT", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Sắp vượt mốc", age: "4 ngày", lastActivity: "Nhắn tin · 15/09", nextAction: "Gọi xác nhận nhu cầu", tone: "warning" }),
        detailRecord({ id: "aging-3-5-2", name: "Lê Minh Tâm", initials: "MT", owner: "Phạm Gia Duy", stage: "Đủ điều kiện", issue: "Sắp vượt mốc", age: "5 ngày", lastActivity: "Gọi ra · 14/09", nextAction: "Chốt lịch tư vấn", tone: "warning" }),
      ],
      recommendedAction: "Lập danh sách gọi lại trong ngày cho nhóm này; nếu chưa có phản hồi, chuyển sang danh sách can thiệp của trưởng nhóm tuyển sinh.",
    }),
    "aging-6-10": agingDetail({
      id: "aging-6-10",
      title: "6–10 ngày",
      description: "Các hồ sơ đã vượt mốc xử lý thông thường và cần một hành động cụ thể thay vì tiếp tục chờ.",
      label: "6–10 ngày",
      count: 27,
      tone: "danger",
      records: [
        detailRecord({ id: "aging-6-10-1", name: "Nguyễn Minh Khôi", initials: "MK", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Quá hạn 3 ngày", age: "8 ngày", lastActivity: "Gọi ra · 13/09", nextAction: "Gọi lại trước 11:00", tone: "danger" }),
        detailRecord({ id: "aging-6-10-2", name: "Phan Đức Long", initials: "ĐL", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Quá hạn 2 ngày", age: "7 ngày", lastActivity: "Nhắn tin · 14/09", nextAction: "Đặt lịch tư vấn lại", tone: "danger" }),
      ],
      recommendedAction: "Trưởng nhóm tuyển sinh cần rà từng hồ sơ: tiếp tục theo đuổi, chuyển người phụ trách hoặc đóng lý do mất cơ hội; không để tồn không có quyết định.",
    }),
    "aging-over-10": agingDetail({
      id: "aging-over-10",
      title: "Trên 10 ngày",
      description: "Đây là nhóm rủi ro cao nhất trong luồng cơ hội. Nếu không có hành động trong ngày, khả năng mất hồ sơ sẽ tăng mạnh.",
      label: "Trên 10 ngày",
      count: 12,
      tone: "danger",
      records: [
        detailRecord({ id: "aging-over-10-1", name: "Đặng Nhật Minh", initials: "NM", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Không có hoạt động mới", age: "12 ngày", lastActivity: "Gọi ra · 04/09", nextAction: "Trưởng nhóm tuyển sinh cùng nghe lại và quyết định hướng xử lý", tone: "danger" }),
        detailRecord({ id: "aging-over-10-2", name: "Trương Khánh An", initials: "KA", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Chưa chuyển bước", age: "11 ngày", lastActivity: "Nhắn tin · 05/09", nextAction: "Gọi xác nhận còn nhu cầu", tone: "danger" }),
      ],
      recommendedAction: "Đưa 12 hồ sơ vào buổi rà soát đặc biệt: chốt người xử lý, thời hạn xử lý và kết quả bắt buộc cho từng hồ sơ.",
    }),
    "stage-opportunity": {
      id: "stage-opportunity",
      eyebrow: "PHÂN TÍCH GIAI ĐOẠN",
      title: "Cơ hội",
      description: "160 hồ sơ đang ở Cơ hội; tỷ lệ sang Làm hồ sơ là 56% và thời gian trung bình là 6,2 ngày.",
      tone: "danger",
      metrics: [
        { label: "Đang ở giai đoạn", value: "160" },
        { label: "Tỷ lệ chuyển đổi", value: "56%" },
        { label: "Thời gian trung bình", value: "6,2 ngày" },
      ],
      records: [
        detailRecord({ id: "opportunity-1", name: "Nguyễn Minh Khôi", initials: "MK", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Quá hạn 3 ngày", age: "8 ngày ở giai đoạn này", lastActivity: "Gọi ra · 13/09", nextAction: "Gọi lại trước 11:00", tone: "danger" }),
        detailRecord({ id: "opportunity-2", name: "Hoàng Đức Anh", initials: "ĐA", owner: "Nguyễn Minh Anh", stage: "Cơ hội", issue: "Chưa có lịch tiếp theo", age: "3 ngày ở giai đoạn này", lastActivity: "Tư vấn · 15/09", nextAction: "Chốt lịch làm hồ sơ", tone: "warning" }),
      ],
      recommendedAction: "Đừng chỉ tăng số Lead mới; cần gỡ các hồ sơ đã đủ điều kiện nhưng chưa có bước tiếp theo rõ ràng.",
    },
    "stage-application": stageDetail({
      id: "stage-application",
      title: "Làm hồ sơ",
      description: "70% hồ sơ chuyển sang bước tiếp theo; phần lớn vẫn trong mốc 7 ngày nhưng cần theo dõi giấy tờ còn thiếu.",
      volume: 90,
      nextStepConversion: 70,
      averageDays: 3.1,
      slaDays: 7,
      stalledCount: 0,
      tone: "success",
      records: [
        detailRecord({ id: "stage-application-1", name: "Lê Gia Hân", initials: "GH", owner: "Võ Thảo My", stage: "Làm hồ sơ", issue: "Thiếu 2 giấy tờ", age: "4 ngày", lastActivity: "Gọi ra · 15/09", nextAction: "Nhắc bổ sung hồ sơ", tone: "violet" }),
        detailRecord({ id: "stage-application-2", name: "Nguyễn Quốc Huy", initials: "QH", owner: "Lê Hoàng Châu", stage: "Làm hồ sơ", issue: "Đã đủ giấy tờ", age: "2 ngày", lastActivity: "Cập nhật · 15/09", nextAction: "Kiểm tra trước khi xác nhận", tone: "success" }),
      ],
      recommendedAction: "Giữ lịch kiểm tra giấy tờ trong 24 giờ và ưu tiên các hồ sơ đã đủ điều kiện xác nhận để chuyển thành kết quả.",
    }),
    "stage-enrollment": stageDetail({
      id: "stage-enrollment",
      title: "Nhập học",
      description: "Đây là kết quả cuối của luồng tuyển sinh trong kỳ. Cần đối soát thông tin để số liệu giữa nhân viên tư vấn và hồ sơ nhập học luôn khớp.",
      volume: 63,
      nextStepConversion: null,
      averageDays: 0,
      slaDays: 0,
      stalledCount: 0,
      tone: "success",
      records: [
        detailRecord({ id: "stage-enrollment-1", name: "Nguyễn Minh Anh", initials: "MA", owner: "Nguyễn Minh Anh", stage: "Nhập học", issue: "Đã hoàn tất", age: "16 hồ sơ", lastActivity: "Cập nhật hôm qua", nextAction: "Đối soát sau nhập học", tone: "success" }),
        detailRecord({ id: "stage-enrollment-2", name: "Lê Hoàng Châu", initials: "HC", owner: "Lê Hoàng Châu", stage: "Nhập học", issue: "Đã hoàn tất", age: "18 hồ sơ", lastActivity: "Cập nhật hôm qua", nextAction: "Đối soát sau nhập học", tone: "success" }),
      ],
      recommendedAction: "Duy trì đối soát hồ sơ đã nhập học và quay lại nhóm Làm hồ sơ để bảo đảm không hụt 37 chỉ tiêu còn lại.",
    }),
    "rep-a": repDetail({
      id: "rep-a",
      title: "Nguyễn Minh Anh",
      description: "Nhân viên tư vấn A đang vượt mức độ phủ cần thiết và đạt 80% chỉ tiêu; nên giữ nhịp xử lý thay vì nhận thêm quá nhiều Lead.",
      tone: "success",
      metrics: [
        { label: "Mức đạt", value: "80%" },
        { label: "Độ phủ", value: "1,50x" },
        { label: "Cơ hội mở", value: "32" },
        { label: "Quá hạn / SLA", value: "2 / 1" },
      ],
      records: [
        detailRecord({ id: "rep-a-1", name: "Phạm Ngọc Anh", initials: "NA", owner: "Nguyễn Minh Anh", stage: "Đã liên hệ", issue: "Đúng nhịp", age: "2 ngày", lastActivity: "Gọi ra · 15/09", nextAction: "Đặt lịch tư vấn", tone: "success" }),
        detailRecord({ id: "rep-a-2", name: "Hoàng Đức Anh", initials: "ĐA", owner: "Nguyễn Minh Anh", stage: "Cơ hội", issue: "Cần chốt bước tiếp", age: "3 ngày", lastActivity: "Tư vấn · 15/09", nextAction: "Chốt lịch làm hồ sơ", tone: "warning" }),
      ],
      recommendedAction: "Giữ lịch chăm sóc nhóm Cơ hội và có thể hỗ trợ trưởng nhóm tuyển sinh xử lý 1–2 hồ sơ quá hạn của đội.",
    }),
    "rep-b": repDetail({
      id: "rep-b",
      title: "Trần Quốc Bảo",
      description: "Độ phủ luồng cơ hội thấp, tỷ lệ chốt thấp và còn nhiều việc chưa hoàn tất.",
      tone: "danger",
      metrics: [
        { label: "Mức đạt", value: "55%" },
        { label: "Độ phủ", value: "0,56x" },
        { label: "Cơ hội mở", value: "26" },
        { label: "Quá hạn / SLA", value: "9 / 3" },
      ],
      records: [
        detailRecord({ id: "rep-b-1", name: "Nguyễn Thảo", initials: "NT", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Chưa có lần liên hệ đầu", age: "2 ngày", lastActivity: "Lead tạo · 14/09", nextAction: "Gọi lần đầu hôm nay", tone: "danger" }),
        detailRecord({ id: "rep-b-2", name: "Trần Ngọc Mai", initials: "NM", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Vượt mốc 1 ngày", age: "4 ngày", lastActivity: "Gọi ra · 15/09", nextAction: "Xác nhận lý do chưa chuyển bước", tone: "warning" }),
      ],
      recommendedAction: "Trưởng nhóm tuyển sinh nên cùng nhân viên tư vấn B rà lại 9 việc quá hạn, sau đó điều phối thêm cơ hội nếu năng lực xử lý còn dư.",
    }),
    "rep-c": repDetail({
      id: "rep-c",
      title: "Lê Hoàng Châu",
      description: "Nhân viên tư vấn C đang đạt 90% chỉ tiêu với tỷ lệ nhập học tốt; cần theo dõi SLA để không để thời gian xử lý tăng lên.",
      tone: "success",
      metrics: [
        { label: "Mức đạt", value: "90%" },
        { label: "Độ phủ", value: "2,00x" },
        { label: "Cơ hội mở", value: "38" },
        { label: "Quá hạn / SLA", value: "1 / 2" },
      ],
      records: [
        detailRecord({ id: "rep-c-1", name: "Nguyễn Quốc Huy", initials: "QH", owner: "Lê Hoàng Châu", stage: "Làm hồ sơ", issue: "Đã đủ giấy tờ", age: "2 ngày", lastActivity: "Cập nhật · 15/09", nextAction: "Kiểm tra trước khi xác nhận", tone: "success" }),
        detailRecord({ id: "rep-c-2", name: "Đỗ Khánh Vy", initials: "KV", owner: "Lê Hoàng Châu", stage: "Đã liên hệ", issue: "Chưa ghi nhận nhu cầu", age: "2 ngày", lastActivity: "Nhắn tin · 15/09", nextAction: "Cập nhật kết quả liên hệ", tone: "warning" }),
      ],
      recommendedAction: "Giữ chất lượng chuyển đổi hiện tại và xử lý sớm 2 hồ sơ đã vượt SLA trước khi nhận thêm Lead mới.",
    }),
    "rep-d": {
      id: "rep-d",
      kind: "records",
      eyebrow: "CHI TIẾT NHÂN VIÊN TƯ VẤN",
      title: "Phạm Gia Duy",
      description: "Nhân viên tư vấn này có số việc quá hạn cao nhất trong đội và độ phủ chưa đủ cho phần chỉ tiêu còn lại.",
      tone: "warning",
      metrics: [
        { label: "Mức đạt", value: "50%" },
        { label: "Độ phủ", value: "0,70x" },
        { label: "Quá hạn", value: "14 việc" },
      ],
      records: [
        detailRecord({ id: "rep-d-1", name: "Nguyễn Minh Khôi", initials: "MK", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Quá hạn 3 ngày", age: "8 ngày", lastActivity: "Gọi ra · 13/09", nextAction: "Gọi lại trước 11:00", tone: "danger" }),
        detailRecord({ id: "rep-d-2", name: "Phan Đức Long", initials: "ĐL", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Quá hạn 2 ngày", age: "7 ngày", lastActivity: "Nhắn tin · 14/09", nextAction: "Đặt lịch tư vấn lại", tone: "warning" }),
      ],
      recommendedAction: "Cân nhắc chia bớt 2–3 hồ sơ Cơ hội đang mở và cùng nhân viên tư vấn D dọn hàng đợi quá hạn trước khi nhận thêm Lead.",
    },
    "rep-e": repDetail({
      id: "rep-e",
      title: "Võ Thảo My",
      description: "Nhân viên tư vấn E có độ phủ tốt nhưng còn hồ sơ chờ giấy tờ; cần chuyển cơ hội thành kết quả thay vì tiếp tục nhận thêm.",
      tone: "warning",
      metrics: [
        { label: "Mức đạt", value: "40%" },
        { label: "Độ phủ", value: "1,58x" },
        { label: "Cơ hội mở", value: "24" },
        { label: "Quá hạn / SLA", value: "5 / 2" },
      ],
      records: [
        detailRecord({ id: "rep-e-1", name: "Lê Gia Hân", initials: "GH", owner: "Võ Thảo My", stage: "Làm hồ sơ", issue: "Thiếu 2 giấy tờ", age: "4 ngày", lastActivity: "Gọi ra · 15/09", nextAction: "Nhắc bổ sung hồ sơ", tone: "violet" }),
        detailRecord({ id: "rep-e-2", name: "Vũ Minh Đức", initials: "MĐ", owner: "Võ Thảo My", stage: "Đã liên hệ", issue: "Chờ phản hồi", age: "3 ngày", lastActivity: "Gọi ra · 14/09", nextAction: "Gọi lại lần hai", tone: "danger" }),
      ],
      recommendedAction: "Ưu tiên hoàn tất nhóm đang làm hồ sơ và đặt thời hạn rõ cho 5 việc quá hạn trước khi điều phối thêm Lead.",
    }),
    "record-minh-khoi": {
      id: "record-minh-khoi",
      eyebrow: "HỒ SƠ CẦN XỬ LÝ",
      title: "Nguyễn Minh Khôi",
      description: "Một hồ sơ Cơ hội đang có nguy cơ mất nhịp vì đã quá hạn liên hệ.",
      tone: "danger",
      metrics: [
        { label: "Nhân viên tư vấn", value: "Phạm Gia Duy" },
        { label: "Giai đoạn", value: "Cơ hội" },
        { label: "Đã đứng", value: "8 ngày" },
      ],
      records: [detailRecord({ id: "record-minh-khoi", name: "Nguyễn Minh Khôi", initials: "MK", owner: "Phạm Gia Duy", stage: "Cơ hội", issue: "Quá hạn 3 ngày", age: "8 ngày ở giai đoạn này", lastActivity: "Gọi ra · 13/09", nextAction: "Gọi lại trước 11:00", tone: "danger" })],
      recommendedAction: "Gọi lại, xác nhận lý do chưa chuyển bước và chốt một mốc làm hồ sơ cụ thể.",
    },
    "record-thao-nguyen": {
      id: "record-thao-nguyen",
      eyebrow: "HỒ SƠ CẦN XỬ LÝ",
      title: "Nguyễn Thảo",
      description: "Lead đã đủ điều kiện nhưng chưa ghi nhận lần liên hệ đầu tiên.",
      tone: "warning",
      metrics: [
        { label: "Nhân viên tư vấn", value: "Trần Quốc Bảo" },
        { label: "Giai đoạn", value: "Đủ điều kiện" },
        { label: "Chưa liên hệ", value: "2 ngày" },
      ],
      records: [detailRecord({ id: "record-thao-nguyen", name: "Nguyễn Thảo", initials: "NT", owner: "Trần Quốc Bảo", stage: "Đủ điều kiện", issue: "Chưa có lần liên hệ đầu", age: "2 ngày chưa liên hệ", lastActivity: "Lead tạo · 14/09", nextAction: "Gọi lần đầu hôm nay", tone: "warning" })],
      recommendedAction: "Gọi lần đầu trong hôm nay và ghi rõ kết quả liên hệ để tránh Lead tiếp tục rơi vào hàng đợi.",
    },
    "record-gia-han": {
      id: "record-gia-han",
      eyebrow: "HỒ SƠ CẦN XỬ LÝ",
      title: "Lê Gia Hân",
      description: "Hồ sơ đã đi đến bước làm giấy tờ nhưng còn thiếu tài liệu để hoàn tất.",
      tone: "violet",
      metrics: [
        { label: "Nhân viên tư vấn", value: "Võ Thảo My" },
        { label: "Giai đoạn", value: "Làm hồ sơ" },
        { label: "Đang chờ", value: "4 ngày" },
      ],
      records: [detailRecord({ id: "record-gia-han", name: "Lê Gia Hân", initials: "GH", owner: "Võ Thảo My", stage: "Làm hồ sơ", issue: "Thiếu 2 giấy tờ", age: "4 ngày chờ bổ sung", lastActivity: "Gọi ra · 15/09", nextAction: "Nhắc bổ sung hồ sơ", tone: "violet" })],
      recommendedAction: "Gửi lại danh sách giấy tờ còn thiếu và đặt lịch kiểm tra lại hồ sơ trong 24 giờ.",
    },
  },
};

const SCOPE_FACTORS: Record<string, number> = {
  "admission-2026-2027": 0.84,
  technology: 0.42,
  business: 0.28,
  marketing: 0.18,
  facebook: 0.46,
  website: 0.31,
  referral: 0.23,
  "ho-chi-minh": 0.45,
  "ha-noi": 0.35,
  other: 0.2,
};

const scopeOptionLabel = (group: keyof typeof LEAD_SALE_FILTER_OPTIONS, id: string) =>
  LEAD_SALE_FILTER_OPTIONS[group].find((option) => option.id === id)?.label ?? id;

const scaleCount = (value: number, factor: number) => Math.max(0, Math.round(value * factor));

const getScopeFactor = (filters: LeadSaleDashboardFilters) =>
  [filters.period, filters.program, filters.source, filters.region].reduce(
    (factor, id) => factor * (SCOPE_FACTORS[id] ?? 1),
    1,
  );

const scalePipeline = (
  pipeline: LeadSaleRepPipelineProfile,
  factor: number,
): LeadSaleRepPipelineProfile => ({
  newOpportunities: scaleCount(pipeline.newOpportunities, factor),
  followUpDue: scaleCount(pipeline.followUpDue, factor),
  stageVolumes: Object.fromEntries(
    Object.entries(pipeline.stageVolumes).map(([id, value]) => [id, scaleCount(value, factor)]),
  ),
  stageStalledCounts: Object.fromEntries(
    Object.entries(pipeline.stageStalledCounts).map(([id, value]) => [id, scaleCount(value, factor)]),
  ),
  agingBuckets: Object.fromEntries(
    Object.entries(pipeline.agingBuckets).map(([id, value]) => [id, scaleCount(value, factor)]),
  ),
  trend: pipeline.trend.map((point) => ({
    ...point,
    enrollment: scaleCount(point.enrollment, factor),
    target: scaleCount(point.target, factor),
    newOpportunities: scaleCount(point.newOpportunities, factor),
  })),
});

const sumValues = (values: Record<string, number>) =>
  Object.values(values).reduce((sum, value) => sum + value, 0);

const aggregatePipeline = (reps: LeadSaleRepPerformance[]) => {
  const trend = reps[0]?.pipeline.trend.map((point) => ({
    ...point,
    enrollment: 0,
    target: 0,
    newOpportunities: 0,
  })) ?? [];

  return reps.reduce<LeadSaleRepPipelineProfile>((aggregate, rep) => {
    aggregate.newOpportunities += rep.pipeline.newOpportunities;
    aggregate.followUpDue += rep.pipeline.followUpDue;
    for (const [id, value] of Object.entries(rep.pipeline.stageVolumes)) {
      aggregate.stageVolumes[id] = (aggregate.stageVolumes[id] ?? 0) + value;
    }
    for (const [id, value] of Object.entries(rep.pipeline.stageStalledCounts)) {
      aggregate.stageStalledCounts[id] = (aggregate.stageStalledCounts[id] ?? 0) + value;
    }
    for (const [id, value] of Object.entries(rep.pipeline.agingBuckets)) {
      aggregate.agingBuckets[id] = (aggregate.agingBuckets[id] ?? 0) + value;
    }
    rep.pipeline.trend.forEach((point, index) => {
      if (!aggregate.trend[index]) return;
      aggregate.trend[index].enrollment += point.enrollment;
      aggregate.trend[index].target += point.target;
      aggregate.trend[index].newOpportunities += point.newOpportunities;
    });
    return aggregate;
  }, {
    newOpportunities: 0,
    followUpDue: 0,
    stageVolumes: {},
    stageStalledCounts: {},
    agingBuckets: {},
    trend,
  });
};

const getScopedStages = (
  pipeline: LeadSaleRepPipelineProfile,
): LeadSaleStageAnalysis[] => MOCK_LEAD_SALE_DASHBOARD.stages.map((stage, index) => {
  const volume = pipeline.stageVolumes[stage.id] ?? 0;
  const nextStage = MOCK_LEAD_SALE_DASHBOARD.stages[index + 1];
  const nextVolume = nextStage ? pipeline.stageVolumes[nextStage.id] ?? 0 : 0;

  return {
    ...stage,
    volume,
    nextStepConversion: nextStage && volume > 0 ? Math.round((nextVolume / volume) * 100) : null,
    stalledCount: pipeline.stageStalledCounts[stage.id] ?? 0,
  };
});

const filterScopedRecords = (
  detail: LeadSaleDetail,
  selectedRep: LeadSaleRepPerformance | null,
) => selectedRep
  ? detail.records.filter((record) => record.owner === selectedRep.name)
  : detail.records;

const buildScopedDetails = ({
  reps,
  stages,
  agingBuckets,
  summary,
  selectedRep,
}: {
  reps: LeadSaleRepPerformance[];
  stages: LeadSaleStageAnalysis[];
  agingBuckets: LeadSaleAgingBucket[];
  summary: LeadSaleMockSummary;
  selectedRep: LeadSaleRepPerformance | null;
}): Record<LeadSaleDetailId, LeadSaleDetail> => {
  const details = Object.fromEntries(
    (Object.entries(MOCK_LEAD_SALE_DASHBOARD.details) as [LeadSaleDetailId, LeadSaleDetail][]).map(([id, detail]) => [
      id,
      { ...detail, records: filterScopedRecords(detail, selectedRep) },
    ]),
  ) as Record<LeadSaleDetailId, LeadSaleDetail>;
  const setDetail = (id: LeadSaleDetailId, patch: Partial<LeadSaleDetail>) => {
    details[id] = { ...details[id], ...patch };
  };

  setDetail("enrollment", {
    title: "Hồ sơ đã nhập học",
    metrics: [
      { label: "Chỉ tiêu", value: String(summary.target) },
      { label: "Đã đạt", value: `${summary.achievement}%` },
      { label: "So với kỳ trước", value: "+8", note: "Nhập học" },
    ],
    breakdown: reps.map((rep) => ({
      id: `enrollment-${rep.id}`,
      label: rep.name,
      value: `${rep.enrollment} hồ sơ`,
      note: `${rep.achievement}% chỉ tiêu · ${rep.openOpportunities} cơ hội mở`,
      detailId: rep.detailId,
    })),
  });

  const opportunityStage = stages.find((stage) => stage.id === "opportunity");
  const applicationStage = stages.find((stage) => stage.id === "application");
  const opportunityExpected = Math.round(summary.expected * 18 / 41);
  setDetail("forecast", {
    title: "Dự báo nhập học",
    metrics: [
      { label: "Còn thiếu", value: String(summary.remaining) },
      { label: "Dự kiến", value: String(summary.expected) },
      { label: "Độ phủ", value: `${summary.coverage.toFixed(2).replace(".", ",")}x`, note: "Có dư địa" },
    ],
    breakdown: [
      { id: "forecast-opportunity", label: "Cơ hội", value: `${opportunityExpected} dự kiến`, note: `${opportunityStage?.volume ?? 0} cơ hội đang mở · chuyển bước ${opportunityStage?.nextStepConversion ?? 0}%`, detailId: "stage-opportunity" },
      { id: "forecast-application", label: "Làm hồ sơ", value: `${summary.expected - opportunityExpected} dự kiến`, note: `${applicationStage?.volume ?? 0} hồ sơ đang mở · chuyển bước ${applicationStage?.nextStepConversion ?? 0}%`, detailId: "stage-application" },
    ],
  });

  setDetail("overdue", {
    title: "Công việc quá hạn",
    metrics: [
      { label: "Tổng quá hạn", value: String(summary.overdue) },
      { label: "Lâu nhất", value: "6 ngày" },
      { label: "Nhân viên tư vấn bị ảnh hưởng", value: String(reps.filter((rep) => rep.overdue > 0).length) },
    ],
    breakdown: reps
      .filter((rep) => rep.overdue > 0)
      .sort((left, right) => right.overdue - left.overdue)
      .map((rep) => ({
        id: `overdue-${rep.id}`,
        label: rep.name,
        value: `${rep.overdue} việc`,
        note: `${rep.agingOverSlaCount} hồ sơ vượt SLA`,
        detailId: rep.detailId,
      })),
  });

  const qualifiedStage = stages.find((stage) => stage.id === "qualified");
  setDetail("aging", {
    title: "Hồ sơ vượt SLA",
    metrics: [
      { label: "Vượt mốc", value: String(summary.agingOverSla) },
      { label: "Giai đoạn chính", value: (qualifiedStage?.stalledCount ?? 0) >= (opportunityStage?.stalledCount ?? 0) ? "Đủ điều kiện" : "Cơ hội" },
      { label: "Tuổi cao nhất", value: "11 ngày" },
    ],
    breakdown: [
      { id: "aging-qualified", label: "Đủ điều kiện", value: `${qualifiedStage?.stalledCount ?? 0} hồ sơ`, note: "TB 4,8 ngày / SLA 3 ngày", detailId: "stage-qualified" },
      { id: "aging-opportunity", label: "Cơ hội", value: `${opportunityStage?.stalledCount ?? 0} hồ sơ`, note: "TB 6,2 ngày / SLA 5 ngày", detailId: "stage-opportunity" },
    ],
  });

  for (const stage of stages) {
    const detail = details[stage.detailId];
    if (!detail) continue;
    setDetail(stage.detailId, {
      title: stage.label,
      description: stage.nextStepConversion === null
        ? `${stage.volume} hồ sơ đã hoàn tất Nhập học trong scope hiện tại.`
        : `${stage.volume} hồ sơ đang ở ${stage.label}; ${stage.nextStepConversion}% chuyển sang bước tiếp theo và ${stage.stalledCount} hồ sơ đang tồn.`,
      metrics: [
        { label: "Hồ sơ", value: String(stage.volume) },
        { label: "Tỷ lệ chuyển đổi", value: stage.nextStepConversion === null ? "—" : `${stage.nextStepConversion}%` },
        { label: "Hồ sơ vượt SLA", value: stage.stalledCount ? `${stage.stalledCount} hồ sơ` : "Không có" },
        { label: "Thời gian TB / SLA", value: stage.slaDays ? `${stage.averageDays.toFixed(1).replace(".", ",")} / ${stage.slaDays} ngày` : "Giai đoạn cuối" },
      ],
    });
  }

  for (const bucket of agingBuckets) {
    const detail = details[bucket.detailId];
    if (!detail) continue;
    setDetail(bucket.detailId, {
      title: bucket.label,
      metrics: [
        { label: "Số hồ sơ", value: String(bucket.count) },
        { label: "Khoảng thời gian", value: bucket.label },
        { label: "Cần theo dõi", value: bucket.id === "0-2-days" ? "Theo lịch" : "Có" },
      ],
    });
  }

  for (const rep of reps) {
    const detail = details[rep.detailId];
    if (!detail) continue;
    setDetail(rep.detailId, {
      metrics: [
        { label: "Mức đạt", value: `${rep.achievement}%` },
        { label: "Độ phủ", value: `${rep.coverage.toFixed(2).replace(".", ",")}x` },
        { label: "Cơ hội mở", value: String(rep.openOpportunities) },
        { label: "Quá hạn / SLA", value: `${rep.overdue} / ${rep.agingOverSlaCount}` },
      ],
    });
  }

  return details;
};

export function getLeadSaleDashboardData(
  filters: LeadSaleDashboardFilters = DEFAULT_LEAD_SALE_FILTERS,
): LeadSaleMockDashboardData {
  const factor = getScopeFactor(filters);
  const selectedRep = filters.sales === "all-sales"
    ? null
    : MOCK_LEAD_SALE_DASHBOARD.reps.find((rep) => rep.id === filters.sales) ?? null;
  const sourceReps = selectedRep ? [selectedRep] : MOCK_LEAD_SALE_DASHBOARD.reps;
  const reps = sourceReps.map((rep) => {
    const target = scaleCount(rep.target, factor);
    const enrollment = scaleCount(rep.enrollment, factor);
    const remaining = Math.max(target - enrollment, 0);
    const expected = scaleCount(rep.expected, factor);
    const closedOpportunities = scaleCount(rep.closedOpportunities, factor);
    const wonOpportunities = scaleCount(rep.wonOpportunities, factor);
    const pipeline = scalePipeline(rep.pipeline, factor);

    return {
      ...rep,
      target,
      enrollment,
      achievement: target ? Math.round((enrollment / target) * 100) : 0,
      remaining,
      expected,
      coverage: remaining ? Number((expected / remaining).toFixed(2)) : 0,
      closedOpportunities,
      wonOpportunities,
      winRate: closedOpportunities ? Math.round((wonOpportunities / closedOpportunities) * 100) : 0,
      openOpportunities: sumValues(pipeline.agingBuckets),
      overdue: scaleCount(rep.overdue, factor),
      agingOverSlaCount: scaleCount(rep.agingOverSlaCount, factor),
      pipeline,
    };
  });
  const target = reps.reduce((sum, rep) => sum + rep.target, 0);
  const enrollment = reps.reduce((sum, rep) => sum + rep.enrollment, 0);
  const remaining = reps.reduce((sum, rep) => sum + rep.remaining, 0);
  const expected = reps.reduce((sum, rep) => sum + rep.expected, 0);
  const openOpportunities = reps.reduce((sum, rep) => sum + rep.openOpportunities, 0);
  const overdue = reps.reduce((sum, rep) => sum + rep.overdue, 0);
  const agingOverSla = reps.reduce((sum, rep) => sum + rep.agingOverSlaCount, 0);
  const pipeline = aggregatePipeline(reps);
  const closedOpportunities = reps.reduce((sum, rep) => sum + rep.closedOpportunities, 0);
  const wonOpportunities = reps.reduce((sum, rep) => sum + rep.wonOpportunities, 0);
  const summary: LeadSaleMockSummary = {
    enrollment,
    target,
    achievement: target ? Math.round((enrollment / target) * 100) : 0,
    remaining,
    expected,
    coverage: remaining ? Number((expected / remaining).toFixed(2)) : 0,
    openOpportunities,
    newOpportunities: pipeline.newOpportunities,
    winRate: closedOpportunities ? Math.round((wonOpportunities / closedOpportunities) * 100) : 0,
    followUpDue: pipeline.followUpDue,
    overdue,
    agingOverSla,
  };
  const scopedTrend = pipeline.trend;
  const scopedAgingBuckets = MOCK_LEAD_SALE_DASHBOARD.agingBuckets.map((bucket) => ({
    ...bucket,
    count: pipeline.agingBuckets[bucket.id] ?? 0,
  }));
  const scopedStages = getScopedStages(pipeline);
  const scopedActions = MOCK_LEAD_SALE_DASHBOARD.actions.map((action) => ({
    ...action,
    value: action.id === "overdue"
      ? summary.overdue
      : action.id === "aging"
        ? summary.agingOverSla
        : action.id === "due-today"
          ? summary.followUpDue
          : action.id === "unassigned" && selectedRep
            ? 0
          : scaleCount(action.value, factor),
  }));
  const scopedPriorityQueue = selectedRep
    ? MOCK_LEAD_SALE_DASHBOARD.priorityQueue.filter((record) => record.owner === selectedRep.name)
    : MOCK_LEAD_SALE_DASHBOARD.priorityQueue;
  const scopedDetails = buildScopedDetails({
    reps,
    stages: scopedStages,
    agingBuckets: scopedAgingBuckets,
    summary,
    selectedRep,
  });
  const periodLabel = scopeOptionLabel("period", filters.period);
  const scopeLabel = [
    filters.sales === "all-sales" ? "Toàn đội" : scopeOptionLabel("sales", filters.sales),
    scopeOptionLabel("program", filters.program),
    scopeOptionLabel("source", filters.source),
    scopeOptionLabel("region", filters.region),
  ].join(" · ");

  return {
    ...MOCK_LEAD_SALE_DASHBOARD,
    periodLabel,
    scopeLabel,
    activeFilters: filters,
    teamName: selectedRep ? selectedRep.name : MOCK_LEAD_SALE_DASHBOARD.teamName,
    summary,
    reps,
    actions: scopedActions,
    priorityQueue: scopedPriorityQueue,
    stages: scopedStages,
    trend: scopedTrend,
    agingBuckets: scopedAgingBuckets,
    details: scopedDetails,
  };
}
