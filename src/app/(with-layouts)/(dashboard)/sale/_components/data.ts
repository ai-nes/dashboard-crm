import type {
  SaleAttentionId,
  SaleKpiId,
  SaleOperationId,
  SalePipelineStageId,
  SaleStudentStatusId,
} from "@/services/api/sale";

export type SaleDashboardTone = "primary" | "sky" | "warning" | "violet" | "success";

export const KPI_PRESENTATION: Record<
  SaleKpiId,
  { label: string; note: string; tone: SaleDashboardTone }
> = {
  assigned: {
    label: "Đang phụ trách",
    note: "học sinh trong luồng tuyển sinh",
    tone: "primary",
  },
  consulting: {
    label: "Đang tư vấn",
    note: "đang được chăm sóc",
    tone: "sky",
  },
  qualified: {
    label: "Có nhu cầu",
    note: "đã xác định nhu cầu",
    tone: "violet",
  },
  documents: {
    label: "Đang làm hồ sơ",
    note: "đang hoàn thiện giấy tờ",
    tone: "warning",
  },
  admission: {
    label: "Chờ nhập học",
    note: "sẵn sàng chuyển bước",
    tone: "success",
  },
};

export const FUNNEL_STAGE_COLORS: Record<SalePipelineStageId, string> = {
  assigned: "var(--primary-300)",
  contacted: "var(--primary-400)",
  consulted: "var(--primary-500)",
  interested: "var(--info-500)",
  documents: "var(--info-500)",
  confirmed: "var(--success-500)",
  admitted: "var(--success-500)",
};

export const ATTENTION_PRESENTATION: Record<
  SaleAttentionId,
  { label: string; note: string; tone: "error" | "success" | "warning" }
> = {
  "at-risk": {
    label: "Có nguy cơ mất liên hệ",
    note: "Chưa phản hồi sau nhiều lần liên hệ",
    tone: "error",
  },
  "high-intent": {
    label: "Khả năng chuyển đổi cao",
    note: "Đã có nhu cầu, cần chốt bước tiếp theo",
    tone: "success",
  },
  blocked: {
    label: "Hồ sơ đang bị kẹt",
    note: "Thiếu giấy tờ hoặc chưa có lịch xử lý",
    tone: "warning",
  },
};

export const STATUS_COLORS: Record<SaleStudentStatusId, string> = {
  new: "var(--primary-200)",
  consulting: "var(--primary-500)",
  waiting: "var(--info-500)",
  documents: "var(--warning-500)",
  admission: "var(--success-500)",
};

export const OPERATION_PRESENTATION: Record<
  SaleOperationId,
  { label: string; note: string; iconClassName: string; href: string }
> = {
  "overdue-tasks": {
    label: "Task quá hạn",
    note: "Cần xử lý ngay để không trễ SLA",
    iconClassName: "bg-badge-error-background text-badge-error-text",
    href: "/sale/tasks",
  },
  "missing-documents": {
    label: "Hồ sơ thiếu giấy tờ",
    note: "Cần nhắc học sinh bổ sung",
    iconClassName: "bg-badge-warning-background text-badge-warning-text",
    href: "/sale/students",
  },
};
