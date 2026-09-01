import type { AcquisitionMapData } from "./types";

export const acquisitionMapData: AcquisitionMapData = {
  attributionModel: {
    firstTouch: "first-touch",
    lastTouch: "last-touch",
  },
  platformLeadCost: [
    { platform: "Meta", leads: 764, validLeads: 206, spend: 120, cpl: 582 },
    { platform: "Google", leads: 612, validLeads: 188, spend: 148, cpl: 787 },
    { platform: "TikTok", leads: 548, validLeads: 132, spend: 86, cpl: 652 },
    { platform: "Website", leads: 396, validLeads: 154, spend: 18, cpl: 117 },
    { platform: "Giới thiệu", leads: 284, validLeads: 121, spend: 0, cpl: null },
  ],
  leadTrendComparison: [
    { week: "Tuần 1", current: 312, previous: 284 },
    { week: "Tuần 2", current: 348, previous: 332 },
    { week: "Tuần 3", current: 382, previous: 366 },
    { week: "Tuần 4", current: 426, previous: 394 },
    { week: "Tuần 5", current: 468, previous: 420 },
    { week: "Tuần 6", current: 514, previous: 448 },
  ],
  dailySpendLeads: [
    { day: "01", spend: 8, leads: 44 },
    { day: "02", spend: 12, leads: 58 },
    { day: "03", spend: 10, leads: 52 },
    { day: "04", spend: 14, leads: 69 },
    { day: "05", spend: 18, leads: 82 },
    { day: "06", spend: 13, leads: 61 },
    { day: "07", spend: 16, leads: 75 },
    { day: "08", spend: 11, leads: 54 },
    { day: "09", spend: 20, leads: 96 },
    { day: "10", spend: 17, leads: 78 },
    { day: "11", spend: 22, leads: 108 },
    { day: "12", spend: 18, leads: 84 },
  ],
  touchpointPlatformMatrix: {
    columns: ["Meta", "Google", "TikTok", "Website", "Giới thiệu"],
    rows: [
      { label: "Video", values: [96, 24, 88, 16, 4] },
      { label: "Tìm kiếm", values: [18, 124, 12, 82, 6] },
      { label: "Trang đích", values: [64, 92, 48, 116, 14] },
      { label: "Sự kiện", values: [28, 16, 22, 34, 98] },
    ],
  },
  budgetByPlatformRole: [
    { label: "Tạo nhận biết", value: 28 },
    { label: "Bắt nhu cầu chủ động", value: 34 },
    { label: "Nuôi dưỡng", value: 22 },
    { label: "Chuyển đổi", value: 16 },
  ],
  formFunnel: [
    { label: "Hiển thị", value: 18400, retention: 100 },
    { label: "Mở biểu mẫu", value: 8420, retention: 45.8 },
    { label: "Hoàn tất biểu mẫu", value: 5180, retention: 61.5 },
    { label: "Lead hợp lệ", value: 2846, retention: 54.9 },
    { label: "Bàn giao tư vấn", value: 2140, retention: 75.2 },
  ],
  formCompletion: [
    { id: "major-consultation", label: "Tư vấn ngành", value: 72, denominator: 1240 },
    { id: "scholarship", label: "Nhận học bổng", value: 64, denominator: 860 },
    { id: "campus-tour", label: "Đăng ký tham quan trường", value: 58, denominator: 720 },
    { id: "admission-plan", label: "Tải đề án tuyển sinh", value: 46, denominator: 1120 },
    { id: "tuition-consultation", label: "Tư vấn học phí", value: 38, denominator: 980 },
  ],
  formDropoffByField: [
    { field: "Số điện thoại", dropoff: 8.2, cumulative: 8.2 },
    { field: "Trường trung học phổ thông", dropoff: 6.8, cumulative: 15 },
    { field: "Ngành quan tâm", dropoff: 5.4, cumulative: 20.4 },
    { field: "Khối lớp", dropoff: 3.1, cumulative: 23.5 },
    { field: "Đồng ý xử lý dữ liệu cá nhân", dropoff: 2.4, cumulative: 25.9 },
  ],
  captureModeComparison: [
    { label: "Biểu mẫu nhúng", validRate: 38, completeRate: 62 },
    { label: "Trang đích", validRate: 46, completeRate: 55 },
  ],
  leadQualityBySource: [
    { source: "Meta", valid: 36, enrichment: 27, invalid: 20, outOfScope: 17, duplicate: 12 },
    { source: "Google", valid: 52, enrichment: 21, invalid: 14, outOfScope: 13, duplicate: 14 },
    { source: "TikTok", valid: 29, enrichment: 33, invalid: 22, outOfScope: 16, duplicate: 10 },
    { source: "Giới thiệu", valid: 64, enrichment: 18, invalid: 9, outOfScope: 9, duplicate: 10 },
  ],
  validLeadRateTrend: [
    { week: "Tuần 1", values: { Meta: 28, Google: 42, TikTok: 22, "Giới thiệu": 54 } },
    { week: "Tuần 2", values: { Meta: 31, Google: 44, TikTok: 25, "Giới thiệu": 57 } },
    { week: "Tuần 3", values: { Meta: 29, Google: 46, TikTok: 24, "Giới thiệu": 58 } },
    { week: "Tuần 4", values: { Meta: 34, Google: 48, TikTok: 28, "Giới thiệu": 61 } },
    { week: "Tuần 5", values: { Meta: 36, Google: 47, TikTok: 30, "Giới thiệu": 64 } },
    { week: "Tuần 6", values: { Meta: 32, Google: 45, TikTok: 26, "Giới thiệu": 58 } },
  ],
  handoffDataCompleteness: [
    { field: "Họ tên và số điện thoại", value: 96 },
    { field: "Trường trung học phổ thông", value: 82 },
    { field: "Ngành quan tâm", value: 78 },
    { field: "Khối lớp", value: 62 },
    { field: "Thời điểm đồng ý xử lý dữ liệu", value: 54 },
  ],
  identityMatchBreakdown: [
    { label: "Số điện thoại · khớp chắc chắn", value: 1420 },
    { label: "Thư điện tử · khớp chắc chắn", value: 684 },
    { label: "Định danh nền tảng", value: 382 },
    { label: "Khớp xác suất · chờ xác nhận", value: 214 },
    { label: "Không khớp", value: 146 },
  ],
  firstTouchBySource: [
    { source: "Giới thiệu", value: 284 },
    { source: "Website", value: 396 },
    { source: "TikTok", value: 548 },
    { source: "Google", value: 612 },
    { source: "Meta", value: 764 },
  ],
  lastTouchBySource: [
    { source: "Giới thiệu", value: 216 },
    { source: "Website", value: 438 },
    { source: "TikTok", value: 504 },
    { source: "Google", value: 668 },
    { source: "Meta", value: 778 },
  ],
  firstVsLastSource: [
    { source: "Meta", first: 764, last: 778 },
    { source: "Google", first: 612, last: 668 },
    { source: "TikTok", first: 548, last: 504 },
    { source: "Website", first: 396, last: 438 },
    { source: "Giới thiệu", first: 284, last: 216 },
  ],
  attributionFlow: [
    { label: "Meta → Website", value: 148 },
    { label: "Google → Form", value: 126 },
    { label: "TikTok → Sự kiện", value: 94 },
    { label: "Giới thiệu → Bàn giao tư vấn", value: 82 },
  ],
  cohortEnrollmentMatrix: [
    { cohort: "Tháng 1", values: [18, 24, 29, 34, 38] },
    { cohort: "Tháng 2", values: [16, 22, 27, 32, 36] },
    { cohort: "Tháng 3", values: [14, 20, 25, 30, null] },
    { cohort: "Tháng 4", values: [13, 18, 23, null, null] },
    { cohort: "Tháng 5", values: [11, 16, null, null, null] },
  ],
  enrollmentLagHistogram: {
    medianDays: 24,
    buckets: [
      { range: "0–7 ngày", value: 18 },
      { range: "8–14 ngày", value: 34 },
      { range: "15–30 ngày", value: 48 },
      { range: "31–60 ngày", value: 32 },
      { range: "61–90 ngày", value: 21 },
      { range: "Trên 90 ngày", value: 9 },
    ],
  },
  cumulativeConversion: [
    { week: "Tuần 1", value: 2.1 },
    { week: "Tuần 2", value: 3.5 },
    { week: "Tuần 3", value: 4.6 },
    { week: "Tuần 4", value: 5.8 },
    { week: "Tuần 5", value: 7.1 },
    { week: "Tuần 6", value: 8.4 },
  ],
  firstContactLatency: [
    { window: "08–10h", min: 4, q1: 12, median: 24, q3: 42, max: 78 },
    { window: "10–14h", min: 6, q1: 16, median: 31, q3: 54, max: 96 },
    { window: "14–18h", min: 3, q1: 10, median: 21, q3: 38, max: 72 },
    { window: "18–22h", min: 8, q1: 22, median: 44, q3: 68, max: 120 },
  ],
  submissionTiming: {
    weekdays: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
    hours: ["08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"],
    timezone: "Asia/Ho_Chi_Minh",
    values: [
      [4, 8, 12, 18, 24, 18, 10, 6],
      [6, 14, 22, 32, 40, 28, 14, 8],
      [8, 18, 28, 44, 52, 38, 20, 12],
      [10, 22, 34, 48, 58, 44, 26, 14],
      [12, 28, 42, 64, 72, 56, 32, 18],
      [9, 20, 31, 46, 54, 42, 24, 13],
      [5, 12, 18, 26, 34, 22, 12, 7],
    ],
  },
  handoffSuccessBySource: [
    { source: "Giới thiệu", success: 82, contacted: 94 },
    { source: "Website", success: 74, contacted: 86 },
    { source: "Google", success: 68, contacted: 81 },
    { source: "Meta", success: 61, contacted: 76 },
    { source: "TikTok", success: 54, contacted: 71 },
  ],
  costPerEnrolledBySource: [
    { source: "Giới thiệu", cost: 0, enrolled: 24 },
    { source: "Website", cost: 420, enrolled: 31 },
    { source: "TikTok", cost: 860, enrolled: 18 },
    { source: "Meta", cost: 1220, enrolled: 27 },
    { source: "Google", cost: 1480, enrolled: 23 },
  ],
};

export const heatmapScale = [
  "var(--background-soft-100)",
  "var(--primary-100)",
  "var(--primary-200)",
  "var(--brand-500)",
];

export const platformLeadCost = acquisitionMapData.platformLeadCost;
export const leadTrendComparison = acquisitionMapData.leadTrendComparison;
export const dailySpendLeads = acquisitionMapData.dailySpendLeads;
export const touchpointPlatformMatrix = acquisitionMapData.touchpointPlatformMatrix;
export const budgetByPlatformRole = acquisitionMapData.budgetByPlatformRole;
export const formFunnel = acquisitionMapData.formFunnel;
export const formCompletion = acquisitionMapData.formCompletion;
export const formDropoffByField = acquisitionMapData.formDropoffByField;
export const captureModeComparison = acquisitionMapData.captureModeComparison;
export const leadQualityBySource = acquisitionMapData.leadQualityBySource;
export const validLeadRateTrend = acquisitionMapData.validLeadRateTrend;
export const handoffDataCompleteness = acquisitionMapData.handoffDataCompleteness;
export const identityMatchBreakdown = acquisitionMapData.identityMatchBreakdown;
export const firstTouchBySource = acquisitionMapData.firstTouchBySource;
export const lastTouchBySource = acquisitionMapData.lastTouchBySource;
export const firstVsLastSource = acquisitionMapData.firstVsLastSource;
export const attributionFlow = acquisitionMapData.attributionFlow;
export const cohortEnrollmentMatrix = acquisitionMapData.cohortEnrollmentMatrix;
export const enrollmentLagHistogram = acquisitionMapData.enrollmentLagHistogram;
export const cumulativeConversion = acquisitionMapData.cumulativeConversion;
export const firstContactLatency = acquisitionMapData.firstContactLatency;
export const submissionTiming = acquisitionMapData.submissionTiming;
export const handoffSuccessBySource = acquisitionMapData.handoffSuccessBySource;
export const costPerEnrolledBySource = acquisitionMapData.costPerEnrolledBySource;
