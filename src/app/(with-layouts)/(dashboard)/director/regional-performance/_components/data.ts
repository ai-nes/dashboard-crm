import type {
  CapabilityColumn,
  FunnelStage,
  MonthlyTrend,
  PriorityAction,
  RegionPerformance,
} from "./types";

export const REGIONAL_SCOPE_LABEL = "7 địa bàn trọng điểm";

export const capabilityColumns: CapabilityColumn[] = [
  { key: "leadGeneration", label: "Tạo nguồn hồ sơ" },
  { key: "counselling", label: "Tư vấn" },
  { key: "quality", label: "Chất lượng hồ sơ" },
  { key: "conversion", label: "Tỷ lệ nhập học" },
  { key: "campaigns", label: "Hoạt động tuyển sinh" },
  { key: "productivity", label: "Năng suất đội ngũ" },
];

const baseTrend: MonthlyTrend[] = [
  {
    month: "T2",
    applications: 720,
    enrollments: 138,
    previousApplications: 655,
  },
  {
    month: "T3",
    applications: 840,
    enrollments: 169,
    previousApplications: 702,
  },
  {
    month: "T4",
    applications: 1010,
    enrollments: 210,
    previousApplications: 814,
  },
  {
    month: "T5",
    applications: 1160,
    enrollments: 248,
    previousApplications: 925,
  },
  {
    month: "T6",
    applications: 1292,
    enrollments: 292,
    previousApplications: 1014,
  },
  {
    month: "T7",
    applications: 1530,
    enrollments: 348,
    previousApplications: 1170,
  },
];

function createTrend(
  applicationScale: number,
  enrollmentScale: number,
): MonthlyTrend[] {
  return baseTrend.map((item) => ({
    month: item.month,
    applications: Math.round(item.applications * applicationScale),
    enrollments: Math.round(item.enrollments * enrollmentScale),
    previousApplications: Math.round(
      item.previousApplications * applicationScale,
    ),
  }));
}

function createFunnel(
  applications: number,
  enrollments: number,
  qualifiedRate: number,
  counsellingRate: number,
): FunnelStage[] {
  const qualified = Math.round(applications * qualifiedRate);
  const counselling = Math.round(qualified * counsellingRate);
  return [
    { stage: "Hồ sơ đăng ký", value: applications },
    { stage: "Đủ điều kiện", value: qualified },
    { stage: "Đang tư vấn", value: counselling },
    { stage: "Đã nhập học", value: enrollments },
  ];
}

export const provinces: RegionPerformance[] = [
  {
    id: "khanh-hoa",
    name: "Khánh Hoà",
    applications: 1084,
    enrollments: 242,
    targetAchievement: 88,
    conversion: 22.3,
    applicationChange: 9.4,
    enrollmentChange: 11.2,
    activeAdvisors: 9,
    capacity: 84,
    health: "watch",
    trend: createTrend(0.58, 0.61),
    funnel: createFunnel(1084, 242, 0.68, 0.78),
    capabilities: {
      leadGeneration: "good",
      counselling: "watch",
      quality: "good",
      conversion: "good",
      campaigns: "watch",
      productivity: "watch",
    },
  },
  {
    id: "dak-lak",
    name: "Đắk Lắk",
    applications: 826,
    enrollments: 166,
    targetAchievement: 76,
    conversion: 20.1,
    applicationChange: -2.8,
    enrollmentChange: -4.6,
    activeAdvisors: 8,
    capacity: 94,
    health: "critical",
    trend: createTrend(0.44, 0.42),
    funnel: createFunnel(826, 166, 0.62, 0.76),
    capabilities: {
      leadGeneration: "watch",
      counselling: "critical",
      quality: "watch",
      conversion: "watch",
      campaigns: "critical",
      productivity: "critical",
    },
  },
  {
    id: "lam-dong",
    name: "Lâm Đồng",
    applications: 912,
    enrollments: 213,
    targetAchievement: 83,
    conversion: 23.4,
    applicationChange: 5.7,
    enrollmentChange: 7.8,
    activeAdvisors: 8,
    capacity: 86,
    health: "watch",
    trend: createTrend(0.49, 0.54),
    funnel: createFunnel(912, 213, 0.7, 0.78),
    capabilities: {
      leadGeneration: "good",
      counselling: "watch",
      quality: "good",
      conversion: "good",
      campaigns: "watch",
      productivity: "watch",
    },
  },
  {
    id: "tp-ho-chi-minh",
    name: "TP. Hồ Chí Minh",
    applications: 3246,
    enrollments: 812,
    targetAchievement: 94,
    conversion: 25,
    applicationChange: 14.6,
    enrollmentChange: 16.8,
    activeAdvisors: 26,
    capacity: 82,
    health: "good",
    trend: createTrend(1.74, 2.08),
    funnel: createFunnel(3246, 812, 0.72, 0.78),
    capabilities: {
      leadGeneration: "good",
      counselling: "good",
      quality: "good",
      conversion: "good",
      campaigns: "good",
      productivity: "watch",
    },
  },
  {
    id: "dong-nai",
    name: "Đồng Nai",
    applications: 1886,
    enrollments: 447,
    targetAchievement: 89,
    conversion: 23.7,
    applicationChange: 8.1,
    enrollmentChange: 10.4,
    activeAdvisors: 15,
    capacity: 87,
    health: "watch",
    trend: createTrend(1.01, 1.15),
    funnel: createFunnel(1886, 447, 0.7, 0.79),
    capabilities: {
      leadGeneration: "good",
      counselling: "watch",
      quality: "good",
      conversion: "good",
      campaigns: "watch",
      productivity: "watch",
    },
  },
  {
    id: "dong-thap",
    name: "Đồng Tháp",
    applications: 796,
    enrollments: 159,
    targetAchievement: 73,
    conversion: 20,
    applicationChange: -4.1,
    enrollmentChange: -5.8,
    activeAdvisors: 7,
    capacity: 91,
    health: "critical",
    trend: createTrend(0.42, 0.4),
    funnel: createFunnel(796, 159, 0.61, 0.77),
    capabilities: {
      leadGeneration: "watch",
      counselling: "critical",
      quality: "watch",
      conversion: "watch",
      campaigns: "critical",
      productivity: "watch",
    },
  },
  {
    id: "tay-ninh",
    name: "Tây Ninh",
    applications: 1018,
    enrollments: 228,
    targetAchievement: 81,
    conversion: 22.4,
    applicationChange: 3.9,
    enrollmentChange: 5.1,
    activeAdvisors: 9,
    capacity: 89,
    health: "watch",
    trend: createTrend(0.55, 0.57),
    funnel: createFunnel(1018, 228, 0.67, 0.78),
    capabilities: {
      leadGeneration: "good",
      counselling: "watch",
      quality: "watch",
      conversion: "good",
      campaigns: "watch",
      productivity: "watch",
    },
  },
];

export const priorityActions: PriorityAction[] = [
  {
    id: "a1",
    title: "Bổ sung 2 tư vấn viên cho Đắk Lắk",
    detail: "Đội ngũ đã dùng 94% khả năng xử lý hồ sơ, cao nhất trong 7 tỉnh.",
    provinceId: "dak-lak",
    priority: "Cao",
    tone: "critical",
  },
  {
    id: "a2",
    title: "Hướng dẫn xử lý hồ sơ khó",
    detail:
      "Tỷ lệ hồ sơ qua bước đánh giá tại Đắk Lắk thấp hơn nhóm dẫn đầu 11 điểm phần trăm.",
    provinceId: "dak-lak",
    priority: "Cao",
    tone: "critical",
  },
  {
    id: "a3",
    title: "Rà soát mục tiêu nhập học tại Đồng Tháp",
    detail: "Tiến độ hiện tại thấp hơn kế hoạch 7 điểm phần trăm.",
    provinceId: "dong-thap",
    priority: "Cao",
    tone: "critical",
  },
  {
    id: "a4",
    title: "Mở rộng nguồn hồ sơ tại Tây Ninh",
    detail:
      "Tăng thêm hoạt động trường trọng điểm để bù khoảng thiếu 19% so với mục tiêu.",
    provinceId: "tay-ninh",
    priority: "Trung bình",
    tone: "watch",
  },
  {
    id: "a5",
    title: "Nhân rộng cách tư vấn hiệu quả",
    detail:
      "TP. Hồ Chí Minh đang có tỷ lệ chuyển đổi cao nhất nhóm, nên chia sẻ kịch bản cho các tỉnh cần theo dõi.",
    provinceId: "all",
    priority: "Thấp",
    tone: "good",
  },
];
