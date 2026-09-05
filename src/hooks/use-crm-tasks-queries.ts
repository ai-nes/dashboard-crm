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
    enabled: options?.enabled ?? true,
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

function getTaskCachePatch(
  updates: UpdateTaskPayload,
): Partial<CRMTask> {
  return {
    ...(updates.title !== undefined ? { title: updates.title } : {}),
    ...(updates.description !== undefined
      ? { description: updates.description }
      : {}),
    ...(updates.priority !== undefined ? { priority: updates.priority } : {}),
    ...(updates.startDate !== undefined
      ? { startDate: updates.startDate }
      : {}),
    ...(updates.assignedTo !== undefined
      ? { assignedTo: updates.assignedTo }
      : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.dueDate !== undefined ? { dueDate: updates.dueDate } : {}),
    ...(updates.linkedInteraction !== undefined
      ? { linkedInteraction: updates.linkedInteraction }
      : {}),
  };
}

export function useUpdateCrmTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => updateTask(payload),
    onSuccess: (_, variables) => {
      const patch = getTaskCachePatch(variables);

      queryClient.setQueriesData<ListTasksResponse>(
        {
          queryKey: crmTasksKeys.all,
          predicate: (query) => query.queryKey[1] === "list",
        },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            tasks: current.tasks.map((task) =>
              task.name === variables.name ? { ...task, ...patch } : task,
            ),
          };
        },
      );

      queryClient.setQueryData<CRMTask>(
        crmTasksKeys.detail(variables.name),
        (current) => (current ? { ...current, ...patch } : current),
      );
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
