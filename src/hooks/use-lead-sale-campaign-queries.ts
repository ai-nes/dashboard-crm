"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  createCampaign,
  getCampaignChannelTypes,
  getCampaignList,
  updateCampaign,
  type CampaignChannelTypeListParams,
  type CampaignChannelTypeListResponse,
  type CampaignListResponse,
  type CampaignListParams,
  type CreateCampaignPayload,
  type LeadSaleCampaign,
  type UpdateCampaignPayload,
} from "@/services/api/lead-sale";

export const leadSaleCampaignKeys = {
  all: ["lead-sale-campaigns"] as const,
  list: (params: CampaignListParams = {}) =>
    ["lead-sale-campaigns", "list", params] as const,
  channelTypes: (params: CampaignChannelTypeListParams = {}) =>
    ["lead-sale-campaigns", "channel-types", params] as const,
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

export function useLeadSaleCampaignChannelTypesQuery<
  TData = CampaignChannelTypeListResponse,
>(
  params: CampaignChannelTypeListParams = {},
  options?: Omit<
    UseQueryOptions<
      CampaignChannelTypeListResponse,
      Error,
      TData,
      ReturnType<typeof leadSaleCampaignKeys.channelTypes>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: leadSaleCampaignKeys.channelTypes(params),
    queryFn: () => getCampaignChannelTypes(params),
    ...options,
  });
}

export function useCreateLeadSaleCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadSaleCampaign, Error, CreateCampaignPayload>({
    mutationFn: (payload) => createCampaign(payload),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: leadSaleCampaignKeys.list(),
      });
    },
  });
}

export function useUpdateLeadSaleCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadSaleCampaign, Error, UpdateCampaignPayload>({
    mutationFn: (payload) => updateCampaign(payload),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: leadSaleCampaignKeys.list(),
      });
    },
  });
}
