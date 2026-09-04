export type SaleDashboardTone = "primary" | "sky" | "warning" | "violet" | "success";

export interface SaleStat {
  id: string;
  label: string;
  value: number;
  note: string;
  tone: SaleDashboardTone;
}

export const saleStats: SaleStat[] = [
  {
    id: "assigned",
    label: "Đang phụ trách",
    value: 128,
    note: "học sinh trong luồng tuyển sinh",
    tone: "primary",
  },
  {
    id: "consulting",
    label: "Đang tư vấn",
    value: 42,
    note: "đang được chăm sóc",
    tone: "sky",
  },
  {
    id: "qualified",
    label: "Có nhu cầu",
    value: 26,
    note: "đã xác định nhu cầu",
    tone: "violet",
  },
  {
    id: "documents",
    label: "Đang làm hồ sơ",
    value: 18,
    note: "đang hoàn thiện giấy tờ",
    tone: "warning",
  },
  {
    id: "admission",
    label: "Chờ nhập học",
    value: 9,
    note: "sẵn sàng chuyển bước",
    tone: "success",
  },
];

export interface SaleTask {
  id: string;
  studentName: string;
  title: string;
  schedule: string;
  context: string;
  tone: "primary" | "warning" | "sky";
  isOverdue?: boolean;
}

export const priorityTasks: SaleTask[] = [
  {
    id: "task-01",
    studentName: "Nguyễn Minh An",
    title: "Tư vấn học phí + học bổng",
    schedule: "16:00–18:00",
    context: "Đã để lại yêu cầu tư vấn chi tiết",
    tone: "primary",
  },
  {
    id: "task-02",
    studentName: "Trần Ngọc Mai",
    title: "Nhắc bổ sung học bạ",
    schedule: "Hạn hôm nay",
    context: "Hồ sơ còn thiếu 1 giấy tờ bắt buộc",
    tone: "warning",
  },
  {
    id: "task-03",
    studentName: "Lê Hoàng Nam",
    title: "Xác nhận lịch nhập học",
    schedule: "17:30",
    context: "Đã đủ điều kiện, chờ xác nhận từ gia đình",
    tone: "sky",
  },
  {
    id: "task-04",
    studentName: "Phạm Gia Hân",
    title: "Gọi lại sau buổi tư vấn",
    schedule: "Hạn hôm nay",
    context: "Cần chốt ngành học quan tâm",
    tone: "primary",
  },
];

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color: string;
}

export const funnelStages: FunnelStage[] = [
  { id: "assigned", label: "Đang phụ trách", value: 128, color: "var(--primary-300)" },
  { id: "contacted", label: "Đã liên hệ", value: 96, color: "var(--primary-400)" },
  { id: "consulted", label: "Đã tư vấn", value: 64, color: "var(--primary-500)" },
  { id: "interested", label: "Có nhu cầu", value: 38, color: "var(--info-500)" },
  { id: "documents", label: "Đang làm hồ sơ", value: 18, color: "var(--info-500)" },
  { id: "confirmed", label: "Đã xác nhận", value: 12, color: "var(--success-500)" },
  { id: "admitted", label: "Nhập học", value: 9, color: "var(--success-500)" },
];

export interface AttentionItem {
  id: string;
  label: string;
  value: number;
  note: string;
  tone: "error" | "success" | "warning";
}

export const attentionItems: AttentionItem[] = [
  {
    id: "at-risk",
    label: "Có nguy cơ mất liên hệ",
    value: 5,
    note: "Chưa phản hồi sau nhiều lần liên hệ",
    tone: "error",
  },
  {
    id: "high-intent",
    label: "Khả năng chuyển đổi cao",
    value: 8,
    note: "Đã có nhu cầu, cần chốt bước tiếp theo",
    tone: "success",
  },
  {
    id: "blocked",
    label: "Hồ sơ đang bị kẹt",
    value: 4,
    note: "Thiếu giấy tờ hoặc chưa có lịch xử lý",
    tone: "warning",
  },
];

export interface ConversionTrendPoint {
  period: string;
  consulted: number;
  admitted: number;
}

export const conversionTrendData: Record<"4w" | "12w", ConversionTrendPoint[]> = {
  "4w": [
    { period: "Tuần 1", consulted: 22, admitted: 3 },
    { period: "Tuần 2", consulted: 28, admitted: 5 },
    { period: "Tuần 3", consulted: 25, admitted: 4 },
    { period: "Tuần 4", consulted: 36, admitted: 7 },
  ],
  "12w": [
    { period: "T1", consulted: 18, admitted: 2 },
    { period: "T2", consulted: 21, admitted: 3 },
    { period: "T3", consulted: 20, admitted: 2 },
    { period: "T4", consulted: 24, admitted: 4 },
    { period: "T5", consulted: 23, admitted: 3 },
    { period: "T6", consulted: 29, admitted: 5 },
    { period: "T7", consulted: 27, admitted: 4 },
    { period: "T8", consulted: 31, admitted: 6 },
    { period: "T9", consulted: 26, admitted: 4 },
    { period: "T10", consulted: 34, admitted: 6 },
    { period: "T11", consulted: 32, admitted: 5 },
    { period: "T12", consulted: 36, admitted: 7 },
  ],
};

export const studentStatusData = [
  { id: "new", label: "Mới phân công", value: 24, color: "var(--primary-200)" },
  { id: "consulting", label: "Đang tư vấn", value: 42, color: "var(--primary-500)" },
  { id: "waiting", label: "Chờ phản hồi", value: 35, color: "var(--info-500)" },
  { id: "documents", label: "Đang làm hồ sơ", value: 18, color: "var(--warning-500)" },
  { id: "admission", label: "Chờ nhập học", value: 9, color: "var(--success-500)" },
];
