import type { AiAgentsRawResponse } from "@/services/api/ai";

export type { AiAgentsRawResponse };

export type AgentBadgeColor = "success" | "gray" | "error";

export interface AiAgentViewModel {
  id: string;
  name: string;
  description: string;
  status: string;
  statusColor: AgentBadgeColor;
  requests: string;
  successRate: number;
}
