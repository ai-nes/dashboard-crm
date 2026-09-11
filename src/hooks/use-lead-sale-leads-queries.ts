"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  convertLeadToStudent,
  assignLeadToStaff,
  createLead,
  deleteLead,
  getLeadAssignmentTargets,
  getLeadDetail,
  getLeadList,
  importLeadFile,
  importLeadRows,
  processLead,
  processNewLeads,
  type LeadImportResponse,
  type LeadImportMapping,
  reopenLead,
  updateLeadProcessingStatus,
  updateLead,
  type LeadCreateFields,
  type LeadUpdateFields,
  type LeadDetailResponse,
  type LeadConversionResponse,
  type LeadAssignmentRequest,
  type LeadAssignmentResponse,
  type LeadAssignmentTargetsResponse,
  type LeadListParams,
  type LeadListResponse,
  type LeadProcessRequest,
  type LeadProcessResponse,
  type LeadProcessScanRequest,
  type LeadProcessScanResponse,
  type LeadReopenRequest,
  type LeadStatusUpdateRequest,
} from "@/services/api/lead-sale";

export const leadSaleLeadsKeys = {
  all: ["lead-sale-leads"] as const,
  list: (params?: LeadListParams) =>
    ["lead-sale-leads", "list", params] as const,
  detail: (leadId: string) => ["lead-sale-leads", "detail", leadId] as const,
  assignmentTargets: (leadId: string) =>
    ["lead-sale-leads", "assignment-targets", leadId] as const,
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

export function useLeadAssignmentTargetsQuery(
  leadId: string,
  options?: Omit<
    UseQueryOptions<
      LeadAssignmentTargetsResponse,
      Error,
      LeadAssignmentTargetsResponse,
      ReturnType<typeof leadSaleLeadsKeys.assignmentTargets>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<LeadAssignmentTargetsResponse, Error> {
  return useQuery({
    queryKey: leadSaleLeadsKeys.assignmentTargets(leadId),
    queryFn: () => getLeadAssignmentTargets(leadId),
    enabled: Boolean(leadId) && (options?.enabled ?? true),
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

export function useAssignLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadAssignmentResponse, Error, LeadAssignmentRequest>({
    mutationFn: (request) => assignLeadToStaff(request),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: leadSaleLeadsKeys.detail(variables.lead),
        }),
        queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
        queryClient.invalidateQueries({
          queryKey: leadSaleLeadsKeys.assignmentTargets(variables.lead),
        }),
      ]),
  });
}

export function useProcessLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadProcessResponse, Error, LeadProcessRequest>({
    mutationFn: (request) => processLead(request),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: leadSaleLeadsKeys.detail(variables.lead),
        }),
        queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
      ]),
  });
}

export function useProcessNewLeadsMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadProcessScanResponse, Error, LeadProcessScanRequest>({
    mutationFn: (request) => processNewLeads(request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
  });
}

export function useUpdateLeadProcessingStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadProcessResponse, Error, LeadStatusUpdateRequest>({
    mutationFn: (request) => updateLeadProcessingStatus(request),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: leadSaleLeadsKeys.detail(variables.lead),
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

export function useImportLeadRowsMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    LeadImportResponse,
    Error,
    {
      rows: Record<string, unknown>[];
      filename: string;
      campaignCode: string;
    }
  >({
    mutationFn: ({ rows, filename, campaignCode }) =>
      importLeadRows(rows, filename, campaignCode),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
  });
}

export function useImportLeadFileMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    LeadImportResponse,
    Error,
    {
      file: File;
      campaignCode: string;
      mapping: LeadImportMapping[];
    }
  >({
    mutationFn: ({ file, campaignCode, mapping }) =>
      importLeadFile(file, campaignCode, mapping),
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

export function useConvertLeadToStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadConversionResponse, Error, string>({
    mutationFn: (leadId) => convertLeadToStudent(leadId),
    onSuccess: (_data, leadId) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: leadSaleLeadsKeys.detail(leadId),
        }),
        queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
      ]),
  });
}

export function useReopenLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadProcessResponse, Error, LeadReopenRequest>({
    mutationFn: (request) => reopenLead(request),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: leadSaleLeadsKeys.detail(variables.lead),
        }),
        queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all }),
      ]),
  });
}
