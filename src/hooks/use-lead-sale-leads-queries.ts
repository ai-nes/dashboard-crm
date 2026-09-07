"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getLeadDetail,
  getLeadList,
  type LeadDetailResponse,
  type LeadListParams,
  type LeadListResponse,
} from "@/services/api/lead-sale";

export const leadSaleLeadsKeys = {
  all: ["lead-sale-leads"] as const,
  list: (params?: LeadListParams) =>
    ["lead-sale-leads", "list", params] as const,
  detail: (leadId: string) => ["lead-sale-leads", "detail", leadId] as const,
};

export function useLeadSaleLeadsQuery<TData = LeadListResponse>(
  params?: LeadListParams,
  options?: Omit<
    UseQueryOptions<
      LeadListResponse,
      Error,
      TData,
      ReturnType<typeof leadSaleLeadsKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: leadSaleLeadsKeys.list(params),
    queryFn: () => getLeadList(params),
    ...options,
  });
}

export function useLeadSaleLeadQuery<TData = LeadDetailResponse | null>(
  leadId: string,
  options?: Omit<
    UseQueryOptions<
      LeadDetailResponse | null,
      Error,
      TData,
      ReturnType<typeof leadSaleLeadsKeys.detail>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: leadSaleLeadsKeys.detail(leadId),
    queryFn: () => getLeadDetail(leadId),
    enabled: Boolean(leadId),
    ...options,
  });
}
