import type { SaleOverviewParams, SaleOverviewResponse, SaleTask } from "./types";

const taskPriorityOrder: Record<SaleTask["priority"], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function comparePriorityTasks(left: SaleTask, right: SaleTask): number {
  if (left.isOverdue !== right.isOverdue) return left.isOverdue ? -1 : 1;

  const leftDue = left.dueAt ? Date.parse(left.dueAt) : Number.POSITIVE_INFINITY;
  const rightDue = right.dueAt ? Date.parse(right.dueAt) : Number.POSITIVE_INFINITY;
  const dueDifference = leftDue - rightDue;
  if (left.isOverdue && Number.isFinite(dueDifference) && dueDifference !== 0) {
    return dueDifference;
  }

  const priorityDifference = taskPriorityOrder[left.priority] - taskPriorityOrder[right.priority];
  if (priorityDifference !== 0) return priorityDifference;
  return Number.isFinite(dueDifference) ? dueDifference : 0;
}

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
  "2026-09-18",
];

export const MOCK_SALE_OVERVIEW: SaleOverviewResponse = {
  meta: {
    viewer: { id: "USR-SALE-001", displayName: "Nguyễn Văn A" },
    admissionYear: 2026,
    date: "2026-09-18",
    asOf: "2026-09-18T09:15:00+07:00",
    timezone: "Asia/Ho_Chi_Minh",
    status: "available",
    warnings: [],
  },
  kpis: [
    { id: "assigned", value: 128 },
    { id: "consulting", value: 42 },
    { id: "qualified", value: 26 },
    { id: "documents", value: 18 },
    { id: "admission", value: 13 },
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
          dueAt: "2026-09-18T16:00:00+07:00",
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
          dueAt: "2026-09-18T08:30:00+07:00",
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
          dueAt: "2026-09-18T17:30:00+07:00",
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
          dueAt: "2026-09-17T17:00:00+07:00",
          context: "Chưa phản hồi sau khi nhận lộ trình",
          priority: "Medium",
          status: "Todo",
          isOverdue: true,
        },
        {
          id: "TASK-2026-0005",
          studentId: "STU-2026-00053",
          studentName: "Võ Minh Thư",
          title: "Xác nhận lịch tư vấn",
          type: "call",
          startAt: null,
          dueAt: "2026-09-17T09:00:00+07:00",
          context: "Đã đăng ký tư vấn nhưng chưa xác nhận thời gian",
          priority: "High",
          status: "Todo",
          isOverdue: true,
        },
        {
          id: "TASK-2026-0006",
          studentId: "STU-2026-00062",
          studentName: "Đỗ Huyền Trang",
          title: "Gửi lộ trình ngành học phù hợp",
          type: "message",
          startAt: null,
          dueAt: "2026-09-19T10:30:00+07:00",
          context: "Đã xác nhận ngành quan tâm, chờ nhận thông tin chi tiết",
          priority: "Medium",
          status: "In Progress",
          isOverdue: false,
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
      { id: "assigned", label: "Lead được giao", count: 128 },
      { id: "contacted", label: "Đã liên hệ", count: 96 },
      { id: "consulted", label: "Đã tư vấn", count: 64 },
      { id: "interested", label: "Đủ điều kiện", count: 38 },
      { id: "documents", label: "Làm hồ sơ", count: 18 },
      { id: "confirmed", label: "Đã xác nhận", count: 15 },
      { id: "admitted", label: "Nhập học", count: 13 },
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
        to: "2026-09-18",
        points: [
          { label: "24/08", periodStart: "2026-08-24", periodEnd: "2026-08-30", consulted: 18, admitted: 2 },
          { label: "31/08", periodStart: "2026-08-31", periodEnd: "2026-09-06", consulted: 24, admitted: 3 },
          { label: "07/09", periodStart: "2026-09-07", periodEnd: "2026-09-13", consulted: 21, admitted: 2 },
          { label: "14/09", periodStart: "2026-09-14", periodEnd: "2026-09-18", consulted: 16, admitted: 2 },
        ],
      },
      "12w": {
        from: "2026-06-29",
        to: "2026-09-18",
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
      { id: "waiting", label: "Chờ phản hồi", count: 31, share: 24.2 },
      { id: "documents", label: "Đang làm hồ sơ", count: 18, share: 14.1 },
      { id: "admission", label: "Chờ nhập học", count: 13, share: 10.1 },
    ],
  },
  studentStages: {
    total: 128,
    // Independent CRM-stage fixture; never derive these counts from legacy studentStatus buckets.
    items: [
      { stage: "New", count: 32, share: 25 },
      { stage: "Attempting", count: 40, share: 31.25 },
      { stage: "Connected", count: 28, share: 21.875 },
      { stage: "Qualified", count: 23, share: 17.96875 },
      { stage: "Disqualified", count: 5, share: 3.90625 },
    ],
  },
  studentActions: [
    {
      studentId: "STU-2026-00042",
      studentCode: "AI26-0042",
      studentName: "Nguyễn Minh An",
      studentStage: "Connected",
      lifecycleStatus: "MQL",
      stageAgeDays: 3,
      lastActivityAt: "2026-09-17T15:30:00+07:00",
      attentionReason: "Đang cân nhắc học phí sau buổi tư vấn.",
      nba: {
        actionCode: "CALL_PARENT",
        title: "Gọi trao đổi học phí và học bổng",
        priority: "high",
        channel: "CALL",
        reason: "Học sinh đã yêu cầu tư vấn chi tiết về chi phí.",
        whyNow: "Đang cân nhắc lựa chọn; phản hồi sớm giúp giữ nhịp trao đổi.",
        salesNextStep: "Làm rõ ngân sách và gửi phương án học bổng phù hợp.",
        scheduledAt: "2026-09-18T10:00:00+07:00",
      },
    },
    {
      studentId: "STU-2026-00031",
      studentCode: "AI26-0031",
      studentName: "Trần Gia Hân",
      studentStage: "Qualified",
      lifecycleStatus: "Applicant",
      stageAgeDays: 6,
      lastActivityAt: "2026-09-15T11:20:00+07:00",
      attentionReason: "Hồ sơ còn thiếu bảng điểm và giấy tờ cá nhân.",
      nba: {
        actionCode: "REQUEST_DOCUMENTS",
        title: "Nhắc bổ sung giấy tờ còn thiếu",
        priority: "high",
        channel: "ZALO",
        reason: "Hồ sơ chưa đủ điều kiện chuyển sang bước xét tuyển.",
        whyNow: "Đã chờ 6 ngày ở giai đoạn đủ điều kiện.",
        salesNextStep: "Gửi danh sách giấy tờ còn thiếu và xác nhận thời hạn bổ sung.",
        scheduledAt: "2026-09-18T11:00:00+07:00",
      },
    },
    {
      studentId: "STU-2026-00007",
      studentCode: "AI26-0007",
      studentName: "Phạm Khánh Linh",
      studentStage: "Attempting",
      lifecycleStatus: "Lead",
      stageAgeDays: 8,
      lastActivityAt: "2026-09-11T16:45:00+07:00",
      attentionReason: "Chưa phản hồi sau lần liên hệ gần nhất.",
      nba: {
        actionCode: "SEND_REENGAGEMENT_MESSAGE",
        title: "Gửi tin nhắn hỏi thăm nhu cầu",
        priority: "medium",
        channel: "ZALO",
        reason: "Chưa kết nối được sau lần liên hệ trước.",
        whyNow: "Đã 7 ngày chưa có hoạt động mới.",
        salesNextStep: "Hỏi thời gian thuận tiện để gọi tư vấn ngắn.",
        scheduledAt: "2026-09-18T13:30:00+07:00",
      },
    },
    {
      studentId: "STU-2026-00053",
      studentCode: "AI26-0053",
      studentName: "Võ Minh Thư",
      studentStage: "New",
      lifecycleStatus: "Lead",
      stageAgeDays: 2,
      lastActivityAt: "2026-09-17T09:10:00+07:00",
      attentionReason: "Mới đăng ký tư vấn, chưa xác nhận lịch.",
      nba: {
        actionCode: "CALL_PARENT",
        title: "Xác nhận lịch tư vấn đầu tiên",
        priority: "high",
        channel: "CALL",
        reason: "Học sinh đã chủ động đăng ký nhận tư vấn.",
        whyNow: "Liên hệ sớm giúp chốt lịch khi nhu cầu còn mới.",
        salesNextStep: "Xác nhận khung giờ và ngành học đang quan tâm.",
        scheduledAt: "2026-09-18T14:00:00+07:00",
      },
    },
    {
      studentId: "STU-2026-00062",
      studentCode: "AI26-0062",
      studentName: "Đỗ Huyền Trang",
      studentStage: "Connected",
      lifecycleStatus: "MQL",
      stageAgeDays: 4,
      lastActivityAt: "2026-09-16T14:05:00+07:00",
      attentionReason: "Đã xác nhận ngành quan tâm, đang chờ lộ trình phù hợp.",
      nba: {
        actionCode: "SEND_INFORMATION",
        title: "Gửi lộ trình ngành học phù hợp",
        priority: "medium",
        channel: "ZALO",
        reason: "Học sinh đã nêu rõ ngành học đang cân nhắc.",
        whyNow: "Thông tin phù hợp là bước tiếp theo sau khi xác nhận nhu cầu.",
        salesNextStep: "Gửi chương trình học và mời trao đổi các lựa chọn đầu vào.",
        scheduledAt: "2026-09-19T10:30:00+07:00",
      },
    },
    {
      studentId: "STU-2026-00074",
      studentCode: "AI26-0074",
      studentName: "Bùi Đức Phúc",
      studentStage: "Qualified",
      lifecycleStatus: "Applicant",
      stageAgeDays: 2,
      lastActivityAt: "2026-09-18T08:40:00+07:00",
      attentionReason: "Vừa hoàn tất trao đổi điều kiện đầu vào.",
      nba: {
        actionCode: "INVITE_EVENT",
        title: "Mời tham dự buổi tư vấn chuyên sâu",
        priority: "low",
        channel: "MESSAGE",
        reason: "Nhu cầu và điều kiện đầu vào đã được xác nhận.",
        whyNow: "Có thể chuyển sang trao đổi lộ trình hồ sơ cụ thể.",
        salesNextStep: "Gửi lịch tư vấn và thống nhất bước chuẩn bị hồ sơ.",
        scheduledAt: "2026-09-20T09:00:00+07:00",
      },
    },
  ],
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
    lostOpportunities: 15,
    achievement: 65,
    remaining: 7,
    expectedEnrollment: 9,
    pipelineCoverage: 1.29,
    openOpportunities: 18,
    newOpportunities: 5,
  },
  health: {
    followUpDue: 7,
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

export async function getSaleOverviewMock(
  params: Pick<SaleOverviewParams, "priorityLimit"> = {},
): Promise<SaleOverviewResponse> {
  const limit = Math.max(0, Math.floor(params.priorityLimit ?? 6));
  const priorityItems = [...MOCK_SALE_OVERVIEW.tasks.priority.items]
    .sort(comparePriorityTasks)
    .slice(0, limit);

  return {
    ...MOCK_SALE_OVERVIEW,
    tasks: {
      ...MOCK_SALE_OVERVIEW.tasks,
      priority: {
        ...MOCK_SALE_OVERVIEW.tasks.priority,
        items: priorityItems,
      },
    },
  };
}
