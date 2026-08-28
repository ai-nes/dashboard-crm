import {
  Bell1,
  Comment1,
  FileTextMultiple,
  InfoTriangle,
  Megaphone1,
  UserMultiple1,
} from "@tailgrids/icons";

import type { ActivityDisplayConfigMap } from "./types";

export const activityDisplayConfig: ActivityDisplayConfigMap = {
  campaign_launched: {
    icon: <Megaphone1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(34,197,94,0.10)]",
    iconColorClass: "text-[#22C55E]",
  },
  campaign_paused: {
    icon: <InfoTriangle className="size-4.5" />,
    iconBgClass: "bg-[rgba(249,115,22,0.10)]",
    iconColorClass: "text-[#F97316]",
  },
  new_lead: {
    icon: <UserMultiple1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(59,130,246,0.10)]",
    iconColorClass: "text-[#3B82F6]",
  },
  budget_alert: {
    icon: <Bell1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(239,68,68,0.10)]",
    iconColorClass: "text-red-600",
  },
  comment: {
    icon: <Comment1 className="size-4.5" />,
    iconBgClass: "bg-[rgba(168,85,247,0.10)]",
    iconColorClass: "text-[#A855F7]",
  },
  report_ready: {
    icon: <FileTextMultiple className="size-4.5" />,
    iconBgClass: "bg-[rgba(15,173,207,0.10)]",
    iconColorClass: "text-[#0FADCF]",
  },
};
