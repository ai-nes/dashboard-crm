import type { CRMTaskStatus } from "./types";

/** Backlog and Todo share one management lane, so they use one end-user label. */
export const CRM_TASK_STATUS_LABEL: Record<CRMTaskStatus, string> = {
  Backlog: "Cần làm",
  Todo: "Cần làm",
  "In Progress": "Đang xử lý",
  Done: "Hoàn thành",
  Canceled: "Đã hủy",
};
