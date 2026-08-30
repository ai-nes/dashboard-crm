export type FunnelStage = {
  id: string;
  label: string;
  description: string;
  count: number;
};

export const funnelStages: FunnelStage[] = [
  { id: "prospect", label: "Hồ sơ tiềm năng", description: "Có định danh và đồng ý nhận tư vấn", count: 58420 },
  { id: "engaged", label: "Đã tương tác", description: "Đã phản hồi hai chiều", count: 26180 },
  { id: "qualified", label: "Đủ điều kiện", description: "Đúng nhóm tuyển sinh mục tiêu", count: 12640 },
  { id: "counselling", label: "Đã tư vấn", description: "Đã có ít nhất một phiên tư vấn", count: 8920 },
  { id: "application", label: "Đã đăng ký", description: "Đã khởi tạo hồ sơ đăng ký", count: 6240 },
  { id: "accepted", label: "Đã trúng tuyển", description: "Đủ điều kiện nhập học", count: 4910 },
  { id: "enrolled", label: "Đã nhập học", description: "Đã hoàn tất xác nhận nhập học", count: 3820 },
];

export type AgingRow = {
  stage: string;
  underThreeDays: number;
  threeToSevenDays: number;
  sevenToFourteenDays: number;
  overFourteenDays: number;
  medianDays: number;
};

export const agingRows: AgingRow[] = [
  { stage: "Hồ sơ tiềm năng", underThreeDays: 12480, threeToSevenDays: 8940, sevenToFourteenDays: 6120, overFourteenDays: 4680, medianDays: 2.1 },
  { stage: "Đã tương tác", underThreeDays: 5240, threeToSevenDays: 3810, sevenToFourteenDays: 2960, overFourteenDays: 1420, medianDays: 4.8 },
  { stage: "Đủ điều kiện", underThreeDays: 1980, threeToSevenDays: 1240, sevenToFourteenDays: 810, overFourteenDays: 692, medianDays: 6.2 },
  { stage: "Đã tư vấn", underThreeDays: 1140, threeToSevenDays: 820, sevenToFourteenDays: 460, overFourteenDays: 340, medianDays: 5.1 },
  { stage: "Đã đăng ký", underThreeDays: 980, threeToSevenDays: 610, sevenToFourteenDays: 310, overFourteenDays: 100, medianDays: 3.4 },
  { stage: "Đã trúng tuyển", underThreeDays: 420, threeToSevenDays: 280, sevenToFourteenDays: 190, overFourteenDays: 40, medianDays: 2.2 },
];

export type SourcePerformance = {
  source: string;
  stepRates: number[];
};

export const sourcePerformance: SourcePerformance[] = [
  { source: "Kênh số", stepRates: [44.1, 46.2, 68.4, 69.1, 77.8, 76.2] },
  { source: "Thực địa", stepRates: [58.2, 54.8, 74.1, 78.6, 81.2, 82.4] },
  { source: "Giới thiệu", stepRates: [62.4, 61.1, 79.2, 82.4, 84.1, 86] },
  { source: "Promoter", stepRates: [51.8, 52.4, 71.8, 74.2, 79.6, 80.1] },
];

export type CohortRow = {
  label: string;
  values: Array<number | null>;
};

export const cohortRows: CohortRow[] = [
  { label: "Tuần 24", values: [41, 24, 18, 14, 11, 9.2] },
  { label: "Tuần 25", values: [44, 26, 19, 15, 12, 9.8] },
  { label: "Tuần 26", values: [39, 22, 16, 12, 9.4, 7.1] },
  { label: "Tuần 27", values: [46, 28, 21, 16, 12.4, null] },
  { label: "Tuần 28", values: [43, 25, 18, 13, null, null] },
  { label: "Tuần 29", values: [38, 21, 15, null, null, null] },
];
