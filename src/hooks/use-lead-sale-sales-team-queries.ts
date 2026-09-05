"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getSalesTeamMemberDetail,
  getSalesTeamWorkspace,
  type SalesTeamMemberDetailParams,
  type SalesTeamMemberDetailResponse,
  type SalesTeamWorkspaceParams,
  type SalesTeamWorkspaceResponse,
} from "@/services/api/lead-sale";

export const salesTeamKeys = {
  all: ["lead-sale", "sales-team"] as const,
  workspace: (params: SalesTeamWorkspaceParams = {}) =>
    ["lead-sale", "sales-team", "workspace", params] as const,
  member: (params: SalesTeamMemberDetailParams) =>
    [
      "lead-sale",
      "sales-team",
      "member",
      params.memberId,
      params.admissionYear,
      params.date,
      params.timezone,
    ] as const,
};

export function useSalesTeamWorkspaceQuery<TData = SalesTeamWorkspaceResponse>(
  params: SalesTeamWorkspaceParams = {},
  options?: Omit<
    UseQueryOptions<
      SalesTeamWorkspaceResponse,
      Error,
      TData,
      ReturnType<typeof salesTeamKeys.workspace>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: salesTeamKeys.workspace(params),
    queryFn: () => getSalesTeamWorkspace(params),
    ...options,
  });
}

export function useSalesTeamMemberDetailQuery<TData = SalesTeamMemberDetailResponse>(
  params: SalesTeamMemberDetailParams | null,
  options?: Omit<
    UseQueryOptions<
      SalesTeamMemberDetailResponse,
      Error,
      TData,
      ReturnType<typeof salesTeamKeys.member>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  const request = params ?? { memberId: "" };
  return useQuery({
    queryKey: salesTeamKeys.member(request),
    queryFn: () => getSalesTeamMemberDetail(request),
    enabled: Boolean(params?.memberId) && (options?.enabled ?? true),
    ...options,
  });
}
