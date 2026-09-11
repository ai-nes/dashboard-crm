import type {
  AdminAdmissionProfileTemplateCatalog,
  AdmissionDocumentTypeCatalog,
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

function baseUrl(value?: string): string {
  return (value ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
}

function unwrapMessage(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const root = value as Record<string, unknown>;
  return root.message &&
    typeof root.message === "object" &&
    !Array.isArray(root.message)
    ? (root.message as Record<string, unknown>)
    : root;
}

async function request(
  url: string,
  init: RequestInit = {},
  frappeBaseUrl?: string,
): Promise<Record<string, unknown>> {
  const csrfToken = frappeBaseUrl
    ? await browserCsrfToken(frappeBaseUrl)
    : null;
  const isMultipart =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body && !isMultipart
      ? { "Content-Type": "application/json" }
      : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (csrfToken) headers["X-Frappe-CSRF-Token"] = csrfToken;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = payload?.error ?? {};
    throw new AdmissionProfileCatalogApiError(
      response.status,
      typeof error.code === "string"
        ? error.code
        : "ADMISSION_CATALOG_REQUEST_FAILED",
      typeof error.message === "string"
        ? error.message
        : typeof payload?.exception === "string"
          ? payload.exception
          : `Không thể gọi API tuyển sinh (${response.status}).`,
    );
  }
  return unwrapMessage(payload);
}

async function browserCsrfToken(frappeBaseUrl: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const cookieToken = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("csrf_token="))
    ?.split("=")
    .slice(1)
    .join("=");
  if (cookieToken) return decodeURIComponent(cookieToken);

  try {
    const response = await fetch(
      `${frappeBaseUrl}/api/method/crm.api.session.me`,
      {
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      message?: { csrf_token?: unknown };
    } | null;
    return typeof payload?.message?.csrf_token === "string"
      ? payload.message.csrf_token
      : null;
  } catch {
    return null;
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
  options: { baseUrl?: string; admissionYear?: string; search?: string } = {},
): Promise<AdmissionProfileCatalog> {
  const root = baseUrl(options.baseUrl);
  if (!root) {
    throw new AdmissionProfileCatalogApiError(
      503,
      "ADMISSION_CATALOG_UNAVAILABLE",
      "Chưa cấu hình API Frappe CRM cho catalog tuyển sinh.",
    );
  }
  const params = new URLSearchParams();
  if (options.admissionYear) params.set("admission_year", options.admissionYear);
  if (options.search?.trim()) params.set("search", options.search.trim());
  const query = params.toString() ? `?${params.toString()}` : "";
  const result = await request(
    `${root}/api/method/crm.api.admission_profile_templates.get_admission_profile_catalog${query}`,
    {},
    root,
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
    Array.isArray(candidate.templates) &&
    Array.isArray(candidate.documentTypes)
  );
}

function isDocumentTypeCatalog(value: unknown): value is AdmissionDocumentTypeCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Array.isArray((value as Partial<AdmissionDocumentTypeCatalog>).documentTypes);
}

function isMethodCatalog(value: unknown): value is AdmissionMethodCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Array.isArray((value as Partial<AdmissionMethodCatalog>).methods);
}

function ensureApiRoot(root: string, message: string): void {
  if (!root) {
    throw new AdmissionProfileCatalogApiError(
      503,
      "ADMISSION_PROFILE_TEMPLATE_UNAVAILABLE",
      message,
    );
  }
}

export async function listAdmissionProfileTemplates(
  options: {
    baseUrl?: string;
    status?: AdmissionProfileTemplateStatus;
    search?: string;
  } = {},
): Promise<AdminAdmissionProfileTemplateCatalog> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(
    root,
    "Chưa cấu hình API Frappe CRM để quản lý loại hồ sơ nhập học.",
  );
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.search?.trim()) params.set("search", options.search.trim());
  const query = params.toString() ? `?${params.toString()}` : "";
  const result = await request(
    `${root}/api/method/crm.api.admission_profile_templates.list_admission_profile_templates${query}`,
    {},
    root,
  );
  if (!isAdminTemplateCatalog(result)) {
    throw new AdmissionProfileCatalogApiError(
      502,
      "INVALID_ADMISSION_PROFILE_TEMPLATE_RESPONSE",
      "Phản hồi danh mục loại hồ sơ không hợp lệ.",
    );
  }
  return result;
}

export async function createAdmissionProfileTemplate(
  data: AdmissionProfileTemplateMutationInput,
  options: { baseUrl?: string } = {},
): Promise<AdmissionProfileTemplateOption> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để tạo loại hồ sơ.");
  const result = await request(
    `${root}/api/method/crm.api.admission_profile_templates.create_admission_profile_template`,
    { method: "POST", body: JSON.stringify({ data }) },
    root,
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
  options: { baseUrl?: string } = {},
): Promise<AdmissionProfileTemplateOption> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để sửa loại hồ sơ.");
  const result = await request(
    `${root}/api/method/crm.api.admission_profile_templates.update_admission_profile_template`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        data: input.data,
        expected_modified: input.expectedModified,
      }),
    },
    root,
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
  options: { baseUrl?: string } = {},
): Promise<AdmissionProfileTemplateOption> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(
    root,
    "Chưa cấu hình API Frappe CRM để cập nhật trạng thái loại hồ sơ.",
  );
  const result = await request(
    `${root}/api/method/crm.api.admission_profile_templates.transition_admission_profile_template`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        status: input.status,
        expected_modified: input.expectedModified,
      }),
    },
    root,
  );
  return result as unknown as AdmissionProfileTemplateOption;
}

export interface DeleteAdmissionProfileTemplateInput {
  name: string;
  expectedModified?: string | null;
}

export async function deleteAdmissionProfileTemplate(
  input: DeleteAdmissionProfileTemplateInput,
  options: { baseUrl?: string } = {},
): Promise<{ name: string; deleted: boolean }> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để xóa loại hồ sơ.");
  const result = await request(
    `${root}/api/method/crm.api.admission_profile_templates.delete_admission_profile_template`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        expected_modified: input.expectedModified,
      }),
    },
    root,
  );
  return result as unknown as { name: string; deleted: boolean };
}

export async function listAdmissionDocumentTypes(
  options: { baseUrl?: string; search?: string; includeArchived?: boolean } = {},
): Promise<AdmissionDocumentTypeCatalog> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để quản lý loại tài liệu.");
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.includeArchived !== undefined) {
    params.set("include_archived", options.includeArchived ? "1" : "0");
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.list_admission_document_types${query}`,
    {},
    root,
  );
  if (!isDocumentTypeCatalog(result)) {
    throw new AdmissionProfileCatalogApiError(
      502,
      "INVALID_ADMISSION_DOCUMENT_TYPE_RESPONSE",
      "Phản hồi danh mục loại tài liệu không hợp lệ.",
    );
  }
  return result;
}

export async function createAdmissionDocumentType(
  data: AdmissionDocumentTypeMutationInput,
  options: { baseUrl?: string } = {},
): Promise<AdmissionDocumentTypeCatalog["documentTypes"][number]> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để tạo loại tài liệu.");
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.create_admission_document_type`,
    { method: "POST", body: JSON.stringify({ data }) },
    root,
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
  options: { baseUrl?: string } = {},
): Promise<AdmissionDocumentTypeCatalog["documentTypes"][number]> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để sửa loại tài liệu.");
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.update_admission_document_type`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        data: input.data,
        expected_modified: input.expectedModified,
      }),
    },
    root,
  );
  return result as unknown as AdmissionDocumentTypeCatalog["documentTypes"][number];
}

export interface DeleteAdmissionDocumentTypeInput {
  name: string;
  expectedModified?: string | null;
}

export async function deleteAdmissionDocumentType(
  input: DeleteAdmissionDocumentTypeInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để xóa loại tài liệu.");
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.delete_admission_document_type`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        expected_modified: input.expectedModified,
      }),
    },
    root,
  );
  return result as unknown as { deleted: string };
}

export async function listAdmissionMethods(
  options: { baseUrl?: string; search?: string; includeDisabled?: boolean } = {},
): Promise<AdmissionMethodCatalog> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để quản lý phương thức xét tuyển.");
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.includeDisabled !== undefined) {
    params.set("include_disabled", options.includeDisabled ? "1" : "0");
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.list_admission_methods${query}`,
    {},
    root,
  );
  if (!isMethodCatalog(result)) {
    throw new AdmissionProfileCatalogApiError(
      502,
      "INVALID_ADMISSION_METHOD_RESPONSE",
      "Phản hồi danh mục phương thức xét tuyển không hợp lệ.",
    );
  }
  return result;
}

export async function createAdmissionMethod(
  data: AdmissionMethodMutationInput,
  options: { baseUrl?: string } = {},
): Promise<AdmissionMethodCatalog["methods"][number]> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để tạo phương thức xét tuyển.");
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.create_admission_method`,
    { method: "POST", body: JSON.stringify({ data }) },
    root,
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
  options: { baseUrl?: string } = {},
): Promise<AdmissionMethodCatalog["methods"][number]> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để sửa phương thức xét tuyển.");
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.update_admission_method`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        data: input.data,
        expected_modified: input.expectedModified,
      }),
    },
    root,
  );
  return result as unknown as AdmissionMethodCatalog["methods"][number];
}

export interface DeleteAdmissionMethodInput {
  name: string;
  expectedModified?: string | null;
}

export async function deleteAdmissionMethod(
  input: DeleteAdmissionMethodInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  const root = baseUrl(options.baseUrl);
  ensureApiRoot(root, "Chưa cấu hình API Frappe CRM để xóa phương thức xét tuyển.");
  const result = await request(
    `${root}/api/method/crm.api.admission_catalog.delete_admission_method`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        expected_modified: input.expectedModified,
      }),
    },
    root,
  );
  return result as unknown as { deleted: string };
}

export async function createAdmissionApplication(
  input: CreateAdmissionApplicationInput,
  options: { baseUrl?: string } = {},
): Promise<CreateAdmissionApplicationResponse> {
  const root = baseUrl(options.baseUrl);
  if (!root) {
    throw new AdmissionProfileCatalogApiError(
      503,
      "ADMISSION_APPLICATION_UNAVAILABLE",
      "Chưa cấu hình API Frappe CRM để tạo hồ sơ nhập học.",
    );
  }
  const result = await request(
    `${root}/api/method/crm.api.admission_application.create_application`,
    {
      method: "POST",
      body: JSON.stringify({
        student: input.student,
        values: input.values,
        expected_revision: input.expectedRevision,
        idempotency_key: input.idempotencyKey,
      }),
    },
    root,
  );
  return result as unknown as CreateAdmissionApplicationResponse;
}

export async function uploadStudentAdmissionDocument(
  input: UploadStudentAdmissionDocumentInput,
  options: { baseUrl?: string } = {},
): Promise<UploadStudentAdmissionDocumentResponse> {
  const root = baseUrl(options.baseUrl);
  if (!root) {
    throw new AdmissionProfileCatalogApiError(
      503,
      "ADMISSION_DOCUMENT_UPLOAD_UNAVAILABLE",
      "Chưa cấu hình API Frappe CRM để tải tài liệu nhập học.",
    );
  }
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

  const result = await request(
    `${root}/api/method/crm.api.student_documents.upload_document`,
    { method: "POST", body },
    root,
  );
  return result as unknown as UploadStudentAdmissionDocumentResponse;
}

export async function updateAdmissionApplicationPreference(
  input: UpdateAdmissionApplicationPreferenceInput,
  options: { baseUrl?: string } = {},
): Promise<UpdateAdmissionApplicationPreferenceResponse> {
  const root = baseUrl(options.baseUrl);
  if (!root) {
    throw new AdmissionProfileCatalogApiError(
      503,
      "ADMISSION_APPLICATION_UNAVAILABLE",
      "Chưa cấu hình API Frappe CRM để cập nhật hồ sơ nhập học.",
    );
  }
  const result = await request(
    `${root}/api/method/crm.api.admission_application.update_preference`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    root,
  );
  return result as unknown as UpdateAdmissionApplicationPreferenceResponse;
}

export async function updateAdmissionApplication(
  input: UpdateAdmissionApplicationInput,
  options: { baseUrl?: string } = {},
): Promise<UpdateAdmissionApplicationResponse> {
  const root = baseUrl(options.baseUrl);
  if (!root) {
    throw new AdmissionProfileCatalogApiError(
      503,
      "ADMISSION_APPLICATION_UNAVAILABLE",
      "Chưa cấu hình API Frappe CRM để cập nhật hồ sơ nhập học.",
    );
  }
  const result = await request(
    `${root}/api/method/crm.api.admission_application.update_application`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    root,
  );
  return result as unknown as UpdateAdmissionApplicationResponse;
}
