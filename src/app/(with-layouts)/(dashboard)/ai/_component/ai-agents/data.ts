import type { AgentBadgeColor } from "./types";

export const SKELETON_ROW_COUNT = 5;

export const AGENT_STATUS_COLOR_MAP: Record<string, AgentBadgeColor> = {
  active: "success",
  idle: "gray",
  error: "error",
};

export const AGENT_STATUS_LABEL_MAP: Record<string, string> = {
  active: "Active",
  idle: "Idle",
  error: "Error",
};
