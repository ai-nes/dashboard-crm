import { BarChart2, Bolt1, ErrorCircle1, Message1, RefreshCircle1Clockwise } from "@tailgrids/icons";
import type { ActivityType } from "@/services/api/ai";

import type { ActivityDisplayConfig } from "./types";

export const activityDisplayConfig: Record<ActivityType, ActivityDisplayConfig> = {
  agent_run: {
    icon: <Bolt1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(59,130,246,0.10)]",
    iconColorClass: "text-[#3B82F6]",
  },
  alert: {
    icon: <ErrorCircle1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(239,68,68,0.10)]",
    iconColorClass: "text-[#EF4444]",
  },
  deployment: {
    icon: <RefreshCircle1Clockwise className="size-4.5" />,
    iconBgClass: "bg-[rgba(34,197,94,0.10)]",
    iconColorClass: "text-[#22C55E]",
  },
  usage_spike: {
    icon: <BarChart2 className="size-4.5" />,
    iconBgClass: "bg-[rgba(249,115,22,0.10)]",
    iconColorClass: "text-[#F97316]",
  },
  integration: {
    icon: <Message1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(168,85,247,0.10)]",
    iconColorClass: "text-[#A855F7]",
  },
};
