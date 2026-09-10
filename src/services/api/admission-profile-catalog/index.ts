import type {
  AdmissionProfileCatalog,
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
    Array.isArray(candidate.templates)
  );
}

export async function getAdmissionProfileCatalog(
  options: { baseUrl?: string; admissionYear?: string } = {},
): Promise<AdmissionProfileCatalog> {
  const root = baseUrl(options.baseUrl);
  if (!root) {
    throw new AdmissionProfileCatalogApiError(
      503,
      "ADMISSION_CATALOG_UNAVAILABLE",
      "Chưa cấu hình API Frappe CRM cho catalog tuyển sinh.",
    );
  }
  const query = options.admissionYear
    ? `?admission_year=${encodeURIComponent(options.admissionYear)}`
    : "";
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
