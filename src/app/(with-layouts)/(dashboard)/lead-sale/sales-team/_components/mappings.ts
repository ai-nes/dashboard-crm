import type { MemberAvailability, MemberHealth } from "./types";

export const availabilityLabels: Record<MemberAvailability, string> = {
  active: "Đang hoạt động",
  away: "Ngoại tuyến",
  leave: "Tạm nghỉ",
};

export const availabilityColors = {
  active: "success",
  away: "gray",
  leave: "warning",
} as const;

export const healthLabels: Record<MemberHealth, string> = {
  good: "Ổn định",
  support: "Cần hỗ trợ",
};

export const healthColors = {
  good: "success",
  support: "warning",
} as const;
