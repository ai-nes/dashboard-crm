"use client";

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getDirectorStudents,
  getStudent360,
  getStudentChatwootInteractions,
} from "@/services/api/students";
import type {
  DirectorStudentsParams,
  DirectorStudentsResponse,
  StudentChatwootInteractionsResponse,
  Student360Data,
} from "@/services/api/students";

export const studentsKeys = {
  all: ["students"] as const,
  directorStudents: (params?: DirectorStudentsParams) => ["director-students", params] as const,
  student360: (studentId: string) => ["student-360", studentId] as const,
  studentChatwootInteractions: (studentId: string) => ["student-chatwoot-interactions", studentId] as const,
};

export function useDirectorStudentsQuery<TData = DirectorStudentsResponse>(
  params?: DirectorStudentsParams,
  options?: Omit<UseQueryOptions<DirectorStudentsResponse, Error, TData, ReturnType<typeof studentsKeys.directorStudents>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentsKeys.directorStudents(params),
    queryFn: () => getDirectorStudents(params),
    ...options,
  });
}

export function useStudent360Query<TData = Student360Data | null>(
  studentId: string,
  options?: Omit<UseQueryOptions<Student360Data | null, Error, TData, ReturnType<typeof studentsKeys.student360>>, "queryKey" | "queryFn">,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey: studentsKeys.student360(studentId),
    queryFn: () => getStudent360(studentId),
    ...options,
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
    ...options,
  });
}

