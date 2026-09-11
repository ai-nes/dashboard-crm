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
  updateUserRole,
  type CreateCrmUserPayload,
  type ListCrmUsersResponse,
  type ListUserRoleLogsParams,
  type ListUserRoleLogsResponse,
  type RemoveUserPayload,
  type UpdateCrmUserProfilePayload,
  type UpdateUserRolePayload,
} from "@/services/api/user-management";

export const userManagementKeys = {
  all: ["user-management"] as const,
  users: ["user-management", "users"] as const,
  logs: (params: ListUserRoleLogsParams) => ["user-management", "logs", params] as const,
};

export function useCrmUsersQuery(
  options?: Omit<UseQueryOptions<ListCrmUsersResponse, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ListCrmUsersResponse, Error> {
  return useQuery({
    queryKey: userManagementKeys.users,
    queryFn: () => listCrmUsers(),
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
    mutationFn: (payload: UpdateCrmUserProfilePayload) => updateCrmUserProfile(payload),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useUserRoleLogsQuery(
  params: ListUserRoleLogsParams = {},
  options?: Omit<UseQueryOptions<ListUserRoleLogsResponse, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ListUserRoleLogsResponse, Error> {
  return useQuery({
    queryKey: userManagementKeys.logs(params),
    queryFn: () => listUserRoleLogs(params),
    staleTime: 30 * 1000,
    ...options,
  });
}
