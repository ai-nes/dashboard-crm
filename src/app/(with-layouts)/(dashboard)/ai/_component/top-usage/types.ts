import type { TopUsageRawResponse } from "@/services/api/ai";

export type { TopUsageRawResponse };

export interface TopUsageViewModel {
  id: string;
  modelName: string;
  provider: string;
  requests: string;
  cost: string;
}
