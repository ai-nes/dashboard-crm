"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  createCrmUser,
  listCrmUsers,
  listUserRoleLogs,
  removeUser,
  updateCrmUserProfile,
  updateUserCapacity,
  updateUserRole,
  type CreateCrmUserPayload,
  type ListCrmUsersParams,
  type ListCrmUsersResponse,
  type ListUserRoleLogsParams,
  type ListUserRoleLogsResponse,
  type RemoveUserPayload,
  type UpdateCrmUserProfilePayload,
  type UpdateUserCapacityPayload,
  type UpdateUserRolePayload,
} from "@/services/api/user-management";

export const userManagementKeys = {
  all: ["user-management"] as const,
  users: (params: ListCrmUsersParams = {}) =>
    ["user-management", "users", params] as const,
  logs: (params: ListUserRoleLogsParams) =>
    ["user-management", "logs", params] as const,
};

export function useCrmUsersQuery(
  params: ListCrmUsersParams = {},
  options?: Omit<
    UseQueryOptions<ListCrmUsersResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<ListCrmUsersResponse, Error> {
  return useQuery({
    queryKey: userManagementKeys.users(params),
    queryFn: () => listCrmUsers(params),
    staleTime: 30 * 1000,
    ...options,
  });
}

function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserRolePayload) => updateUserRole(payload),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useRemoveUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemoveUserPayload) => removeUser(payload),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useCreateCrmUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCrmUserPayload) => createCrmUser(payload),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useUpdateCrmUserProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCrmUserProfilePayload) =>
      updateCrmUserProfile(payload),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useUpdateUserCapacityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserCapacityPayload) =>
      updateUserCapacity(payload),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useUserRoleLogsQuery(
  params: ListUserRoleLogsParams = {},
  options?: Omit<
    UseQueryOptions<ListUserRoleLogsResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<ListUserRoleLogsResponse, Error> {
  return useQuery({
    queryKey: userManagementKeys.logs(params),
    queryFn: () => listUserRoleLogs(params),
    staleTime: 30 * 1000,
    ...options,
  });
}
