"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  type CRMTask,
  type CreateTaskPayload,
  type ListTasksParams,
  type ListTasksResponse,
  type UpdateTaskPayload,
} from "@/services/api/crm-tasks";

export const crmTasksKeys = {
  all: ["crm-tasks"] as const,
  list: (params: ListTasksParams) => ["crm-tasks", "list", params] as const,
  detail: (name: string) => ["crm-tasks", "detail", name] as const,
};

export function useCrmTasksQuery<TData = ListTasksResponse>(
  params: ListTasksParams,
  options?: Omit<
    UseQueryOptions<
      ListTasksResponse,
      Error,
      TData,
      ReturnType<typeof crmTasksKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmTasksKeys.list(params),
    queryFn: () => listTasks(params),
    enabled: Boolean(params.referenceDocname),
    ...options,
  });
}

export function useCrmTaskDetailQuery<TData = CRMTask>(
  name: string,
  options?: Omit<
    UseQueryOptions<
      CRMTask,
      Error,
      TData,
      ReturnType<typeof crmTasksKeys.detail>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmTasksKeys.detail(name),
    queryFn: () => getTask(name),
    enabled: Boolean(name),
    ...options,
  });
}

export function useCreateCrmTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmTasksKeys.all });
    },
  });
}

export function useUpdateCrmTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => updateTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmTasksKeys.all });
    },
  });
}

export function useDeleteCrmTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteTask(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmTasksKeys.all });
    },
  });
}
