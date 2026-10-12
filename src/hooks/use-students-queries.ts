"use client";

import {
  useQuery,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getDirectorStudents,
  getStudent360,
  getStudentChatwootInteractions,
  getStudentInteractions,
} from "@/services/api/students";
import type {
  DirectorStudentsParams,
  DirectorStudentsResponse,
  StudentChatwootInteractionsResponse,
  StudentInteractionsResponse,
  Student360Data,
} from "@/services/api/students";

export const studentsKeys = {
  all: ["students"] as const,
  student360Root: ["student-360"] as const,
  directorStudentsRoot: ["director-students"] as const,
  directorStudents: (params?: DirectorStudentsParams) =>
    ["director-students", params] as const,
  assignedStudentsRoot: ["assigned-students"] as const,
  assignedStudents: (
    params?: DirectorStudentsParams,
    sessionUser?: string | null,
  ) => ["assigned-students", sessionUser ?? "anonymous", params] as const,
  student360: (studentId: string) => ["student-360", studentId] as const,
  studentHighSchoolScore: (studentId: string, admissionYear?: string | null) =>
    ["student-high-school-score", studentId, admissionYear ?? null] as const,
  studentChatwootInteractions: (studentId: string) =>
    ["student-chatwoot-interactions", studentId] as const,
  studentInteractions: (studentId: string) =>
    ["student-interactions", studentId] as const,
};

export function useDirectorStudentsQuery<TData = DirectorStudentsResponse>(
  params?: DirectorStudentsParams,
  options?: Omit<
    UseQueryOptions<
      DirectorStudentsResponse,
      Error,
      TData,
      ReturnType<typeof studentsKeys.directorStudents>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentsKeys.directorStudents(params),
    queryFn: () => getDirectorStudents(params),
    ...options,
  });
}

export function useStudent360Query<TData = Student360Data | null>(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      Student360Data | null,
      Error,
      TData,
      ReturnType<typeof studentsKeys.student360>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentsKeys.student360(studentId),
    queryFn: () => getStudent360(studentId),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Loads the students visible to the authenticated user.
 * The user id is only a cache scope; the backend derives the allowed
 * assigned/pool/team scope from the session and its capabilities.
 */
export function useAssignedStudentsQuery(
  params: DirectorStudentsParams | undefined,
  sessionUser: string | null | undefined,
  options?: Omit<
    UseQueryOptions<DirectorStudentsResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<DirectorStudentsResponse, Error> {
  const { enabled = true, ...queryOptions } = options ?? {};

  return useQuery({
    ...queryOptions,
    queryKey: studentsKeys.assignedStudents(params, sessionUser),
    queryFn: () => getDirectorStudents(params),
    enabled: Boolean(sessionUser) && enabled,
  });
}

/** Loads the current user's student scope in API pages for searchable pickers. */
export function useAssignedStudentsInfiniteQuery(
  params: Omit<DirectorStudentsParams, "page"> | undefined,
  sessionUser: string | null | undefined,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const { enabled = true, ...queryOptions } = options;
  const pageSize = params?.pageSize ?? 100;

  return useInfiniteQuery({
    queryKey: [
      ...studentsKeys.assignedStudents(params, sessionUser),
      "paged",
      pageSize,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getDirectorStudents({
        ...params,
        page: pageParam,
        pageSize,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(sessionUser) && enabled,
    ...queryOptions,
  });
}

export function useStudentChatwootInteractionsQuery<
  TData = StudentChatwootInteractionsResponse | null,
>(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      StudentChatwootInteractionsResponse | null,
      Error,
      TData,
      ReturnType<typeof studentsKeys.studentChatwootInteractions>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentsKeys.studentChatwootInteractions(studentId),
    queryFn: () => getStudentChatwootInteractions(studentId),
    enabled: Boolean(studentId),
    staleTime: 30_000,
    ...options,
  });
}

export function useStudentInteractionsQuery<
  TData = StudentInteractionsResponse | null,
>(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      StudentInteractionsResponse | null,
      Error,
      TData,
      ReturnType<typeof studentsKeys.studentInteractions>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentsKeys.studentInteractions(studentId),
    queryFn: () => getStudentInteractions(studentId),
    enabled: Boolean(studentId),
    staleTime: 30_000,
    refetchInterval: (query) =>
      query.state.data?.calls.some((call) => call.summaryStatus === "PENDING")
        ? 3_000
        : false,
    ...options,
  });
}
