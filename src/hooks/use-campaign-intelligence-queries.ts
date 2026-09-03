"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { getCampaignIntelligence } from "@/services/api/campaign-intelligence";
import type { CampaignIntelligenceResponse } from "@/services/api/campaign-intelligence";

export const campaignIntelligenceKeys = {
  all: ["campaign-intelligence", "frappe-v1"] as const,
  root: () => ["campaign-intelligence", "frappe-v1"] as const,
};

export function useCampaignIntelligenceQuery<
  TData = CampaignIntelligenceResponse,
>(
  options?: Omit<
    UseQueryOptions<
      CampaignIntelligenceResponse,
      Error,
      TData,
      ReturnType<typeof campaignIntelligenceKeys.root>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: campaignIntelligenceKeys.root(),
    queryFn: getCampaignIntelligence,
    ...options,
  });
}
