import type {
  ForecastDriver,
  RevenueForecastPoint,
  RevenueKpi,
  RevenueModelItem,
  RevenueRegion,
  RevenueScenario,
} from "./types";

export const revenueKpis: RevenueKpi[] = [
  {
    id: "forecast-revenue",
    label: "Dự báo doanh thu",
    value: "468B",
    target: "520B",
    achievement: "90.0%",
    change: "+11.5%",
    helper: "theo xu hướng hiện tại",
    tone: "primary",
  },
  {
    id: "actual-revenue",
    label: "Doanh thu thực tế",
    value: "382B",
    target: "520B",
    achievement: "73.5%",
    change: "+8.1%",
    helper: "từ hồ sơ đã nhập học",
    tone: "info",
  },
  {
    id: "forecast-enrollment",
    label: "Dự báo nhập học",
    value: "4,680",
    target: "5,000",
    achievement: "93.6%",
    change: "+14.2%",
    helper: "còn thiếu 320 người",
    tone: "success",
  },
  {
    id: "revenue-gap",
    label: "Khoảng thiếu chỉ tiêu",
    value: "52B",
    target: "520B",
    achievement: "10.0%",
    change: "-10.0%",
    helper: "cần bù trước cuối kỳ",
    tone: "warning",
  },
];

export const revenueForecast: RevenueForecastPoint[] = [
  { label: "T1", actual: 42, forecast: null, target: 52 },
  { label: "T2", actual: 86, forecast: null, target: 102 },
  { label: "T3", actual: 132, forecast: null, target: 156 },
  { label: "T4", actual: 186, forecast: null, target: 212 },
  { label: "T5", actual: 241, forecast: null, target: 270 },
  { label: "T6", actual: 292, forecast: null, target: 328 },
  { label: "T7", actual: 342, forecast: null, target: 392 },
  { label: "T8", actual: 382, forecast: 382, target: 418 },
  { label: "T9", actual: null, forecast: 420, target: 456 },
  { label: "T10", actual: null, forecast: 468, target: 520 },
];

export const revenueModel: RevenueModelItem[] = [
  {
    id: "tuition",
    label: "Học phí niêm yết",
    value: "520B",
    amount: 520,
    note: "100% chỉ tiêu gộp",
    tone: "primary",
  },
  {
    id: "scholarship",
    label: "Học bổng",
    value: "-18B",
    amount: 18,
    note: "3.5% doanh thu gộp",
    tone: "warning",
  },
  {
    id: "discount",
    label: "Chiết khấu & miễn giảm",
    value: "-34B",
    amount: 34,
    note: "6.5% doanh thu gộp",
    tone: "danger",
  },
  {
    id: "net-revenue",
    label: "Doanh thu thuần dự báo",
    value: "468B",
    amount: 468,
    note: "90.0% chỉ tiêu",
    tone: "success",
  },
];

export const revenueByRegion: RevenueRegion[] = [
  { id: "hcm", label: "TP. Hồ Chí Minh", actual: 82, forecast: 98, share: 21 },
  { id: "dong-nai", label: "Đồng Nai", actual: 28, forecast: 36, share: 8 },
  { id: "binh-duong", label: "Bình Dương", actual: 24, forecast: 31, share: 7 },
  { id: "mekong", label: "Đồng bằng sông Cửu Long", actual: 18, forecast: 22, share: 5 },
  { id: "north", label: "Miền Bắc", actual: 30, forecast: 40, share: 9 },
  { id: "other", label: "Khu vực khác", actual: 200, forecast: 241, share: 50 },
];

export const revenueScenarios: RevenueScenario[] = [
  {
    id: "base",
    label: "Cơ sở",
    description: "Giữ nguyên tỷ lệ chuyển đổi hiện tại",
    enrollment: "4,680",
    enrollmentValue: 4680,
    revenue: "468B",
    revenueValue: 468,
    delta: "—",
    impact: "Mốc dự báo hiện tại",
  },
  {
    id: "conversion-3",
    label: "Tỷ lệ chuyển đổi +3%",
    description: "Tăng chăm sóc nhóm đủ điều kiện",
    enrollment: "5,040",
    enrollmentValue: 5040,
    revenue: "505B",
    revenueValue: 505,
    delta: "+37B",
    impact: "+360 nhập học",
  },
  {
    id: "conversion-5",
    label: "Tỷ lệ chuyển đổi +5%",
    description: "Kích hoạt chiến dịch tại vùng trọng điểm",
    enrollment: "5,290",
    enrollmentValue: 5290,
    revenue: "531B",
    revenueValue: 531,
    delta: "+63B",
    impact: "+610 nhập học",
  },
];

export const positiveDrivers: ForecastDriver[] = [
  {
    id: "hcm-conversion",
    label: "TP. Hồ Chí Minh",
    value: "+8%",
    description: "tỷ lệ chuyển đổi tăng so với cùng kỳ",
    tone: "positive",
  },
  {
    id: "ai-program",
    label: "Chương trình AI",
    value: "+18%",
    description: "nhu cầu quan tâm tăng mạnh",
    tone: "positive",
  },
  {
    id: "school-partners",
    label: "Đối tác trường mới",
    value: "+12",
    description: "trường đã mở nguồn hồ sơ",
    tone: "positive",
  },
];

export const negativeDrivers: ForecastDriver[] = [
  {
    id: "mekong-conversion",
    label: "Đồng bằng sông Cửu Long",
    value: "-12%",
    description: "tỷ lệ chuyển đổi giảm trong 14 ngày",
    tone: "negative",
  },
  {
    id: "abandonment",
    label: "Bỏ dở hồ sơ",
    value: "+6%",
    description: "tăng ở nhóm chưa hoàn tất học phí",
    tone: "negative",
  },
];
