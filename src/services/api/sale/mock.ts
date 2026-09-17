import type { SaleOverviewResponse } from "./types";

const MOCK_12WEEK_STARTS = [
  "2026-06-29",
  "2026-07-06",
  "2026-07-13",
  "2026-07-20",
  "2026-07-27",
  "2026-08-03",
  "2026-08-10",
  "2026-08-17",
  "2026-08-24",
  "2026-08-31",
  "2026-09-07",
  "2026-09-14",
];

const MOCK_12WEEK_ENDS = [
  "2026-07-05",
  "2026-07-12",
  "2026-07-19",
  "2026-07-26",
  "2026-08-02",
  "2026-08-09",
  "2026-08-16",
  "2026-08-23",
  "2026-08-30",
  "2026-09-06",
  "2026-09-13",
  "2026-09-17",
];

export const MOCK_SALE_OVERVIEW: SaleOverviewResponse = {
  meta: {
    viewer: { id: "USR-SALE-001", displayName: "Nguyễn Văn A" },
    admissionYear: 2026,
    date: "2026-09-17",
    asOf: "2026-09-17T09:15:00+07:00",
    timezone: "Asia/Ho_Chi_Minh",
    status: "available",
    warnings: [],
  },
  kpis: [
    { id: "assigned", value: 128 },
    { id: "consulting", value: 42 },
    { id: "qualified", value: 26 },
    { id: "documents", value: 18 },
    { id: "admission", value: 9 },
  ],
  tasks: {
    priority: {
      overdueCount: 3,
      items: [
        {
          id: "TASK-2026-0001",
          studentId: "STU-2026-00042",
          studentName: "Nguyễn Minh An",
          title: "Tư vấn học phí và học bổng",
          type: "call",
          startAt: "2026-09-17T15:30:00+07:00",
          dueAt: "2026-09-17T16:00:00+07:00",
          context: "Đã yêu cầu tư vấn chi tiết",
          priority: "High",
          status: "Todo",
          isOverdue: false,
        },
        {
          id: "TASK-2026-0002",
          studentId: "STU-2026-00031",
          studentName: "Trần Gia Hân",
          title: "Nhắc bổ sung hồ sơ",
          type: "document",
          startAt: null,
          dueAt: "2026-09-17T11:00:00+07:00",
          context: "Còn thiếu bảng điểm và ảnh giấy tờ",
          priority: "High",
          status: "Todo",
          isOverdue: true,
        },
        {
          id: "TASK-2026-0003",
          studentId: "STU-2026-00018",
          studentName: "Lê Hoàng Nam",
          title: "Xác nhận lịch nhập học",
          type: "message",
          startAt: null,
          dueAt: "2026-09-17T17:30:00+07:00",
          context: "Đã hoàn tất hồ sơ, chờ xác nhận cuối",
          priority: "Medium",
          status: "Todo",
          isOverdue: false,
        },
        {
          id: "TASK-2026-0004",
          studentId: "STU-2026-00007",
          studentName: "Phạm Khánh Linh",
          title: "Gọi lại sau buổi tư vấn",
          type: "call",
          startAt: null,
          dueAt: "2026-09-16T17:00:00+07:00",
          context: "Chưa phản hồi sau khi nhận lộ trình",
          priority: "Medium",
          status: "Todo",
          isOverdue: true,
        },
      ],
    },
    summary: {
      today: { total: 10, pending: 7, completed: 3 },
      overdue: { count: 3 },
      upcoming: { count: 6, horizonDays: 7 },
    },
  },
  pipeline: {
    stages: [
      { id: "assigned", label: "Đang phụ trách", count: 128 },
      { id: "contacted", label: "Đã liên hệ", count: 96 },
      { id: "consulted", label: "Đã tư vấn", count: 64 },
      { id: "interested", label: "Có nhu cầu", count: 38 },
      { id: "documents", label: "Đang làm hồ sơ", count: 18 },
      { id: "confirmed", label: "Đã xác nhận", count: 12 },
      { id: "admitted", label: "Nhập học", count: 9 },
    ],
  },
  attention: {
    items: [
      { id: "at-risk", count: 5 },
      { id: "high-intent", count: 8 },
      { id: "blocked", count: 4 },
    ],
  },
  conversionTrend: {
    defaultRange: "4w",
    ranges: {
      "4w": {
        from: "2026-08-24",
        to: "2026-09-17",
        points: [
          { label: "24/08", periodStart: "2026-08-24", periodEnd: "2026-08-30", consulted: 18, admitted: 2 },
          { label: "31/08", periodStart: "2026-08-31", periodEnd: "2026-09-06", consulted: 24, admitted: 3 },
          { label: "07/09", periodStart: "2026-09-07", periodEnd: "2026-09-13", consulted: 21, admitted: 2 },
          { label: "14/09", periodStart: "2026-09-14", periodEnd: "2026-09-17", consulted: 16, admitted: 2 },
        ],
      },
      "12w": {
        from: "2026-06-29",
        to: "2026-09-17",
        points: Array.from({ length: 12 }, (_, index) => ({
          label: `T${index + 1}`,
          periodStart: MOCK_12WEEK_STARTS[index],
          periodEnd: MOCK_12WEEK_ENDS[index],
          consulted: 12 + (index % 4) * 4,
          admitted: 1 + (index % 3),
        })),
      },
    },
  },
  studentStatus: {
    total: 128,
    items: [
      { id: "new", label: "Mới phân công", count: 24, share: 18.8 },
      { id: "consulting", label: "Đang tư vấn", count: 42, share: 32.8 },
      { id: "waiting", label: "Chờ phản hồi", count: 35, share: 27.3 },
      { id: "documents", label: "Đang làm hồ sơ", count: 18, share: 14.1 },
      { id: "admission", label: "Chờ nhập học", count: 9, share: 7 },
    ],
  },
  operations: {
    total: 5,
    items: [
      { id: "overdue-tasks", count: 3 },
      { id: "missing-documents", count: 2 },
    ],
  },
  performance: {
    target: 20,
    enrollment: 13,
    achievement: 65,
    remaining: 7,
    expectedEnrollment: 9,
    pipelineCoverage: 1.29,
    openOpportunities: 18,
    newOpportunities: 5,
  },
  health: {
    followUpDue: 6,
    overdue: 3,
    slaBreach: 2,
    noActivity: 4,
    agingBuckets: [
      { id: "0-2d", label: "0–2 ngày", count: 8 },
      { id: "3-5d", label: "3–5 ngày", count: 4 },
      { id: "6-10d", label: "6–10 ngày", count: 2 },
      { id: "10d-plus", label: "Trên 10 ngày", count: 1 },
    ],
  },
};

export async function getSaleOverviewMock(): Promise<SaleOverviewResponse> {
  return MOCK_SALE_OVERVIEW;
}
