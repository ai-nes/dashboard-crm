"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getCampaignList,
  type CampaignListResponse,
  type CampaignListParams,
} from "@/services/api/lead-sale";

export const leadSaleCampaignKeys = {
  all: ["lead-sale-campaigns"] as const,
  list: (params: CampaignListParams = {}) =>
    ["lead-sale-campaigns", "list", params] as const,
};

export function useLeadSaleCampaignsQuery<TData = CampaignListResponse>(
  params: CampaignListParams = {},
  options?: Omit<
    UseQueryOptions<
      CampaignListResponse,
      Error,
      TData,
      ReturnType<typeof leadSaleCampaignKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: leadSaleCampaignKeys.list(params),
    queryFn: () => getCampaignList(params),
    ...options,
  });
}
