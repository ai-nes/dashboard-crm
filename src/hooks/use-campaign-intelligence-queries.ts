"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getCampaignIntelligence,
  getCampaignLeads,
  type CampaignScopeParams,
  type CampaignLeadsParams,
  type CampaignIntelligenceResponse,
} from "@/services/api/campaign-intelligence";

export const campaignIntelligenceKeys = {
  all: ["campaign-intelligence", "frappe-v1"] as const,
  root: (params: CampaignScopeParams = {}) => ["campaign-intelligence", "frappe-v1", params] as const,
  leads: (params: CampaignLeadsParams) => ["campaign-intelligence", "leads", params] as const,
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
  params: CampaignScopeParams = {},
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: campaignIntelligenceKeys.root(params),
    queryFn: ({ signal }) => getCampaignIntelligence(params, signal),
    ...options,
  });
}

export function useCampaignLeadsQuery(params: CampaignLeadsParams) {
  return useQuery({
    queryKey: campaignIntelligenceKeys.leads(params),
    queryFn: ({ signal }) => getCampaignLeads(params, signal),
    retry: false,
    gcTime: 0,
  });
}
