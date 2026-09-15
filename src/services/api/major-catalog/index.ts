import type {
  DeleteMajorGroupInput,
  DeleteMajorInput,
  MajorCatalog,
  MajorGroupCatalog,
  MajorGroupMutationInput,
  MajorGroupOption,
  MajorMutationInput,
  MajorOption,
  UpdateMajorGroupInput,
  UpdateMajorInput,
} from "./types";

export type * from "./types";

export class MajorCatalogApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "MajorCatalogApiError";
  }
}

function getBaseUrl(value?: string): string {
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

async function browserCsrfToken(baseUrl: string): Promise<string | null> {
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
    const response = await fetch(`${baseUrl}/api/method/crm.api.session.me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
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

async function request(
  url: string,
  init: RequestInit = {},
  frappeBaseUrl?: string,
): Promise<Record<string, unknown>> {
  const csrfToken = frappeBaseUrl
    ? await browserCsrfToken(frappeBaseUrl)
    : null;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
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
    throw new MajorCatalogApiError(
      response.status,
      typeof error.code === "string"
        ? error.code
        : "MAJOR_CATALOG_REQUEST_FAILED",
      typeof error.message === "string"
        ? error.message
        : typeof payload?.exception === "string"
          ? payload.exception
          : `Không thể gọi API danh mục ngành (${response.status}).`,
    );
  }
  return unwrapMessage(payload);
}

function ensureRoot(root: string, message: string): void {
  if (!root)
    throw new MajorCatalogApiError(503, "MAJOR_CATALOG_UNAVAILABLE", message);
}

function isGroupCatalog(value: unknown): value is MajorGroupCatalog {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray((value as Partial<MajorGroupCatalog>).groups),
  );
}

function isMajorCatalog(value: unknown): value is MajorCatalog {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray((value as Partial<MajorCatalog>).majors),
  );
}

function queryString(params: URLSearchParams): string {
  const value = params.toString();
  return value ? `?${value}` : "";
}

function normalizePagination<T extends MajorGroupCatalog | MajorCatalog>(
  result: T,
  options: { start?: number; pageLength?: number },
): T {
  if (options.start === undefined && options.pageLength === undefined)
    return result;
  return {
    ...result,
    total: Number(result.total ?? 0),
    start: Number(result.start ?? options.start ?? 0),
    pageLength: Number(result.pageLength ?? options.pageLength ?? 20),
  };
}

export async function listMajorGroups(
  options: {
    baseUrl?: string;
    search?: string;
    includeDisabled?: boolean;
    enabled?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<MajorGroupCatalog> {
  const root = getBaseUrl(options.baseUrl);
  ensureRoot(root, "Chưa cấu hình API Frappe CRM để tải nhóm ngành.");
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.includeDisabled !== undefined)
    params.set("include_disabled", String(options.includeDisabled));
  if (options.enabled !== undefined)
    params.set("enabled", String(options.enabled));
  if (options.start !== undefined) params.set("start", String(options.start));
  if (options.pageLength !== undefined)
    params.set("page_length", String(options.pageLength));
  const result = await request(
    `${root}/api/method/crm.api.major_catalog.list_major_groups${queryString(params)}`,
    {},
    root,
  );
  if (!isGroupCatalog(result)) {
    throw new MajorCatalogApiError(
      502,
      "INVALID_MAJOR_GROUP_RESPONSE",
      "Phản hồi nhóm ngành không hợp lệ.",
    );
  }
  return normalizePagination(result, options);
}

export async function listMajors(
  options: {
    baseUrl?: string;
    search?: string;
    group?: string;
    includeInactive?: boolean;
    isActive?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<MajorCatalog> {
  const root = getBaseUrl(options.baseUrl);
  ensureRoot(root, "Chưa cấu hình API Frappe CRM để tải ngành học.");
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.group) params.set("group", options.group);
  if (options.includeInactive !== undefined)
    params.set("include_inactive", String(options.includeInactive));
  if (options.isActive !== undefined)
    params.set("is_active", String(options.isActive));
  if (options.start !== undefined) params.set("start", String(options.start));
  if (options.pageLength !== undefined)
    params.set("page_length", String(options.pageLength));
  const result = await request(
    `${root}/api/method/crm.api.major_catalog.list_majors${queryString(params)}`,
    {},
    root,
  );
  if (!isMajorCatalog(result)) {
    throw new MajorCatalogApiError(
      502,
      "INVALID_MAJOR_RESPONSE",
      "Phản hồi ngành học không hợp lệ.",
    );
  }
  return normalizePagination(result, options);
}

async function mutate<T>(
  method: string,
  data: Record<string, unknown>,
  message: string,
  options: { baseUrl?: string } = {},
): Promise<T> {
  const root = getBaseUrl(options.baseUrl);
  ensureRoot(root, message);
  return (await request(
    `${root}/api/method/crm.api.major_catalog.${method}`,
    { method: "POST", body: JSON.stringify(data) },
    root,
  )) as unknown as T;
}

export function createMajorGroup(
  data: MajorGroupMutationInput,
  options: { baseUrl?: string } = {},
): Promise<MajorGroupOption> {
  return mutate(
    "create_major_group",
    { data },
    "Chưa cấu hình API Frappe CRM để tạo nhóm ngành.",
    options,
  );
}

export function updateMajorGroup(
  input: UpdateMajorGroupInput,
  options: { baseUrl?: string } = {},
): Promise<MajorGroupOption> {
  return mutate(
    "update_major_group",
    {
      name: input.name,
      data: input.data,
      expected_modified: input.expectedModified,
    },
    "Chưa cấu hình API Frappe CRM để sửa nhóm ngành.",
    options,
  );
}

export function deleteMajorGroup(
  input: DeleteMajorGroupInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  return mutate(
    "delete_major_group",
    { name: input.name, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để xóa nhóm ngành.",
    options,
  );
}

export function createMajor(
  data: MajorMutationInput,
  options: { baseUrl?: string } = {},
): Promise<MajorOption> {
  return mutate(
    "create_major",
    { data },
    "Chưa cấu hình API Frappe CRM để tạo ngành học.",
    options,
  );
}

export function updateMajor(
  input: UpdateMajorInput,
  options: { baseUrl?: string } = {},
): Promise<MajorOption> {
  return mutate(
    "update_major",
    {
      name: input.name,
      data: input.data,
      expected_modified: input.expectedModified,
    },
    "Chưa cấu hình API Frappe CRM để sửa ngành học.",
    options,
  );
}

export function deleteMajor(
  input: DeleteMajorInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  return mutate(
    "delete_major",
    { name: input.name, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để xóa ngành học.",
    options,
  );
}
