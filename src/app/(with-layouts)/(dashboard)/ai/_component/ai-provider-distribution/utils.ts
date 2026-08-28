import type { AiProviderDistributionRawResponse } from "@/services/api/ai";

import type { ProviderDistributionViewModel } from "./types";

export function mapProviderDistributionResponse(
  response: AiProviderDistributionRawResponse,
): ProviderDistributionViewModel {
  return {
    totalRequests: response.total_requests,
    segments: response.segments.map((segment) => ({
      id: segment.id,
      name: segment.provider_name,
      value: segment.percentage,
      color: segment.color_token,
    })),
  };
}
