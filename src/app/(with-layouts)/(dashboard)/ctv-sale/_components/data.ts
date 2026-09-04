export type DashboardTone = "primary" | "info" | "warning" | "success";

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  note: string;
  trend?: string;
  tone: DashboardTone;
}

export interface PriorityTask {
  id: string;
  studentName: string;
  taskType: string;
  time: string;
  detail: string;
  tone: "primary" | "warning" | "info";
}

export const dashboardStats: DashboardStat[] = [
  {
    id: "assigned",
    label: "Được giao",
    value: 48,
    note: "hồ sơ đang phụ trách",
    trend: "+6 tuần này",
    tone: "primary",
  },
  {
    id: "uncontacted",
    label: "Chưa liên hệ",
    value: 5,
    note: "cần ưu tiên hôm nay",
    trend: "10% tổng hồ sơ",
    tone: "warning",
  },
  {
    id: "follow-up",
    label: "Cần follow-up",
    value: 14,
    note: "đang chờ chăm sóc lại",
    trend: "3 việc đến hạn",
    tone: "info",
  },
  {
    id: "transfer",
    label: "Chuyển Sale",
    value: 8,
    note: "sẵn sàng bàn giao",
    trend: "+2 so với tuần trước",
    tone: "success",
  },
];

export const priorityTasks: PriorityTask[] = [
  {
    id: "task-01",
    studentName: "Nguyễn Minh An",
    taskType: "Gọi lại",
    time: "10:30",
    detail: "Quan tâm ngành Công nghệ thông tin",
    tone: "primary",
  },
  {
    id: "task-02",
    studentName: "Trần Ngọc Mai",
    taskType: "Follow-up",
    time: "14:00",
    detail: "Đã nhận thông tin học phí",
    tone: "warning",
  },
  {
    id: "task-03",
    studentName: "Lê Hoàng Nam",
    taskType: "Nhắn tin",
    time: "16:30",
    detail: "Chờ xác nhận lịch tư vấn",
    tone: "info",
  },
];

export const studentStatusData = [
  { id: "new", label: "Mới nhận", value: 16, color: "var(--primary-300)" },
  { id: "consulting", label: "Đang tư vấn", value: 18, color: "var(--primary-500)" },
  { id: "connected", label: "Đã kết nối", value: 10, color: "var(--info-500)" },
  { id: "transferred", label: "Đã chuyển Sale", value: 4, color: "var(--success-500)" },
];

export interface ContactTrendPoint {
  day: string;
  contacts: number;
  connected: number;
}

export const contactTrendData: Record<"7d" | "30d", ContactTrendPoint[]> = {
  "7d": [
    { day: "T2", contacts: 8, connected: 5 },
    { day: "T3", contacts: 12, connected: 8 },
    { day: "T4", contacts: 9, connected: 6 },
    { day: "T5", contacts: 16, connected: 11 },
    { day: "T6", contacts: 13, connected: 9 },
    { day: "T7", contacts: 18, connected: 13 },
    { day: "CN", contacts: 11, connected: 8 },
  ],
  "30d": [
    { day: "Tuần 1", contacts: 48, connected: 31 },
    { day: "Tuần 2", contacts: 56, connected: 38 },
    { day: "Tuần 3", contacts: 63, connected: 42 },
    { day: "Tuần 4", contacts: 72, connected: 52 },
  ],
};

export const contactResults = [
  { id: "connected", label: "Đã kết nối", value: 32, color: "var(--primary-500)" },
  { id: "missed", label: "Không bắt máy", value: 18, color: "var(--primary-200)" },
  { id: "follow-up", label: "Follow-up", value: 16, color: "var(--info-500)" },
  { id: "qualified", label: "Có nhu cầu", value: 11, color: "var(--success-500)" },
];

export const taskSummary = [
  { id: "today", label: "Hôm nay", value: 6, note: "việc cần làm", tone: "primary" as const },
  { id: "overdue", label: "Quá hạn", value: 2, note: "cần xử lý ngay", tone: "warning" as const },
  { id: "upcoming", label: "Sắp tới", value: 4, note: "trong 7 ngày", tone: "info" as const },
];
