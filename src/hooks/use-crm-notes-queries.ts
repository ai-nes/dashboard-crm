"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
  type CreateNotePayload,
  type CRMNote,
  type ListNotesParams,
  type ListNotesResponse,
  type UpdateNotePayload,
} from "@/services/api/crm-notes";

export const crmNotesKeys = {
  all: ["crm-notes"] as const,
  list: (params: ListNotesParams) => ["crm-notes", "list", params] as const,
  detail: (name: string) => ["crm-notes", "detail", name] as const,
};

export function useCrmNotesQuery<TData = ListNotesResponse>(
  params: ListNotesParams,
  options?: Omit<
    UseQueryOptions<
      ListNotesResponse,
      Error,
      TData,
      ReturnType<typeof crmNotesKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmNotesKeys.list(params),
    queryFn: () => listNotes(params),
    enabled: Boolean(params.referenceDocname),
    ...options,
  });
}

export function useCrmNoteDetailQuery<TData = CRMNote>(
  name: string,
  options?: Omit<
    UseQueryOptions<
      CRMNote,
      Error,
      TData,
      ReturnType<typeof crmNotesKeys.detail>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: crmNotesKeys.detail(name),
    queryFn: () => getNote(name),
    enabled: Boolean(name),
    ...options,
  });
}

export function useCreateCrmNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmNotesKeys.all });
    },
  });
}

export function useUpdateCrmNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateNotePayload) => updateNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmNotesKeys.all });
    },
  });
}

export function useDeleteCrmNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteNote(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmNotesKeys.all });
    },
  });
}

