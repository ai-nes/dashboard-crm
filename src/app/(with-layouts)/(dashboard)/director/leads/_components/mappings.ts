import type { ConversionPotential, LeadStatus } from "./types";

export const leadStatusColor: Record<LeadStatus, "gray" | "sky" | "warning" | "error" | "success"> = {
  "Mới": "gray",
  "Đang liên hệ": "sky",
  "Cần bổ sung thông tin": "warning",
  "Không tiềm năng": "error",
  "Đã chuyển đổi": "success",
};

export const conversionPotentialColor: Record<ConversionPotential, "success" | "warning" | "error"> = {
  "Cao": "success",
  "Trung bình": "warning",
  "Thấp": "error",
};
