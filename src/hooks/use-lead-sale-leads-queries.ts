"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  createLead,
  deleteLead,
  getLeadDetail,
  getLeadList,
  updateLead,
  type LeadCreateFields,
  type LeadUpdateFields,
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

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    LeadDetailResponse,
    Error,
    { leadId: string; fields: LeadUpdateFields }
  >({
    mutationFn: ({ leadId, fields }) => updateLead(leadId, fields),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: leadSaleLeadsKeys.detail(variables.leadId),
        }),
        queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
      ]),
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadDetailResponse, Error, LeadCreateFields>({
    mutationFn: (fields) => createLead(fields),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: string }, Error, string>({
    mutationFn: (leadId) => deleteLead(leadId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
  });
}
