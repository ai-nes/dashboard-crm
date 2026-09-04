export type LeadSaleTone = "primary" | "sky" | "warning" | "error" | "success" | "violet";

export interface LeadSaleStat {
  id: string;
  label: string;
  value: number;
  note: string;
  tone: LeadSaleTone;
}

export const leadSaleStats: LeadSaleStat[] = [
  {
    id: "active",
    label: "Đang phụ trách",
    value: 184,
    note: "học sinh đang theo dõi",
    tone: "primary",
  },
  {
    id: "new",
    label: "Mới nhận",
    value: 24,
    note: "trong hôm nay",
    tone: "sky",
  },
  {
    id: "unassigned",
    label: "Chưa phân công",
    value: 18,
    note: "cần điều phối",
    tone: "violet",
  },
  {
    id: "needs-action",
    label: "Cần xử lý",
    value: 27,
    note: "đang chờ hành động",
    tone: "warning",
  },
  {
    id: "overdue",
    label: "Quá hạn",
    value: 6,
    note: "cần hỗ trợ ngay",
    tone: "error",
  },
  {
    id: "documents",
    label: "Hồ sơ chờ",
    value: 14,
    note: "thiếu giấy tờ hoặc xác nhận",
    tone: "success",
  },
];

export interface InterventionItem {
  id: string;
  label: string;
  value: number;
  note: string;
  action: string;
  href: string;
  tone: "violet" | "warning" | "error" | "sky";
}

export const interventionItems: InterventionItem[] = [
  {
    id: "unassigned",
    label: "Chưa phân công",
    value: 18,
    note: "Hồ sơ mới chưa có người phụ trách",
    action: "Điều phối",
    href: "/lead-sale/student-assignment",
    tone: "violet",
  },
  {
    id: "not-contacted",
    label: "Chưa liên hệ sau 24 giờ",
    value: 12,
    note: "Chưa ghi nhận lần liên hệ gần nhất",
    action: "Xem",
    href: "/lead-sale/students",
    tone: "warning",
  },
  {
    id: "at-risk",
    label: "Có nguy cơ mất liên hệ",
    value: 8,
    note: "Không phản hồi hoặc giảm tương tác",
    action: "Xem",
    href: "/lead-sale/students",
    tone: "error",
  },
  {
    id: "blocked",
    label: "Hồ sơ đang bị kẹt",
    value: 5,
    note: "Thiếu giấy tờ hoặc chờ xử lý",
    action: "Xử lý",
    href: "/lead-sale/tasks",
    tone: "sky",
  },
];

export interface TeamPerformance {
  id: string;
  name: string;
  initials: string;
  activeStudents: number;
  consulted: number;
  admitted: number;
  status: "Tốt" | "Cần hỗ trợ";
}

export const teamPerformance: TeamPerformance[] = [
  {
    id: "sales-01",
    name: "Nguyễn Minh Anh",
    initials: "MA",
    activeStudents: 46,
    consulted: 31,
    admitted: 8,
    status: "Tốt",
  },
  {
    id: "sales-02",
    name: "Trần Ngọc Mai",
    initials: "NM",
    activeStudents: 39,
    consulted: 26,
    admitted: 6,
    status: "Tốt",
  },
  {
    id: "sales-03",
    name: "Lê Hoàng Nam",
    initials: "HN",
    activeStudents: 35,
    consulted: 21,
    admitted: 4,
    status: "Cần hỗ trợ",
  },
  {
    id: "sales-04",
    name: "Phạm Gia Hân",
    initials: "GH",
    activeStudents: 31,
    consulted: 19,
    admitted: 3,
    status: "Cần hỗ trợ",
  },
];

export const studentStatusData = [
  { id: "consulting", label: "Đang tư vấn", value: 72, color: "var(--primary-500)" },
  { id: "waiting", label: "Chờ phản hồi", value: 48, color: "var(--info-500)" },
  { id: "documents", label: "Đang làm hồ sơ", value: 29, color: "var(--warning-500)" },
  { id: "admission", label: "Chờ nhập học", value: 17, color: "var(--success-500)" },
  { id: "new", label: "Mới nhận", value: 18, color: "var(--primary-200)" },
];

export interface ResultTrendPoint {
  period: string;
  consulted: number;
  admitted: number;
}

export const resultTrendData: Record<"4w" | "3m", ResultTrendPoint[]> = {
  "4w": [
    { period: "Tuần 1", consulted: 68, admitted: 9 },
    { period: "Tuần 2", consulted: 76, admitted: 12 },
    { period: "Tuần 3", consulted: 83, admitted: 14 },
    { period: "Tuần 4", consulted: 96, admitted: 18 },
  ],
  "3m": [
    { period: "Tháng 1", consulted: 214, admitted: 42 },
    { period: "Tháng 2", consulted: 246, admitted: 51 },
    { period: "Tháng 3", consulted: 298, admitted: 63 },
  ],
};
