'use client'

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {
  createAdmissionDocumentType,
  createAdmissionMethod,
  deleteAdmissionDocumentType,
  deleteAdmissionMethod,
  listAdmissionDocumentTypes,
  listAdmissionMethods,
  updateAdmissionDocumentType,
  updateAdmissionMethod,
  type AdmissionDocumentTypeMutationInput,
  type AdmissionMethodMutationInput,
  type DeleteAdmissionDocumentTypeInput,
  type DeleteAdmissionMethodInput,
  type UpdateAdmissionDocumentTypeInput,
  type UpdateAdmissionMethodInput,
} from '@/services/api/admission-profile-catalog'

export const admissionCatalogKeys = {
  all: ['admission-catalog'] as const,
  documentTypes: (search: string, includeArchived: boolean) =>
    ['admission-catalog', 'document-types', search, includeArchived] as const,
  methods: (search: string, includeDisabled: boolean) =>
    ['admission-catalog', 'methods', search, includeDisabled] as const,
}

function invalidateAdmissionCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({queryKey: admissionCatalogKeys.all})
  void queryClient.invalidateQueries({
    queryKey: ['admission-profile-templates'],
  })
  void queryClient.invalidateQueries({
    queryKey: ['admission-profile-catalog'],
  })
}

export function useAdmissionDocumentTypesQuery(options: {search?: string; includeArchived?: boolean} = {}) {
  const search = options.search?.trim() ?? ''
  const includeArchived = options.includeArchived ?? true

  return useQuery({
    queryKey: admissionCatalogKeys.documentTypes(search, includeArchived),
    queryFn: () => listAdmissionDocumentTypes({search, includeArchived}),
    staleTime: 30_000,
  })
}

export function useAdmissionMethodsQuery(options: {search?: string; includeDisabled?: boolean} = {}) {
  const search = options.search?.trim() ?? ''
  const includeDisabled = options.includeDisabled ?? true

  return useQuery({
    queryKey: admissionCatalogKeys.methods(search, includeDisabled),
    queryFn: () => listAdmissionMethods({search, includeDisabled}),
    staleTime: 30_000,
  })
}

export function useCreateAdmissionDocumentTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdmissionDocumentTypeMutationInput) => createAdmissionDocumentType(data),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  })
}

export function useUpdateAdmissionDocumentTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAdmissionDocumentTypeInput) => updateAdmissionDocumentType(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  })
}

export function useDeleteAdmissionDocumentTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteAdmissionDocumentTypeInput) => deleteAdmissionDocumentType(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  })
}

export function useCreateAdmissionMethodMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdmissionMethodMutationInput) => createAdmissionMethod(data),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  })
}

export function useUpdateAdmissionMethodMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAdmissionMethodInput) => updateAdmissionMethod(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  })
}

export function useDeleteAdmissionMethodMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteAdmissionMethodInput) => deleteAdmissionMethod(input),
    onSuccess: () => invalidateAdmissionCatalog(queryClient),
  })
}
