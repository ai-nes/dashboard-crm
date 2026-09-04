"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  listNbaActionTypes,
  listNbaActions,
  listNbaTimeSlots,
  createNbaAction,
  deleteNbaAction,
  getNbaAction,
  updateNbaAction,
  type CreateNbaActionPayload,
  type ListNbaActionTypesResponse,
  type ListNbaActionsParams,
  type ListNbaActionsResponse,
  type ListNbaTimeSlotsResponse,
  type UpdateNbaActionPayload,
} from "@/services/api/nba-actions";

export const nbaActionsKeys = {
  all: ["nba-actions"] as const,
  list: (params: ListNbaActionsParams) =>
    ["nba-actions", "list", params] as const,
  types: ["nba-actions", "types"] as const,
  timeSlots: ["nba-actions", "time-slots"] as const,
};

export function useNbaActionsQuery<TData = ListNbaActionsResponse>(
  params: ListNbaActionsParams,
  options?: Omit<
    UseQueryOptions<
      ListNbaActionsResponse,
      Error,
      TData,
      ReturnType<typeof nbaActionsKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: nbaActionsKeys.list(params),
    queryFn: () => listNbaActions(params),
    ...options,
  });
}

export function useNbaActionQuery(
  name: string,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getNbaAction>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["nba-actions", "action", name] as const,
    queryFn: () => getNbaAction(name),
    enabled: Boolean(name),
    ...options,
  });
}

export function useNbaActionTypesQuery<
  TData = ListNbaActionTypesResponse,
>(
  options?: Omit<
    UseQueryOptions<
      ListNbaActionTypesResponse,
      Error,
      TData,
      typeof nbaActionsKeys.types
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: nbaActionsKeys.types,
    queryFn: () => listNbaActionTypes(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useNbaTimeSlotsQuery<TData = ListNbaTimeSlotsResponse>(
  options?: Omit<
    UseQueryOptions<
      ListNbaTimeSlotsResponse,
      Error,
      TData,
      typeof nbaActionsKeys.timeSlots
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: nbaActionsKeys.timeSlots,
    queryFn: () => listNbaTimeSlots(),
    staleTime: Infinity,
    ...options,
  });
}

export function useUpdateNbaActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNbaActionPayload) => updateNbaAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nbaActionsKeys.all });
    },
  });
}

export function useCreateNbaActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNbaActionPayload) => createNbaAction(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaActionsKeys.all }),
  });
}

export function useDeleteNbaActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => deleteNbaAction(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nbaActionsKeys.all }),
  });
}
