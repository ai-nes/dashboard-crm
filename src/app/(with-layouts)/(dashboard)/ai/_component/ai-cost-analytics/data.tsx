import { BarChart2, Bolt1, Brain1, SackDollar } from "@tailgrids/icons";
import type { AiCostStatKey } from "@/services/api/ai";

import type { AiCostStatDisplayConfig } from "./types";

export const aiCostStatDisplayConfig: Record<AiCostStatKey, AiCostStatDisplayConfig> = {
  total_spend: {
    title: "Total AI Spend",
    icon: <SackDollar className="size-4.5" />,
    iconBgClass: "bg-[rgba(34,197,94,0.10)]",
    iconColorClass: "text-[#22C55E]",
  },
  api_requests: {
    title: "API Requests",
    icon: <Bolt1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(59,130,246,0.10)]",
    iconColorClass: "text-[#3B82F6]",
  },
  avg_cost_per_request: {
    title: "Avg Cost / Request",
    icon: <BarChart2 className="size-4.5" />,
    iconBgClass: "bg-[rgba(249,115,22,0.10)]",
    iconColorClass: "text-[#F97316]",
  },
  tokens_processed: {
    title: "Tokens Processed",
    icon: <Brain1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(168,85,247,0.10)]",
    iconColorClass: "text-[#A855F7]",
  },
};
