import type { AiAgentRawItem } from "@/services/api/ai";

import { AGENT_STATUS_COLOR_MAP, AGENT_STATUS_LABEL_MAP } from "./data";
import type { AiAgentViewModel } from "./types";

export function toAiAgentViewModel(raw: AiAgentRawItem): AiAgentViewModel {
  return {
    id: raw.id,
    name: raw.agent_name,
    description: raw.description,
    status: AGENT_STATUS_LABEL_MAP[raw.status] ?? raw.status,
    statusColor: AGENT_STATUS_COLOR_MAP[raw.status] ?? "gray",
    requests: raw.requests_count.toLocaleString(),
    successRate: raw.success_rate,
  };
}

export function getSuccessRateColor(rate: number): string {
  if (rate >= 95) return "var(--color-green-600)";
  if (rate >= 80) return "var(--color-brand-500)";
  return "var(--color-red-600)";
}
