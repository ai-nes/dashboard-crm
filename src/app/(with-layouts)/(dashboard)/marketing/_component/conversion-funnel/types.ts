import type { ConversionFunnelRawResponse } from "@/services/api/marketing";

export type { ConversionFunnelRawResponse };

export interface FunnelStageViewModel {
  id: string;
  label: string;
  count: string;
  percentOfTop: number;
  dropOffPercent: string | null;
}
