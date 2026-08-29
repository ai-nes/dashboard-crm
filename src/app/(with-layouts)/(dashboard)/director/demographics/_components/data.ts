import type { ComparisonMetric, FunnelStage, RegionOpportunity, SegmentFilter } from "./types";

export const initialFilters: SegmentFilter[] = [
  { id: "gender", label: "Giới tính", value: "Nữ" },
  { id: "grade", label: "Khối lớp", value: "Lớp 12" },
  { id: "interest", label: "Quan tâm", value: "AI (Trí tuệ nhân tạo)" },
  { id: "province", label: "Tỉnh/TP", value: "Đồng Nai" },
];

export const funnelStages: FunnelStage[] = [
  { label: "Prospects", value: "3.420", width: 100 },
  { label: "Đã tương tác", value: "1.280", width: 74, conversion: "37,4%" },
  { label: "Đủ điều kiện", value: "420", width: 48, conversion: "32,8%" },
  { label: "Đã nộp hồ sơ", value: "160", width: 30, conversion: "38,1%" },
  { label: "Đã nhập học", value: "68", width: 17, conversion: "42,5%" },
];

export const regionOpportunities: RegionOpportunity[] = [
  { rank: 1, name: "TP. Hồ Chí Minh", score: 82 },
  { rank: 2, name: "Bình Dương", score: 76 },
  { rank: 3, name: "Đồng Nai", score: 72, selected: true },
  { rank: 4, name: "Cần Thơ", score: 61 },
  { rank: 5, name: "Đà Nẵng", score: 55 },
];

export const comparisonMetrics: ComparisonMetric[] = [
  { label: "Quy mô thị trường", primary: "3.420", secondary: "2.910", primaryWidth: 82, secondaryWidth: 70 },
  { label: "Tỷ lệ đủ điều kiện", primary: "12,3%", secondary: "9,6%", primaryWidth: 74, secondaryWidth: 58 },
  { label: "Tỷ lệ nộp hồ sơ", primary: "4,7%", secondary: "3,2%", primaryWidth: 68, secondaryWidth: 47 },
  { label: "Tỷ lệ nhập học", primary: "2,0%", secondary: "1,3%", primaryWidth: 64, secondaryWidth: 42 },
];

export const demandTrend = [
  { month: "T1", ai: 2160, business: 1940, design: 1280 },
  { month: "T2", ai: 2380, business: 2010, design: 1360 },
  { month: "T3", ai: 2520, business: 2080, design: 1410 },
  { month: "T4", ai: 2690, business: 2110, design: 1490 },
  { month: "T5", ai: 2840, business: 2180, design: 1530 },
  { month: "T6", ai: 3420, business: 2260, design: 1620 },
];

export const regionPortfolio = [
  { name: "TP.HCM", potential: 88, conversion: 7.2, prospects: 5210 },
  { name: "Bình Dương", potential: 76, conversion: 6.4, prospects: 3980 },
  { name: "Đồng Nai", potential: 72, conversion: 8.1, prospects: 3420 },
  { name: "Cần Thơ", potential: 61, conversion: 4.8, prospects: 2940 },
  { name: "Đà Nẵng", potential: 55, conversion: 5.3, prospects: 2210 },
];

export const journeyCohorts = [
  { stage: "Tương tác", current: 100, benchmark: 100 },
  { stage: "Đủ điều kiện", current: 32.8, benchmark: 26.1 },
  { stage: "Nộp hồ sơ", current: 12.3, benchmark: 8.9 },
  { stage: "Nhập học", current: 5.3, benchmark: 3.6 },
];

export const interestHeatmap = [
  { interest: "AI", hcm: 86, dongNai: 93, binhDuong: 74, canTho: 55 },
  { interest: "Kỹ thuật phần mềm", hcm: 75, dongNai: 72, binhDuong: 79, canTho: 51 },
  { interest: "Kinh doanh", hcm: 68, dongNai: 61, binhDuong: 67, canTho: 64 },
  { interest: "Thiết kế", hcm: 57, dongNai: 48, binhDuong: 53, canTho: 42 },
];
