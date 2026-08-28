import type { Granularity } from "@/services/api/saas";

export interface PageHeaderProps {
  granularity: Granularity;
  onGranularityChange: (value: Granularity) => void;
}
