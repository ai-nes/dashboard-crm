import type {
  AudienceComposition,
  DataCoverageMetric,
  DemandOverview,
  DemographicKpi,
  DemographicSegment,
  DirectorDemographicsOverviewParams,
  DirectorDemographicsOverviewResponse,
  DirectorDemographicsSegmentParams,
  DirectorDemographicsSegmentResponse,
  RegionOpportunity,
  RegionalDemandMatrix,
  SegmentFilter,
  SegmentGuardrail,
  SegmentNextAction,
} from "./types";
import { acquisitionMapData } from "./acquisition-map-data";

export const initialFilters: SegmentFilter[] = [
  { id: "gender", label: "Giới tính", value: "Nữ" },
  { id: "grade", label: "Khối lớp", value: "Lớp 12" },
  { id: "interest", label: "Ngành quan tâm", value: "AI (Trí tuệ nhân tạo)" },
  { id: "province", label: "Tỉnh/thành phố", value: "Đồng Nai" },
];

export const regionOpportunities: RegionOpportunity[] = [
  { rank: 1, name: "TP. Hồ Chí Minh", score: 82 },
  { rank: 2, name: "Bình Dương", score: 76 },
  { rank: 3, name: "Đồng Nai", score: 72, selected: true },
  { rank: 4, name: "Cần Thơ", score: 61 },
  { rank: 5, name: "Đà Nẵng", score: 55 },
];

export const demographicKpis: DemographicKpi[] = [
  { id: "prospects", label: "Tổng lead", value: "57.840", change: "+12,6%", helper: "so với cùng kỳ", progress: 86, tone: "primary" },
  { id: "engaged", label: "Đã tương tác", value: "24.360", change: "+3,8 điểm %", helper: "42,1% trên tổng lead", progress: 72, tone: "info" },
  { id: "qualified", label: "Đủ điều kiện tư vấn", value: "8.940", change: "+1,6 điểm %", helper: "36,7% trên lead đã tương tác", progress: 64, tone: "success" },
  { id: "enrolled", label: "Đã nhập học", value: "1.284", change: "+8,4%", helper: "2,22% trên tổng lead", progress: 58, tone: "warning" },
];

export const demandOverviewData: DemandOverview = {
  trend: [
    { month: "T1", ai: 2160, software: 2860, business: 2520, design: 1280 },
    { month: "T2", ai: 2380, software: 2940, business: 2570, design: 1360 },
    { month: "T3", ai: 2520, software: 3010, business: 2600, design: 1410 },
    { month: "T4", ai: 2690, software: 3080, business: 2580, design: 1490 },
    { month: "T5", ai: 2840, software: 3190, business: 2550, design: 1530 },
    { month: "T6", ai: 3420, software: 3340, business: 2610, design: 1620 },
  ],
  summary: [
    { id: "ai", label: "AI", value: 3420, change: 20.4 },
    { id: "software", label: "Phần mềm", value: 3340, change: 4.7 },
    { id: "business", label: "Kinh doanh", value: 2610, change: 2.4 },
    { id: "design", label: "Thiết kế", value: 1620, change: 5.9 },
  ],
};

export const audienceCompositionData: AudienceComposition = {
  total: 57840,
  gender: [
    { id: "female", name: "Nữ", value: 46.8, fill: "var(--brand-500)" },
    { id: "male", name: "Nam", value: 51.6, fill: "var(--info-500)" },
    { id: "unknown", name: "Chưa xác định", value: 1.6, fill: "var(--background-soft-300)" },
  ],
  profiles: [
    { id: "grade-12", label: "Học sinh lớp 12", value: 63.4, count: 36660, detail: "36.660 lead", color: "bg-brand-500" },
    { id: "public-school", label: "Trường công lập", value: 72.1, count: 41710, detail: "41.710 lead", color: "bg-success-500" },
    { id: "urban", label: "Khu vực đô thị", value: 58.7, count: 33960, detail: "33.960 lead", color: "bg-info-500" },
    { id: "has-interest", label: "Đã có ngành quan tâm", value: 88.1, count: 50960, detail: "50.960 lead", color: "bg-warning-500" },
  ],
};

export const regionalDemandMatrixData: RegionalDemandMatrix = {
  metric: "relative-index",
  unit: "score",
  columns: [
    { id: "hcm", name: "TP.HCM" },
    { id: "dong-nai", name: "Đồng Nai" },
    { id: "binh-duong", name: "Bình Dương" },
    { id: "can-tho", name: "Cần Thơ" },
    { id: "da-nang", name: "Đà Nẵng" },
  ],
  rows: [
    { interest: "Trí tuệ nhân tạo", scores: { hcm: 86, "dong-nai": 93, "binh-duong": 74, "can-tho": 55, "da-nang": 67 } },
    { interest: "Kỹ thuật phần mềm", scores: { hcm: 75, "dong-nai": 72, "binh-duong": 89, "can-tho": 61, "da-nang": 78 } },
    { interest: "Quản trị kinh doanh", scores: { hcm: 68, "dong-nai": 61, "binh-duong": 67, "can-tho": 84, "da-nang": 64 } },
    { interest: "Thiết kế mỹ thuật số", scores: { hcm: 72, "dong-nai": 48, "binh-duong": 53, "can-tho": 42, "da-nang": 76 } },
    { interest: "Công nghệ ô tô", scores: { hcm: 54, "dong-nai": 81, "binh-duong": 77, "can-tho": 58, "da-nang": 49 } },
  ],
};

export const dataCoverageMetrics: DataCoverageMetric[] = [
  { label: "Địa lý", detail: "Tỉnh, huyện, vùng tuyển sinh", value: 96.4, tone: "success" },
  { label: "Thông tin người học", detail: "Giới tính, khối lớp, tuổi, học lực", value: 31.2, tone: "warning" },
  { label: "Ngành quan tâm", detail: "Nhóm ngành và ngành cụ thể", value: 88.1, tone: "success" },
  { label: "Hành vi", detail: "Website, sự kiện, tham quan trường", value: 94.8, tone: "success" },
];

export const defaultGuardrails: SegmentGuardrail[] = [
  {
    criterion: "Khả năng học phí",
    issue: "Không suy đoán thu nhập gia đình của người chưa thành niên.",
    replacement: "Dùng lượt xem học phí và nhu cầu học bổng.",
    status: "Tạm khóa",
    tone: "error",
  },
  {
    criterion: "Học lực chi tiết",
    issue: "Dữ liệu điểm chưa chuẩn hóa giữa các trường THPT.",
    replacement: "Dùng kết quả tự đánh giá và nhóm năng lực quan sát được.",
    status: "Cần đồng ý",
    tone: "warning",
  },
  {
    criterion: "Định danh cá nhân",
    issue: "Không sử dụng danh tính cá nhân trong dashboard phân tích nhóm.",
    replacement: "Chỉ hiển thị chỉ số nhóm với quy mô tối thiểu 30 lead.",
    status: "Đang áp dụng",
    tone: "success",
  },
];

export const demographicSegments: DemographicSegment[] = [
  {
    id: "female-ai-dong-nai",
    name: "Nữ · Lớp 12 · Đông Nam Bộ · quan tâm AI",
    shortName: "Nữ · AI · ĐNB",
    description: "Tăng nhanh tại Đồng Nai nhưng độ phủ truyền thông còn thấp.",
    region: "Đồng Nai",
    interest: "Trí tuệ nhân tạo",
    prospects: 3420,
    engaged: 1280,
    qualified: 420,
    counselling: 268,
    applications: 160,
    enrolled: 68,
    conversion: 2,
    tuition: null,
    revenue: null,
    growth: 31,
    coverage: 3.2,
    opportunityScore: 92,
    tone: "primary",
    filters: initialFilters,
    channels: [
      { name: "Mạng xã hội", value: 38, fill: "var(--brand-500)" },
      { name: "Sự kiện", value: 24, fill: "var(--success-500)" },
      { name: "Website", value: 22, fill: "var(--info-500)" },
      { name: "Giới thiệu", value: 16, fill: "var(--warning-500)" },
    ],
    channelAttributionModel: "observed-interactions",
    monthlyProspects: [
      { month: "T1", current: 1960, benchmark: 2100 },
      { month: "T2", current: 2160, benchmark: 2280 },
      { month: "T3", current: 2380, benchmark: 2460 },
      { month: "T4", current: 2520, benchmark: 2660 },
      { month: "T5", current: 2600, benchmark: 2820 },
      { month: "T6", current: 3420, benchmark: 3000 },
    ],
  },
  {
    id: "male-ai-dong-nai",
    name: "Nam · Lớp 12 · Đông Nam Bộ · quan tâm AI",
    shortName: "Nam · AI · ĐNB",
    description: "Quy mô lớn, chuyển đổi ổn định và đã được khai thác tốt hơn.",
    region: "Đồng Nai",
    interest: "Trí tuệ nhân tạo",
    prospects: 5180,
    engaged: 2010,
    qualified: 640,
    counselling: 386,
    applications: 248,
    enrolled: 96,
    conversion: 1.9,
    tuition: null,
    revenue: null,
    growth: 12,
    coverage: 14.8,
    opportunityScore: 78,
    tone: "info",
    filters: [
      { id: "gender", label: "Giới tính", value: "Nam" },
      { id: "grade", label: "Khối lớp", value: "Lớp 12" },
      { id: "interest", label: "Ngành quan tâm", value: "AI (Trí tuệ nhân tạo)" },
      { id: "province", label: "Tỉnh/thành phố", value: "Đồng Nai" },
    ],
    channels: [
      { name: "Mạng xã hội", value: 42, fill: "var(--brand-500)" },
      { name: "Sự kiện", value: 21, fill: "var(--success-500)" },
      { name: "Website", value: 20, fill: "var(--info-500)" },
      { name: "Giới thiệu", value: 17, fill: "var(--warning-500)" },
    ],
    channelAttributionModel: "observed-interactions",
    monthlyProspects: [
      { month: "T1", current: 3100, benchmark: 3320 },
      { month: "T2", current: 3400, benchmark: 3540 },
      { month: "T3", current: 3800, benchmark: 3820 },
      { month: "T4", current: 4200, benchmark: 4140 },
      { month: "T5", current: 4620, benchmark: 4470 },
      { month: "T6", current: 5180, benchmark: 4800 },
    ],
  },
  {
    id: "female-business-mekong",
    name: "Nữ · Lớp 12 · ĐBSCL · quan tâm Quản trị kinh doanh",
    shortName: "Nữ · QTKD · ĐBSCL",
    description: "Quy mô vừa, độ phủ vùng tốt nhưng tăng trưởng chậm hơn.",
    region: "Đồng bằng sông Cửu Long",
    interest: "Quản trị kinh doanh",
    prospects: 2140,
    engaged: 780,
    qualified: 246,
    counselling: 152,
    applications: 92,
    enrolled: 34,
    conversion: 1.6,
    tuition: null,
    revenue: null,
    growth: 8,
    coverage: 19.4,
    opportunityScore: 64,
    tone: "success",
    filters: [
      { id: "gender", label: "Giới tính", value: "Nữ" },
      { id: "grade", label: "Khối lớp", value: "Lớp 12" },
      { id: "interest", label: "Ngành quan tâm", value: "Quản trị kinh doanh" },
      { id: "region", label: "Vùng", value: "ĐBSCL" },
    ],
    channels: [
      { name: "Mạng xã hội", value: 30, fill: "var(--brand-500)" },
      { name: "Sự kiện", value: 30, fill: "var(--success-500)" },
      { name: "Website", value: 22, fill: "var(--info-500)" },
      { name: "Giới thiệu", value: 18, fill: "var(--warning-500)" },
    ],
    channelAttributionModel: "observed-interactions",
    monthlyProspects: [
      { month: "T1", current: 1730, benchmark: 1870 },
      { month: "T2", current: 1810, benchmark: 1940 },
      { month: "T3", current: 1900, benchmark: 2020 },
      { month: "T4", current: 1960, benchmark: 2110 },
      { month: "T5", current: 1980, benchmark: 2180 },
      { month: "T6", current: 2140, benchmark: 2260 },
    ],
  },
  {
    id: "private-hcm-business",
    name: "Trường ngoài công lập · TP.HCM · nhóm ngành kinh doanh",
    shortName: "Ngoài CL · Kinh doanh",
    description: "Tỷ lệ nhập học thấp thứ hai nhưng quy mô đang tăng.",
    region: "TP. Hồ Chí Minh",
    interest: "Kinh doanh",
    prospects: 1840,
    engaged: 720,
    qualified: 235,
    counselling: 142,
    applications: 84,
    enrolled: 31,
    conversion: 1.7,
    tuition: null,
    revenue: null,
    growth: 18,
    coverage: 11.6,
    opportunityScore: 81,
    tone: "warning",
    filters: [
      { id: "schoolType", label: "Loại trường", value: "Ngoài công lập" },
      { id: "province", label: "Tỉnh/thành phố", value: "TP. Hồ Chí Minh" },
      { id: "interest", label: "Ngành quan tâm", value: "Nhóm ngành kinh doanh" },
    ],
    channels: [
      { name: "Mạng xã hội", value: 35, fill: "var(--brand-500)" },
      { name: "Sự kiện", value: 28, fill: "var(--success-500)" },
      { name: "Website", value: 23, fill: "var(--info-500)" },
      { name: "Giới thiệu", value: 14, fill: "var(--warning-500)" },
    ],
    channelAttributionModel: "observed-interactions",
    monthlyProspects: [
      { month: "T1", current: 1320, benchmark: 1490 },
      { month: "T2", current: 1450, benchmark: 1570 },
      { month: "T3", current: 1510, benchmark: 1650 },
      { month: "T4", current: 1570, benchmark: 1740 },
      { month: "T5", current: 1560, benchmark: 1820 },
      { month: "T6", current: 1840, benchmark: 1910 },
    ],
  },
  {
    id: "software-binh-duong",
    name: "Lớp 12 · Bình Dương · quan tâm Kỹ thuật phần mềm",
    shortName: "KTPM · Bình Dương",
    description: "Nhiều lead đủ điều kiện, tăng đều trong ba tháng gần nhất.",
    region: "Bình Dương",
    interest: "Kỹ thuật phần mềm",
    prospects: 2960,
    engaged: 1260,
    qualified: 486,
    counselling: 301,
    applications: 194,
    enrolled: 83,
    conversion: 2.8,
    tuition: null,
    revenue: null,
    growth: 21,
    coverage: 16.2,
    opportunityScore: 87,
    tone: "danger",
    filters: [
      { id: "grade", label: "Khối lớp", value: "Lớp 12" },
      { id: "province", label: "Tỉnh/thành phố", value: "Bình Dương" },
      { id: "interest", label: "Ngành quan tâm", value: "Kỹ thuật phần mềm" },
    ],
    channels: [
      { name: "Mạng xã hội", value: 46, fill: "var(--brand-500)" },
      { name: "Sự kiện", value: 20, fill: "var(--success-500)" },
      { name: "Website", value: 18, fill: "var(--info-500)" },
      { name: "Giới thiệu", value: 16, fill: "var(--warning-500)" },
    ],
    channelAttributionModel: "observed-interactions",
    monthlyProspects: [
      { month: "T1", current: 2100, benchmark: 2240 },
      { month: "T2", current: 2250, benchmark: 2380 },
      { month: "T3", current: 2400, benchmark: 2520 },
      { month: "T4", current: 2500, benchmark: 2650 },
      { month: "T5", current: 2440, benchmark: 2770 },
      { month: "T6", current: 2960, benchmark: 2890 },
    ],
  },
];

export function getSegmentForFilters(filters: SegmentFilter[]): DemographicSegment | null {
  const matchingSegments = demographicSegments.filter((segment) =>
    filters.every((filter) =>
      segment.filters.some((segmentFilter) => segmentFilter.id === filter.id && segmentFilter.value === filter.value),
    ),
  );
  if (matchingSegments.length === 0) return null;
  if (matchingSegments.length === 1) return matchingSegments[0];

  const prospects = matchingSegments.reduce((sum, segment) => sum + segment.prospects, 0);
  const engaged = matchingSegments.reduce((sum, segment) => sum + segment.engaged, 0);
  const qualified = matchingSegments.reduce((sum, segment) => sum + segment.qualified, 0);
  const counselling = matchingSegments.reduce((sum, segment) => sum + segment.counselling, 0);
  const applications = matchingSegments.reduce((sum, segment) => sum + segment.applications, 0);
  const enrolled = matchingSegments.reduce((sum, segment) => sum + segment.enrolled, 0);
  const weighted = (key: "tuition" | "growth" | "coverage" | "opportunityScore") =>
    matchingSegments.reduce((sum, segment) => sum + (segment[key] ?? 0) * segment.prospects, 0) / prospects;
  const monthlyProspects = matchingSegments[0].monthlyProspects.map((point, index) => ({
    month: point.month,
    current: matchingSegments.reduce((sum, segment) => sum + (segment.monthlyProspects[index].current ?? 0), 0),
    benchmark: matchingSegments.reduce((sum, segment) => sum + (segment.monthlyProspects[index].benchmark ?? 0), 0),
  }));
  const previousMonth = monthlyProspects[monthlyProspects.length - 2]?.current ?? 0;
  const latestMonth = monthlyProspects[monthlyProspects.length - 1]?.current ?? 0;
  const channelNames = Array.from(new Set(matchingSegments.flatMap((segment) => segment.channels.map((channel) => channel.name))));
  const channels = channelNames.map((name) => {
    const value =
      matchingSegments.reduce(
        (sum, segment) => sum + (segment.channels.find((channel) => channel.name === name)?.value ?? 0) * segment.engaged,
        0,
      ) / (engaged || 1);
    const fill = matchingSegments.flatMap((segment) => segment.channels).find((channel) => channel.name === name)?.fill ?? "var(--brand-500)";
    return { name, value: Number(value.toFixed(1)), fill };
  });
  const opportunityScore = weighted("opportunityScore");

  return {
    id: `custom-${filters.map((filter) => `${filter.id}-${filter.value}`).join("-")}`,
    name: filters.length > 0 ? filters.map((filter) => filter.value).join(" · ") : "Tất cả học sinh",
    shortName: filters.length > 0 ? filters.map((filter) => filter.value).slice(0, 3).join(" · ") : "Tất cả",
    description: `Có ${prospects.toLocaleString("vi-VN")} lead theo điều kiện đang chọn.`,
    region: filters.find((filter) => filter.id === "province" || filter.id === "region")?.value ?? "Nhiều khu vực",
    interest: filters.find((filter) => filter.id === "interest")?.value ?? "Nhiều nhóm ngành",
    prospects,
    engaged,
    qualified,
    counselling,
    applications,
    enrolled,
    conversion: prospects > 0 ? Number(((enrolled / prospects) * 100).toFixed(1)) : 0,
    tuition: enrolled > 0 ? matchingSegments.reduce((sum, segment) => sum + (segment.tuition ?? 0) * segment.enrolled, 0) / enrolled : weighted("tuition"),
    revenue: matchingSegments.reduce((sum, segment) => sum + (segment.revenue ?? 0), 0),
    growth: previousMonth > 0 ? Number((((latestMonth - previousMonth) / previousMonth) * 100).toFixed(1)) : Number(weighted("growth").toFixed(1)),
    coverage: Number(weighted("coverage").toFixed(1)),
    opportunityScore: Math.round(opportunityScore),
    tone: opportunityScore >= 85 ? "primary" : opportunityScore >= 70 ? "info" : opportunityScore >= 55 ? "success" : "warning",
    filters,
    channels,
    monthlyProspects,
  };
}

export function getAvailableSegmentFilters(filters: SegmentFilter[]) {
  const candidates = demographicSegments.flatMap((segment) => segment.filters);
  return candidates.filter((candidate, index, allCandidates) => {
    const isUnique = allCandidates.findIndex((item) => item.id === candidate.id && item.value === candidate.value) === index;
    const dimensionAlreadyUsed = filters.some((filter) => filter.id === candidate.id);
    return isUnique && !dimensionAlreadyUsed && getSegmentForFilters([...filters, candidate]) !== null;
  });
}

export function computeDirectorDemographicsOverview(
  params?: DirectorDemographicsOverviewParams,
): DirectorDemographicsOverviewResponse {
  const admissionYear = params?.admissionYear ?? 2026;
  const page = Math.max(1, Math.floor(params?.page ?? 1));
  const pageSize = Math.max(1, Math.min(Math.floor(params?.pageSize ?? 5), 100));
  const period = params?.period ?? "6m";
  const scope = params?.scope ?? "all";
  const rankedSegments = [...demographicSegments].sort((first, second) => {
    const scoreDifference = second.opportunityScore - first.opportunityScore;
    return scoreDifference || first.id.localeCompare(second.id);
  });
  const total = rankedSegments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasNextPage = page < totalPages;

  return {
    data: {
      kpis: demographicKpis,
      demand: demandOverviewData,
      audienceComposition: audienceCompositionData,
      segments: rankedSegments.slice((page - 1) * pageSize, page * pageSize),
      acquisitionMap: acquisitionMapData,
      regionOpportunities,
      regionalDemand: regionalDemandMatrixData,
      dataCoverage: dataCoverageMetrics,
    },
    meta: {
      admissionYear,
      period,
      scope,
      asOf: "2026-06-06T10:00:00+07:00",
      totalProspects: audienceCompositionData.total,
      minSampleSize: 30,
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage,
      dataAvailability: {
        trend: true,
        tuition: false,
        revenue: false,
        eligibleSegments: total,
        acquisitionMap: "complete",
      },
    },
  };
}

export function computeDirectorDemographicsSegment(
  params: DirectorDemographicsSegmentParams,
): DirectorDemographicsSegmentResponse | null {
  const segment = demographicSegments.find((item) => item.id === params.segment_id);
  if (!segment) return null;

  const benchmark =
    demographicSegments.find((item) => item.id !== segment.id && item.region === segment.region) ??
    demographicSegments.find((item) => item.id !== segment.id) ??
    segment;

  const nextAction: SegmentNextAction = {
    priority: segment.opportunityScore >= 85 ? "high" : "normal",
    label: segment.opportunityScore >= 85 ? "Ưu tiên cao" : "Theo dõi thường quy",
    title: segment.opportunityScore >= 85 ? "Ưu tiên tiếp cận sớm" : "Duy trì nhịp chăm sóc tiêu chuẩn",
    description: `Nhóm có ${segment.prospects.toLocaleString("vi-VN")} lead và đang tăng trưởng ${segment.growth}%.`,
    steps: [
      {
        order: 1,
        title: `Tiếp cận qua ${segment.channels[0]?.name ?? "Mạng xã hội"}`,
        detail: `${segment.channels[0]?.value ?? 38}% tương tác đầu tiên đến từ kênh này.`,
      },
      {
        order: 2,
        title: "Tổ chức một hoạt động tư vấn chuyên sâu",
        detail: `Tập trung vào ${segment.interest}; giải đáp học phí và học bổng.`,
      },
      {
        order: 3,
        title: "Đánh giá lại sau 30 ngày",
        detail: "So sánh số lead được tiếp cận, nộp hồ sơ và nhập học.",
      },
    ],
  };

  return {
    data: {
      segment,
      benchmark,
      regionOpportunities,
      nextAction,
      guardrails: defaultGuardrails,
    },
    meta: {
      admissionYear: params.admissionYear ?? 2026,
      asOf: "2026-06-06T10:00:00+07:00",
      minSampleSize: 30,
      sampleSize: segment.prospects,
    },
  };
}

