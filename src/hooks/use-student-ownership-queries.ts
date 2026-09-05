"use client";

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  assignStudentToSales,
  getAssignableSales,
  type AssignableSalesResponse,
  type AssignStudentToSalesRequest,
  type AssignStudentToSalesResponse,
  type StudentOwnershipApiError,
} from "@/services/api/student-ownership";

export const studentOwnershipKeys = {
  all: ["student-ownership"] as const,
  assignableSales: (studentId: string, search: string) =>
    ["student-ownership", "assignable-sales", studentId, search] as const,
};

export function useAssignableSalesQuery(
  studentId: string,
  search = "",
  options?: Omit<
    UseQueryOptions<
      AssignableSalesResponse,
      StudentOwnershipApiError,
      AssignableSalesResponse,
      ReturnType<typeof studentOwnershipKeys.assignableSales>
    >,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<AssignableSalesResponse, StudentOwnershipApiError> {
  const { enabled = true, ...queryOptions } = options ?? {};

  return useQuery({
    ...queryOptions,
    queryKey: studentOwnershipKeys.assignableSales(studentId, search),
    queryFn: () => getAssignableSales(studentId, search),
    enabled: Boolean(studentId) && enabled,
  });
}

export function useAssignStudentToSalesMutation(
  options?: Omit<
    UseMutationOptions<
      AssignStudentToSalesResponse,
      StudentOwnershipApiError,
      AssignStudentToSalesRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  AssignStudentToSalesResponse,
  StudentOwnershipApiError,
  AssignStudentToSalesRequest
> {
  return useMutation({
    ...options,
    mutationFn: (request) => assignStudentToSales(request),
  });
}
