import type { BadgeColor } from "./types";

export const SKELETON_ROW_COUNT = 5;

export const STATUS_COLOR_MAP: Record<string, BadgeColor> = {
  active: "success",
  trialing: "blue",
  past_due: "warning",
  canceled: "gray",
};

export const PLAN_NAME_MAP: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};
