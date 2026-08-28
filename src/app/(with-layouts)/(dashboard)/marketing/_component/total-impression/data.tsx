import { BagShopping2, Eye, Target3, TrendUp2 } from "@tailgrids/icons";
import type { MarketingStatKey } from "@/services/api/marketing";

import type { MarketingStatDisplayConfig } from "./types";

export const marketingStatDisplayConfig: Record<MarketingStatKey, MarketingStatDisplayConfig> = {
  impressions: {
    title: "Total Impressions",
    icon: <Eye className="size-4.5" />,
    iconBgClass: "bg-[rgba(59,130,246,0.10)]",
    iconColorClass: "text-[#3B82F6]",
  },
  clicks: {
    title: "Total Clicks",
    icon: <Target3 className="size-4.5" />,
    iconBgClass: "bg-[rgba(249,115,22,0.10)]",
    iconColorClass: "text-[#F97316]",
  },
  ctr: {
    title: "Average CTR",
    icon: <TrendUp2 className="size-4.5" />,
    iconBgClass: "bg-[rgba(34,197,94,0.10)]",
    iconColorClass: "text-[#22C55E]",
  },
  conversions: {
    title: "Total Conversions",
    icon: <BagShopping2 className="size-4.5" />,
    iconBgClass: "bg-[rgba(168,85,247,0.10)]",
    iconColorClass: "text-[#A855F7]",
  },
};
