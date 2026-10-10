import type {
  AdminAdmissionProfileTemplateCatalog,
  AdmissionDocumentTypeCatalog,
  AdmissionDocumentTypeOption,
  AdmissionDocumentTypeMutationInput,
  AdmissionMethodCatalog,
  AdmissionMethodMutationInput,
  AdmissionProfileCatalog,
  AdmissionProfileTemplateMutationInput,
  AdmissionProfileTemplateOption,
  AdmissionProfileTemplateStatus,
  CreateAdmissionApplicationInput,
  CreateAdmissionApplicationResponse,
  UploadStudentAdmissionDocumentInput,
  UploadStudentAdmissionDocumentResponse,
  UpdateAdmissionApplicationInput,
  UpdateAdmissionApplicationResponse,
  UpdateAdmissionApplicationPreferenceInput,
  UpdateAdmissionApplicationPreferenceResponse,
} from "./types";

import { NestApiError } from "../nest/nest-client";
import { NOT_HANDLED } from "../nest/nest-handler";
import {
  nestAdmissionCatalogHandler,
  uploadProfileDocument,
} from "../nest/nest-admission-catalog-router";

export type * from "./types";

export class AdmissionProfileCatalogApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdmissionProfileCatalogApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapError(error: unknown): never {
  if (error instanceof NestApiError) {
    throw new AdmissionProfileCatalogApiError(
      error.status,
      error.code,
      error.message,
    );
  }
  throw error;
}

async function call(
  operation: string,
  params: Record<string, string | undefined>,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const result = await nestAdmissionCatalogHandler(
      `crm.api.${operation}`,
      params,
      body,
    );
    if (result === NOT_HANDLED) {
      throw new AdmissionProfileCatalogApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return asRecord(result);
  } catch (error) {
    return mapError(error);
  }
}
function isCatalog(value: unknown): value is AdmissionProfileCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<AdmissionProfileCatalog>;
  return (
    Array.isArray(candidate.methods) &&
    Array.isArray(candidate.years) &&
    Array.isArray(candidate.offerings) &&
    Array.isArray(candidate.documentTypes) &&
    Array.isArray(candidate.templates) &&
    Array.isArray(candidate.specialTemplates)
  );
}

export async function getAdmissionProfileCatalog(
  options: { admissionYear?: string; search?: string } = {},
): Promise<AdmissionProfileCatalog> {
  const params = new URLSearchParams();
  if (options.admissionYear)
    params.set("admission_year", options.admissionYear);
  if (options.search?.trim()) params.set("search", options.search.trim());
  const result = await call(
    "admission_profile_templates.get_admission_profile_catalog",
    Object.fromEntries(params),
  );
  if (!isCatalog(result)) {
    throw new AdmissionProfileCatalogApiError(
      502,
      "INVALID_ADMISSION_CATALOG_RESPONSE",
      "Phản hồi catalog tuyển sinh không hợp lệ.",
    );
  }
  return result;
}

function isAdminTemplateCatalog(
  value: unknown,
): value is AdminAdmissionProfileTemplateCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<AdminAdmissionProfileTemplateCatalog>;
  return (
    Array.isArray(candidate.templates) && Array.isArray(candidate.documentTypes)
  );
}

function isDocumentTypeCatalog(
  value: unknown,
): value is AdmissionDocumentTypeCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Array.isArray(
    (value as Partial<AdmissionDocumentTypeCatalog>).documentTypes,
  );
}

function isMethodCatalog(value: unknown): value is AdmissionMethodCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Array.isArray((value as Partial<AdmissionMethodCatalog>).methods);
}

export async function listAdmissionProfileTemplates(
  options: {
    status?: AdmissionProfileTemplateStatus;
    search?: string;
    templateKind?: AdmissionProfileTemplateOption["templateKind"] | "all";
    start?: number;
    pageLength?: number;
  } = {},
): Promise<AdminAdmissionProfileTemplateCatalog> {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.templateKind && options.templateKind !== "all")
    params.set("template_kind", options.templateKind);
  if (options.start !== undefined) params.set("start", String(options.start));
  if (options.pageLength !== undefined)
    params.set("page_length", String(options.pageLength));
  const result = await call(
    "admission_profile_templates.list_admission_profile_templates",
    Object.fromEntries(params),
  );
  if (!isAdminTemplateCatalog(result)) {
    throw new AdmissionProfileCatalogApiError(
      502,
      "INVALID_ADMISSION_PROFILE_TEMPLATE_RESPONSE",
      "Phản hồi danh mục loại hồ sơ không hợp lệ.",
    );
  }
  if (options.start === undefined && options.pageLength === undefined) {
    return result;
  }
  const paginatedResult = result as typeof result & { page_length?: unknown };
  return {
    ...result,
    total: Number(result.total ?? result.templates.length),
    start: Number(result.start ?? options.start ?? 0),
    pageLength: Number(
      result.pageLength ??
        paginatedResult.page_length ??
        options.pageLength ??
        20,
    ),
  };
}

export async function createAdmissionProfileTemplate(
  data: AdmissionProfileTemplateMutationInput,
): Promise<AdmissionProfileTemplateOption> {
  const result = await call(
    "admission_profile_templates.create_admission_profile_template",
    {},
    { data },
  );
  return result as unknown as AdmissionProfileTemplateOption;
}

export interface UpdateAdmissionProfileTemplateInput {
  name: string;
  data: AdmissionProfileTemplateMutationInput;
  expectedModified?: string | null;
}

export async function updateAdmissionProfileTemplate(
  input: UpdateAdmissionProfileTemplateInput,
): Promise<AdmissionProfileTemplateOption> {
  const result = await call(
    "admission_profile_templates.update_admission_profile_template",
    {},
    {
      name: input.name,
      data: input.data,
      expected_modified: input.expectedModified,
    },
  );
  return result as unknown as AdmissionProfileTemplateOption;
}

export interface TransitionAdmissionProfileTemplateInput {
  name: string;
  status: AdmissionProfileTemplateStatus;
  expectedModified?: string | null;
}

export async function transitionAdmissionProfileTemplate(
  input: TransitionAdmissionProfileTemplateInput,
): Promise<AdmissionProfileTemplateOption> {
  const result = await call(
    "admission_profile_templates.transition_admission_profile_template",
    {},
    {
      name: input.name,
      status: input.status,
      expected_modified: input.expectedModified,
    },
  );
  return result as unknown as AdmissionProfileTemplateOption;
}

export interface DeleteAdmissionProfileTemplateInput {
  name: string;
  expectedModified?: string | null;
}

export async function deleteAdmissionProfileTemplate(
  input: DeleteAdmissionProfileTemplateInput,
): Promise<{ name: string; deleted: boolean }> {
  const result = await call(
    "admission_profile_templates.delete_admission_profile_template",
    {},
    {
      name: input.name,
      expected_modified: input.expectedModified,
    },
  );
  return result as unknown as { name: string; deleted: boolean };
}

export async function listAdmissionDocumentTypes(
  options: {
    search?: string;
    includeArchived?: boolean;
    status?: AdmissionDocumentTypeOption["status"] | "all";
    start?: number;
    pageLength?: number;
  } = {},
): Promise<AdmissionDocumentTypeCatalog> {
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.includeArchived !== undefined) {
    params.set("include_archived", options.includeArchived ? "1" : "0");
  }
  if (options.status && options.status !== "all")
    params.set("status", options.status);
  if (options.start !== undefined) params.set("start", String(options.start));
  if (options.pageLength !== undefined)
    params.set("page_length", String(options.pageLength));
  const result = await call(
    "admission_catalog.list_admission_document_types",
    Object.fromEntries(params),
  );
  if (!isDocumentTypeCatalog(result)) {
    throw new AdmissionProfileCatalogApiError(
      502,
      "INVALID_ADMISSION_DOCUMENT_TYPE_RESPONSE",
      "Phản hồi danh mục loại tài liệu không hợp lệ.",
    );
  }
  if (options.start === undefined && options.pageLength === undefined) {
    return result;
  }
  const paginatedResult = result as typeof result & { page_length?: unknown };
  return {
    ...result,
    total: Number(result.total ?? result.documentTypes.length),
    start: Number(result.start ?? options.start ?? 0),
    pageLength: Number(
      result.pageLength ??
        paginatedResult.page_length ??
        options.pageLength ??
        20,
    ),
  };
}

export async function createAdmissionDocumentType(
  data: AdmissionDocumentTypeMutationInput,
): Promise<AdmissionDocumentTypeCatalog["documentTypes"][number]> {
  const result = await call(
    "admission_catalog.create_admission_document_type",
    {},
    { data },
  );
  return result as unknown as AdmissionDocumentTypeCatalog["documentTypes"][number];
}

export interface UpdateAdmissionDocumentTypeInput {
  name: string;
  data: AdmissionDocumentTypeMutationInput;
  expectedModified?: string | null;
}

export async function updateAdmissionDocumentType(
  input: UpdateAdmissionDocumentTypeInput,
): Promise<AdmissionDocumentTypeCatalog["documentTypes"][number]> {
  const result = await call(
    "admission_catalog.update_admission_document_type",
    {},
    {
      name: input.name,
      data: input.data,
      expected_modified: input.expectedModified,
    },
  );
  return result as unknown as AdmissionDocumentTypeCatalog["documentTypes"][number];
}

export interface DeleteAdmissionDocumentTypeInput {
  name: string;
  expectedModified?: string | null;
}

export async function deleteAdmissionDocumentType(
  input: DeleteAdmissionDocumentTypeInput,
): Promise<{ deleted: string }> {
  const result = await call(
    "admission_catalog.delete_admission_document_type",
    {},
    {
      name: input.name,
      expected_modified: input.expectedModified,
    },
  );
  return result as unknown as { deleted: string };
}

export async function listAdmissionMethods(
  options: {
    search?: string;
    includeDisabled?: boolean;
    enabled?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<AdmissionMethodCatalog> {
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.includeDisabled !== undefined) {
    params.set("include_disabled", options.includeDisabled ? "1" : "0");
  }
  if (options.enabled !== undefined)
    params.set("enabled", options.enabled ? "1" : "0");
  if (options.start !== undefined) params.set("start", String(options.start));
  if (options.pageLength !== undefined)
    params.set("page_length", String(options.pageLength));
  const result = await call(
    "admission_catalog.list_admission_methods",
    Object.fromEntries(params),
  );
  if (!isMethodCatalog(result)) {
    throw new AdmissionProfileCatalogApiError(
      502,
      "INVALID_ADMISSION_METHOD_RESPONSE",
      "Phản hồi danh mục phương thức xét tuyển không hợp lệ.",
    );
  }
  if (options.start === undefined && options.pageLength === undefined) {
    return result;
  }
  const paginatedResult = result as typeof result & { page_length?: unknown };
  return {
    ...result,
    total: Number(result.total ?? result.methods.length),
    start: Number(result.start ?? options.start ?? 0),
    pageLength: Number(
      result.pageLength ??
        paginatedResult.page_length ??
        options.pageLength ??
        20,
    ),
  };
}

export async function createAdmissionMethod(
  data: AdmissionMethodMutationInput,
): Promise<AdmissionMethodCatalog["methods"][number]> {
  const result = await call(
    "admission_catalog.create_admission_method",
    {},
    { data },
  );
  return result as unknown as AdmissionMethodCatalog["methods"][number];
}

export interface UpdateAdmissionMethodInput {
  name: string;
  data: AdmissionMethodMutationInput;
  expectedModified?: string | null;
}

export async function updateAdmissionMethod(
  input: UpdateAdmissionMethodInput,
): Promise<AdmissionMethodCatalog["methods"][number]> {
  const result = await call(
    "admission_catalog.update_admission_method",
    {},
    {
      name: input.name,
      data: input.data,
      expected_modified: input.expectedModified,
    },
  );
  return result as unknown as AdmissionMethodCatalog["methods"][number];
}

export interface DeleteAdmissionMethodInput {
  name: string;
  expectedModified?: string | null;
}

export async function deleteAdmissionMethod(
  input: DeleteAdmissionMethodInput,
): Promise<{ deleted: string }> {
  const result = await call(
    "admission_catalog.delete_admission_method",
    {},
    {
      name: input.name,
      expected_modified: input.expectedModified,
    },
  );
  return result as unknown as { deleted: string };
}

export async function createAdmissionApplication(
  input: CreateAdmissionApplicationInput,
): Promise<CreateAdmissionApplicationResponse> {
  const result = await call(
    "admission_application.create_application",
    {},
    {
      student: input.student,
      values: input.values,
      expected_revision: input.expectedRevision,
      idempotency_key: input.idempotencyKey,
    },
  );
  return result as unknown as CreateAdmissionApplicationResponse;
}

export async function uploadStudentAdmissionDocument(
  input: UploadStudentAdmissionDocumentInput,
): Promise<UploadStudentAdmissionDocumentResponse> {
  if (!input.file || !input.file.name) {
    throw new AdmissionProfileCatalogApiError(
      400,
      "INVALID_FILE",
      "Vui lòng chọn tài liệu cần tải lên.",
    );
  }

  const body = new FormData();
  body.append("student", input.student);
  body.append("profile", input.profile);
  body.append("document_type", input.documentType);
  if (input.application) body.append("application", input.application);
  body.append("file", input.file, input.file.name);

  try {
    return asRecord(
      await uploadProfileDocument(body),
    ) as unknown as UploadStudentAdmissionDocumentResponse;
  } catch (error) {
    return mapError(error);
  }
}

export async function updateAdmissionApplicationPreference(
  input: UpdateAdmissionApplicationPreferenceInput,
): Promise<UpdateAdmissionApplicationPreferenceResponse> {
  const result = await call(
    "admission_application.update_preference",
    {},
    { ...input },
  );
  return result as unknown as UpdateAdmissionApplicationPreferenceResponse;
}

export async function updateAdmissionApplication(
  input: UpdateAdmissionApplicationInput,
): Promise<UpdateAdmissionApplicationResponse> {
  const result = await call(
    "admission_application.update_application",
    {},
    { ...input },
  );
  return result as unknown as UpdateAdmissionApplicationResponse;
}
