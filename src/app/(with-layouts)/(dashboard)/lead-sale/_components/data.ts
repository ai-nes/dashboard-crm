import type {
  LeadSaleIntervention,
  LeadSaleKpi,
  LeadSaleStudentStatusItem,
  LeadSaleTeamMember,
  LeadSaleTrendPoint,
} from "@/services/api/lead-sale";

export type LeadSaleTone =
  | "primary"
  | "sky"
  | "warning"
  | "error"
  | "success"
  | "violet";

export interface LeadSaleStat {
  id: string;
  label: string;
  value: number;
  note: string;
  tone: LeadSaleTone;
}

const statPresentation: Record<
  LeadSaleKpi["id"],
  Omit<LeadSaleStat, "id" | "value">
> = {
  active: {
    label: "Đang phụ trách",
    note: "học sinh đang theo dõi",
    tone: "primary",
  },
  new: { label: "Mới nhận", note: "trong hôm nay", tone: "sky" },
  unassigned: {
    label: "Chưa phân công",
    note: "cần điều phối",
    tone: "violet",
  },
  "needs-action": {
    label: "Cần xử lý",
    note: "đang chờ hành động",
    tone: "warning",
  },
  overdue: { label: "Quá hạn", note: "cần hỗ trợ ngay", tone: "error" },
  documents: {
    label: "Hồ sơ chờ",
    note: "thiếu giấy tờ hoặc xác nhận",
    tone: "success",
  },
};

export function toLeadSaleStats(kpis: LeadSaleKpi[]): LeadSaleStat[] {
  return kpis.map((kpi) => ({
    id: kpi.id,
    value: kpi.value,
    ...statPresentation[kpi.id],
  }));
}

export interface InterventionItem {
  id: string;
  label: string;
  value: number;
  note: string;
  action: string;
  href: string;
  tone: "violet" | "warning" | "error" | "sky";
}

const interventionPresentation: Record<
  LeadSaleIntervention["id"],
  Omit<InterventionItem, "id" | "value">
> = {
  unassigned: {
    label: "Chưa phân công",
    note: "Hồ sơ mới chưa có người phụ trách",
    action: "Điều phối",
    href: "/lead-sale/student-assignment",
    tone: "violet",
  },
  "not-contacted": {
    label: "Chưa liên hệ sau 24 giờ",
    note: "Chưa ghi nhận lần liên hệ gần nhất",
    action: "Xem",
    href: "/lead-sale/students",
    tone: "warning",
  },
  "at-risk": {
    label: "Có nguy cơ mất liên hệ",
    note: "Không phản hồi hoặc giảm tương tác",
    action: "Xem",
    href: "/lead-sale/students",
    tone: "error",
  },
  blocked: {
    label: "Hồ sơ đang bị kẹt",
    note: "Thiếu giấy tờ hoặc chờ xử lý",
    action: "Xử lý",
    href: "/lead-sale/tasks",
    tone: "sky",
  },
};

export function toInterventionItems(
  items: LeadSaleIntervention[],
): InterventionItem[] {
  return items.map((item) => ({
    id: item.id,
    value: item.count,
    ...interventionPresentation[item.id],
  }));
}

export interface TeamPerformance {
  id: string;
  name: string;
  initials: string;
  activeStudents: number;
  consulted: number;
  admitted: number;
  status: "Tốt" | "Cần hỗ trợ";
}

function initials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(-2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "–"
  );
}

export function toTeamPerformance(
  items: LeadSaleTeamMember[],
): TeamPerformance[] {
  return items.map((item) => ({
    id: item.id,
    name: item.displayName,
    initials: initials(item.displayName),
    activeStudents: item.activeStudents,
    consulted: item.consulted,
    admitted: item.admitted,
    status: item.status === "on-track" ? "Tốt" : "Cần hỗ trợ",
  }));
}

export interface StudentStatusDataItem {
  id: LeadSaleStudentStatusItem["id"];
  label: string;
  value: number;
  color: string;
}

const statusColors: Record<LeadSaleStudentStatusItem["id"], string> = {
  consulting: "var(--primary-500)",
  waiting: "var(--info-500)",
  documents: "var(--warning-500)",
  admission: "var(--success-500)",
  new: "var(--primary-200)",
};

export function toStudentStatusData(
  items: LeadSaleStudentStatusItem[],
): StudentStatusDataItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    value: item.count,
    color: statusColors[item.id],
  }));
}

export interface ResultTrendPoint {
  period: string;
  consulted: number;
  admitted: number;
}

export function toResultTrendData(
  points: LeadSaleTrendPoint[],
): ResultTrendPoint[] {
  return points.map((point) => ({
    period: point.label,
    consulted: point.consulted,
    admitted: point.admitted,
  }));
}
