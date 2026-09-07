import type { ConversionPotential } from "./types";

export function leadStatusColor(
  status: string,
): "gray" | "sky" | "warning" | "error" | "success" {
  const normalized = status.toLocaleLowerCase("vi-VN");
  if (
    normalized.includes("nhập học") ||
    normalized.includes("chuyển đổi") ||
    normalized.includes("enrolled") ||
    normalized.includes("converted")
  ) {
    return "success";
  }
  if (
    normalized.includes("từ chối") ||
    normalized.includes("không tiềm năng") ||
    normalized.includes("lost")
  ) {
    return "error";
  }
  if (
    normalized.includes("xác nhận") ||
    normalized.includes("bổ sung") ||
    normalized.includes("applicant")
  ) {
    return "warning";
  }
  if (
    normalized.includes("triển vọng") ||
    normalized.includes("liên hệ") ||
    normalized.includes("mql")
  ) {
    return "sky";
  }
  return "gray";
}

export const conversionPotentialColor: Record<
  ConversionPotential,
  "success" | "warning" | "error" | "gray"
> = {
  Cao: "success",
  "Trung bình": "warning",
  Thấp: "error",
  "Chưa xác định": "gray",
};
