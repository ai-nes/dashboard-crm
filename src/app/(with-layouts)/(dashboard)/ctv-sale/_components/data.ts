import type {
  CtvSaleContactOutcomeItem,
  CtvSaleKpi,
  CtvSaleStudentStatusItem,
} from "@/services/api/ctv-sale";

export const KPI_PRESENTATION: Record<
  CtvSaleKpi["id"],
  { label: string; note: string }
> = {
  assigned: { label: "Được giao", note: "hồ sơ đang phụ trách" },
  uncontacted: { label: "Chưa liên hệ", note: "cần ưu tiên hôm nay" },
  "follow-up": { label: "Cần follow-up", note: "đang chờ chăm sóc lại" },
  transfer: { label: "Chuyển Sale", note: "sẵn sàng bàn giao" },
};

export const STATUS_COLORS: Record<CtvSaleStudentStatusItem["id"], string> = {
  new: "var(--primary-300)",
  consulting: "var(--primary-500)",
  connected: "var(--info-500)",
  transferred: "var(--success-500)",
};

export const OUTCOME_COLORS: Record<string, string> = {
  connected: "var(--primary-500)",
  missed: "var(--primary-200)",
  "follow-up": "var(--info-500)",
  qualified: "var(--success-500)",
  other: "var(--text-tertiary)",
};

export function outcomeColor(item: CtvSaleContactOutcomeItem): string {
  return OUTCOME_COLORS[item.id] ?? "var(--text-tertiary)";
}
