import type { AiProviderDistributionRawResponse } from "@/services/api/ai";

export type { AiProviderDistributionRawResponse };

export interface ProviderSegmentViewModel {
  id: string;
  name: string;
  value: number;
  color: string;
}

export interface ProviderDistributionViewModel {
  totalRequests: number;
  segments: ProviderSegmentViewModel[];
}
