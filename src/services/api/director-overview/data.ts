import type {
  AdmissionsPipeline,
  AdmissionsTrend,
  DirectorBriefing,
  DirectorKpi,
  DirectorOverviewParams,
  DirectorOverviewResponse,
  EnrollmentForecast,
  MarketOverviewItem,
  PipelineStage,
  SourcePerformance,
  TrendRange,
  WeeklyActivity,
} from "./types";

export const initialDirectorKpis: DirectorKpi[] = [
  {
    id: "prospects",
    label: "Tổng hồ sơ tiềm năng",
    value: "24.860",
    target: "30.000",
    achievement: "82,9%",
    change: "+9,8%",
    helper: "so với kỳ trước",
    tone: "primary",
  },
  {
    id: "qualified",
    label: "Hồ sơ đủ điều kiện",
    value: "14.420",
    target: "18.000",
    achievement: "80,1%",
    change: "+12,4%",
    helper: "so với tuần trước",
    tone: "info",
  },
  {
    id: "applicants",
    label: "Đã nộp hồ sơ",
    value: "6.980",
    target: "8.200",
    achievement: "85,1%",
    change: "+8,6%",
    helper: "so với kỳ trước",
    tone: "warning",
  },
  {
    id: "accepted",
    label: "Đã trúng tuyển",
    value: "4.820",
    target: "6.000",
    achievement: "80,3%",
    change: "+10,1%",
    helper: "so với kỳ trước",
    tone: "info",
  },
  {
    id: "enrollment",
    label: "Đã nhập học",
    value: "3.820",
    target: "5.000",
    achievement: "76,4%",
    change: "+6,8%",
    helper: "so với kỳ trước",
    tone: "success",
  },
];

export const initialEnrollmentForecast: EnrollmentForecast = {
  summary: {
    actual: 3820,
    forecast: 4680,
    target: 5000,
    confidence: 72,
    gapToTarget: 320,
  },
  points: [
    { label: "T1", actual: 420, forecast: 420, target: 520 },
    { label: "T2", actual: 860, forecast: 860, target: 1020 },
    { label: "T3", actual: 1320, forecast: 1320, target: 1560 },
    { label: "T4", actual: 1860, forecast: 1860, target: 2120 },
    { label: "T5", actual: 2410, forecast: 2410, target: 2700 },
    { label: "T6", actual: 2920, forecast: 2920, target: 3280 },
    { label: "T7", actual: 3420, forecast: 3420, target: 3920 },
    { label: "T8", actual: 3820, forecast: 3820, target: 4180 },
    { label: "T9", actual: null, forecast: 4180, target: 4560 },
    { label: "T10", actual: null, forecast: 4680, target: 5000 },
  ],
};

export const initialDirectorBriefing: DirectorBriefing = {
  alert: {
    id: "dong-nai-risk",
    type: "risk",
    title: "Chuyển đổi tại Đồng Nai giảm 14%",
    description: "Tỷ lệ từ nộp hồ sơ đến nhập học giảm liên tục trong 14 ngày gần đây.",
    evidence: "4 trường có quy mô lớn chưa có hoạt động tuyển sinh mới.",
    metric: "-14%",
    href: "/director/regional-performance",
  },
  priorityAction: {
    id: "school-event",
    title: "Tổ chức sự kiện tại Đồng Nai",
    description: "Kích hoạt tư vấn hướng nghiệp cho 4 trường chưa có hoạt động trong 45 ngày.",
    impact: "+3.0% chuyển đổi",
    href: "/director/schools",
  },
};

export const initialPipelineStages: PipelineStage[] = [
  {
    id: "prospect",
    label: "Hồ sơ tiềm năng",
    value: "24.860",
    percentage: 100,
    conversion: "100%",
  },
  {
    id: "engaged",
    label: "Đã tương tác",
    value: "18.840",
    percentage: 76,
    conversion: "75,8%",
  },
  {
    id: "qualified",
    label: "Đủ điều kiện",
    value: "14.420",
    percentage: 58,
    conversion: "76,5%",
  },
  {
    id: "counselling",
    label: "Đang tư vấn",
    value: "10.240",
    percentage: 41,
    conversion: "71,0%",
  },
  {
    id: "application",
    label: "Đã nộp hồ sơ",
    value: "6.980",
    percentage: 28,
    conversion: "68,2%",
  },
  {
    id: "accepted",
    label: "Đã trúng tuyển",
    value: "4.820",
    percentage: 19,
    conversion: "69,1%",
  },
  {
    id: "enrolled",
    label: "Đã nhập học",
    value: "3.820",
    percentage: 15,
    conversion: "79,3%",
  },
];

export const initialAdmissionsTrend: AdmissionsTrend = {
  defaultRange: "30d",
  ranges: {
    "7d": {
      points: [
        { label: "T2", newLeads: 310, applicants: 112, enrolled: 42 },
        { label: "T3", newLeads: 362, applicants: 128, enrolled: 48 },
        { label: "T4", newLeads: 348, applicants: 121, enrolled: 51 },
        { label: "T5", newLeads: 401, applicants: 146, enrolled: 58 },
        { label: "T6", newLeads: 386, applicants: 138, enrolled: 55 },
        { label: "T7", newLeads: 434, applicants: 159, enrolled: 62 },
        { label: "CN", newLeads: 486, applicants: 176, enrolled: 68 },
      ],
      totals: {
        newLeads: 2727,
        applicants: 980,
        enrolled: 384,
      },
    },
    "30d": {
      points: [
        { label: "Tuần 1", newLeads: 1220, applicants: 438, enrolled: 174 },
        { label: "Tuần 2", newLeads: 1480, applicants: 512, enrolled: 208 },
        { label: "Tuần 3", newLeads: 1694, applicants: 628, enrolled: 256 },
        { label: "Tuần 4", newLeads: 1852, applicants: 706, enrolled: 288 },
      ],
      totals: {
        newLeads: 6246,
        applicants: 2284,
        enrolled: 926,
      },
    },
    year: {
      points: [
        { label: "T1", newLeads: 12400, applicants: 2900, enrolled: 1240 },
        { label: "T2", newLeads: 13840, applicants: 3420, enrolled: 1540 },
        { label: "T3", newLeads: 15120, applicants: 4010, enrolled: 1830 },
        { label: "T4", newLeads: 16680, applicants: 4560, enrolled: 2190 },
        { label: "T5", newLeads: 18320, applicants: 5120, enrolled: 2610 },
        { label: "T6", newLeads: 20140, applicants: 5740, enrolled: 3020 },
        { label: "T7", newLeads: 22580, applicants: 6320, enrolled: 3440 },
        { label: "T8", newLeads: 24860, applicants: 6980, enrolled: 3820 },
      ],
      totals: {
        newLeads: 143940,
        applicants: 39050,
        enrolled: 19690,
      },
    },
  },
};

export const initialMarketOverview: MarketOverviewItem[] = [
  {
    id: "southeast",
    name: "Đông Nam Bộ",
    prospects: "8,420",
    enrolled: "1,286",
    conversion: "15.3%",
    growth: "+18.4%",
    coverage: 86,
    tone: "primary",
  },
  {
    id: "red-river",
    name: "Đồng bằng sông Hồng",
    prospects: "6,980",
    enrolled: "1,108",
    conversion: "15.9%",
    growth: "+12.2%",
    coverage: 78,
    tone: "info",
  },
  {
    id: "mekong",
    name: "Đồng bằng sông Cửu Long",
    prospects: "4,860",
    enrolled: "612",
    conversion: "12.6%",
    growth: "-8.2%",
    coverage: 62,
    tone: "danger",
  },
  {
    id: "central",
    name: "Bắc & Nam Trung Bộ",
    prospects: "4,600",
    enrolled: "814",
    conversion: "17.7%",
    growth: "+21.6%",
    coverage: 71,
    tone: "success",
  },
];

export const initialSourcePerformance: SourcePerformance[] = [
  {
    id: "facebook",
    label: "Quảng cáo Facebook",
    leads: "3,920",
    applicants: "684",
    enrolled: "318",
    share: 31,
  },
  {
    id: "school-tour",
    label: "Tư vấn tại trường",
    leads: "2,486",
    applicants: "524",
    enrolled: "286",
    share: 24,
  },
  {
    id: "zalo",
    label: "Zalo OA",
    leads: "2,138",
    applicants: "418",
    enrolled: "224",
    share: 19,
  },
  {
    id: "website",
    label: "Website / Biểu mẫu",
    leads: "1,842",
    applicants: "326",
    enrolled: "121",
    share: 14,
  },
  {
    id: "open-day",
    label: "Ngày hội tuyển sinh",
    leads: "1,026",
    applicants: "232",
    enrolled: "77",
    share: 8,
  },
];

export const initialWeeklyActivity: WeeklyActivity = {
  points: [
    { label: "T2", interactions: 680, sla: 94 },
    { label: "T3", interactions: 742, sla: 92 },
    { label: "T4", interactions: 816, sla: 95 },
    { label: "T5", interactions: 904, sla: 91 },
    { label: "T6", interactions: 862, sla: 93 },
    { label: "T7", interactions: 724, sla: 96 },
    { label: "CN", interactions: 512, sla: 98 },
  ],
  totalInteractions: 5240,
  averageSla: 94.1,
  changePercent: 12.6,
};

function computePipeline(): AdmissionsPipeline {
  const stages = initialPipelineStages;
  let biggestDrop = {
    fromStageId: stages[0].id,
    fromLabel: stages[0].label,
    toStageId: stages[1].id,
    toLabel: stages[1].label,
    differencePoints: stages[0].percentage - stages[1].percentage,
  };

  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1];
    const curr = stages[i];
    const diff = prev.percentage - curr.percentage;
    if (diff > biggestDrop.differencePoints) {
      biggestDrop = {
        fromStageId: prev.id,
        fromLabel: prev.label,
        toStageId: curr.id,
        toLabel: curr.label,
        differencePoints: diff,
      };
    }
  }

  return {
    stages,
    summary: {
      prospects: 24860,
      accepted: 4820,
      enrolled: 3820,
      enrollmentRate: 15.4,
    },
    biggestDrop,
  };
}

export function computeDirectorOverview(params?: DirectorOverviewParams): DirectorOverviewResponse {
  const admissionYear = params?.admissionYear ?? 2026;
  const scope = params?.scope ?? "all";
  const trendRange: TrendRange = params?.trendRange ?? "30d";

  const scopeLabels: Record<string, string> = {
    all: "Toàn bộ cơ sở",
    north: "Cơ sở Miền Bắc",
    south: "Cơ sở Miền Nam",
    central: "Cơ sở Miền Trung",
  };

  const scopeLabel = scopeLabels[scope] ?? `Cơ sở ${scope}`;

  return {
    meta: {
      admissionYear,
      scope,
      scopeLabel,
      asOf: "2026-06-06T10:00:00+07:00",
      freshnessLabel: "Dữ liệu cập nhật 2 phút trước",
      timezone: "Asia/Ho_Chi_Minh",
    },
    kpis: initialDirectorKpis,
    forecast: initialEnrollmentForecast,
    briefing: initialDirectorBriefing,
    pipeline: computePipeline(),
    admissionsTrend: {
      ...initialAdmissionsTrend,
      defaultRange: trendRange,
    },
    marketOverview: initialMarketOverview,
    sourcePerformance: initialSourcePerformance,
    weeklyActivity: initialWeeklyActivity,
  };
}

