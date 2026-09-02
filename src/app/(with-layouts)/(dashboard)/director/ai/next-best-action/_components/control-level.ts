import type { ActionControlLevel } from "./types";

/**
 * Risk-tier presentation for a recommended action, from the "Mô hình kiểm soát
 * hành động" model: automatic actions run without review, review-tier actions
 * pass business rules, approval-tier actions must be routed to a reviewer. This
 * is display only — the tier does not yet change what the workspace commands do.
 */
export const CONTROL_LEVEL_LABEL: Record<ActionControlLevel, string> = {
  automatic: "Thấp — tự động",
  review: "Trung bình",
  approval: "Cao — cần duyệt",
};

export const CONTROL_LEVEL_COLOR: Record<
  ActionControlLevel,
  "success" | "warning" | "error"
> = {
  automatic: "success",
  review: "warning",
  approval: "error",
};
