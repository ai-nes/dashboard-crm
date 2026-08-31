/**
 * UI-only presentation data for reviewing the proposed Acquisition Map layout.
 * Replace these datasets with the API contract after the visual direction is approved.
 */

export const platformLeadCostDemo = [
  { platform: "Meta", leads: 764, validLeads: 206, spend: 120, cpl: 582 },
  { platform: "Google", leads: 612, validLeads: 188, spend: 148, cpl: 787 },
  { platform: "TikTok", leads: 548, validLeads: 132, spend: 86, cpl: 652 },
  { platform: "Website", leads: 396, validLeads: 154, spend: 18, cpl: 117 },
  { platform: "Referral", leads: 284, validLeads: 121, spend: 0, cpl: 0 },
];

export const sameSeasonDemo = [
  { week: "T1", current: 312, previous: 284 },
  { week: "T2", current: 348, previous: 332 },
  { week: "T3", current: 382, previous: 366 },
  { week: "T4", current: 426, previous: 394 },
  { week: "T5", current: 468, previous: 420 },
  { week: "T6", current: 514, previous: 448 },
];

export const dailySpendLeadsDemo = [
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
];

export const touchpointPlatformDemo = {
  columns: ["Meta", "Google", "TikTok", "Website", "Referral"],
  rows: [
    { label: "Video", values: [96, 24, 88, 16, 4] },
    { label: "Search", values: [18, 124, 12, 82, 6] },
    { label: "Landing page", values: [64, 92, 48, 116, 14] },
    { label: "Event", values: [28, 16, 22, 34, 98] },
  ],
};

export const budgetByRoleDemo = [
  { label: "Tạo nhận biết", value: 28 },
  { label: "Bắt nhu cầu", value: 34 },
  { label: "Nuôi dưỡng", value: 22 },
  { label: "Chuyển đổi", value: 16 },
];

export const formFunnelDemo = [
  { label: "Impression", value: 18400, retention: 100 },
  { label: "Form open", value: 8420, retention: 45.8 },
  { label: "Form complete", value: 5180, retention: 61.5 },
  { label: "Valid lead", value: 2846, retention: 54.9 },
  { label: "Handoff", value: 2140, retention: 75.2 },
];

export const formCompletionDemo = [
  { label: "Tư vấn ngành", value: 72 },
  { label: "Nhận học bổng", value: 64 },
  { label: "Đăng ký campus", value: 58 },
  { label: "Tải đề án", value: 46 },
  { label: "Tư vấn học phí", value: 38 },
];

export const dropoffByFieldDemo = [
  { field: "Số điện thoại", dropoff: 8.2, cumulative: 8.2 },
  { field: "Trường THPT", dropoff: 6.8, cumulative: 15 },
  { field: "Ngành quan tâm", dropoff: 5.4, cumulative: 20.4 },
  { field: "Khối lớp", dropoff: 3.1, cumulative: 23.5 },
  { field: "Consent", dropoff: 2.4, cumulative: 25.9 },
];

export const captureModeDemo = [
  { label: "Embedded", validRate: 38, completeRate: 62 },
  { label: "Landing page", validRate: 46, completeRate: 55 },
];

export const qualityBySourceDemo = [
  { source: "Meta", valid: 32, enrichment: 24, invalid: 18, outOfScope: 14, duplicate: 12 },
  { source: "Google", valid: 45, enrichment: 18, invalid: 12, outOfScope: 11, duplicate: 14 },
  { source: "TikTok", valid: 26, enrichment: 30, invalid: 20, outOfScope: 14, duplicate: 10 },
  { source: "Referral", valid: 58, enrichment: 16, invalid: 8, outOfScope: 8, duplicate: 10 },
];

export const validRateTrendDemo = [
  { week: "T1", Meta: 28, Google: 42, TikTok: 22, Referral: 54 },
  { week: "T2", Meta: 31, Google: 44, TikTok: 25, Referral: 57 },
  { week: "T3", Meta: 29, Google: 46, TikTok: 24, Referral: 58 },
  { week: "T4", Meta: 34, Google: 48, TikTok: 28, Referral: 61 },
  { week: "T5", Meta: 36, Google: 47, TikTok: 30, Referral: 64 },
  { week: "T6", Meta: 32, Google: 45, TikTok: 26, Referral: 58 },
];

export const handoffCompletenessDemo = [
  { field: "Tên + số điện thoại", value: 96 },
  { field: "Trường THPT", value: 82 },
  { field: "Ngành quan tâm", value: 78 },
  { field: "Khối lớp", value: 62 },
  { field: "Consent timestamp", value: 54 },
];

export const identityMatchDemo = [
  { label: "Phone exact", value: 1420 },
  { label: "Email exact", value: 684 },
  { label: "Name + school", value: 382 },
  { label: "Confidence queue", value: 214 },
  { label: "Unmatched", value: 146 },
];

export const firstTouchDemo = [
  { source: "Referral", value: 284 },
  { source: "Website", value: 396 },
  { source: "TikTok", value: 548 },
  { source: "Google", value: 612 },
  { source: "Meta", value: 764 },
];

export const lastTouchDemo = [
  { source: "Referral", value: 216 },
  { source: "Website", value: 438 },
  { source: "TikTok", value: 504 },
  { source: "Google", value: 668 },
  { source: "Meta", value: 778 },
];

export const firstVsLastDemo = [
  { source: "Meta", first: 764, last: 778 },
  { source: "Google", first: 612, last: 668 },
  { source: "TikTok", first: 548, last: 504 },
  { source: "Website", first: 396, last: 438 },
  { source: "Referral", first: 284, last: 216 },
];

export const attributionFlowDemo = [
  { label: "Meta → Website", value: 148 },
  { label: "Google → Form", value: 126 },
  { label: "TikTok → Event", value: 94 },
  { label: "Referral → Handoff", value: 82 },
];

export const cohortEnrollmentDemo = [
  { cohort: "T1", values: [18, 24, 29, 34, 38] },
  { cohort: "T2", values: [16, 22, 27, 32, 36] },
  { cohort: "T3", values: [14, 20, 25, 30, 0] },
  { cohort: "T4", values: [13, 18, 23, 0, 0] },
  { cohort: "T5", values: [11, 16, 0, 0, 0] },
];

export const enrollmentLagDemo = [
  { range: "0–7", value: 18 },
  { range: "8–14", value: 34 },
  { range: "15–30", value: 48 },
  { range: "31–60", value: 32 },
  { range: "61–90", value: 21 },
  { range: "90+", value: 9 },
];

export const cumulativeConversionDemo = [
  { week: "T1", value: 2.1 },
  { week: "T2", value: 3.5 },
  { week: "T3", value: 4.6 },
  { week: "T4", value: 5.8 },
  { week: "T5", value: 7.1 },
  { week: "T6", value: 8.4 },
];

export const contactLatencyDemo = [
  { window: "08–10h", min: 4, q1: 12, median: 24, q3: 42, max: 78 },
  { window: "10–14h", min: 6, q1: 16, median: 31, q3: 54, max: 96 },
  { window: "14–18h", min: 3, q1: 10, median: 21, q3: 38, max: 72 },
  { window: "18–22h", min: 8, q1: 22, median: 44, q3: 68, max: 120 },
];

export const submissionTimingDemo = [
  [4, 8, 12, 18, 24, 18, 10, 6],
  [6, 14, 22, 32, 40, 28, 14, 8],
  [8, 18, 28, 44, 52, 38, 20, 12],
  [10, 22, 34, 48, 58, 44, 26, 14],
  [12, 28, 42, 64, 72, 56, 32, 18],
  [9, 20, 31, 46, 54, 42, 24, 13],
  [5, 12, 18, 26, 34, 22, 12, 7],
];

export const handoffSuccessDemo = [
  { source: "Referral", success: 82, contacted: 94 },
  { source: "Website", success: 74, contacted: 86 },
  { source: "Google", success: 68, contacted: 81 },
  { source: "Meta", success: 61, contacted: 76 },
  { source: "TikTok", success: 54, contacted: 71 },
];

export const costPerEnrolledDemo = [
  { source: "Referral", cost: 0, enrolled: 24 },
  { source: "Website", cost: 420, enrolled: 31 },
  { source: "TikTok", cost: 860, enrolled: 18 },
  { source: "Meta", cost: 1220, enrolled: 27 },
  { source: "Google", cost: 1480, enrolled: 23 },
];

export const heatmapScale = ["var(--background-soft-100)", "var(--primary-100)", "var(--primary-200)", "var(--brand-500)"];
