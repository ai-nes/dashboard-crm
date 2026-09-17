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

import {
  ensureRoot as ensureFrappeRoot,
  FrappeApiError,
  getBaseUrl,
  queryString,
  request as frappeRequest,
} from "../frappe-request";

export type * from "./types";

export class MajorCatalogApiError extends FrappeApiError {
  constructor(status: number, code: string, message: string) {
    super(status, code, message);
    this.name = "MajorCatalogApiError";
  }
}

function request(
  url: string,
  init: RequestInit = {},
  frappeBaseUrl?: string,
): Promise<Record<string, unknown>> {
  return frappeRequest(url, init, frappeBaseUrl, MajorCatalogApiError);
}

function ensureRoot(root: string, message: string): void {
  ensureFrappeRoot(root, message, MajorCatalogApiError);
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
