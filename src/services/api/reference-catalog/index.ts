import {
  ensureRoot,
  FrappeApiError,
  getBaseUrl,
  queryString,
  request as frappeRequest,
} from "../frappe-request";

import type {
  DeleteCatalogInput,
  GeographyOptions,
  ProvinceCatalog,
  ProvinceMutationInput,
  ProvinceOption,
  SchoolAreaCatalog,
  SchoolAreaMutationInput,
  SchoolAreaOption,
  SchoolCatalog,
  SchoolMutationInput,
  SchoolOption,
  UpdateProvinceInput,
  UpdateSchoolAreaInput,
  UpdateSchoolInput,
  UpdateWardInput,
  WardCatalog,
  WardMutationInput,
  WardOption,
} from "./types";

export type * from "./types";

export class ReferenceCatalogApiError extends FrappeApiError {
  constructor(status: number, code: string, message: string) {
    super(status, code, message);
    this.name = "ReferenceCatalogApiError";
  }
}

type PaginationOptions = {
  baseUrl?: string;
  search?: string;
  start?: number;
  pageLength?: number;
};

type ListOptions = PaginationOptions & Record<string, unknown>;

function normalizePagination<T extends { total?: number; start?: number; pageLength?: number }>(
  result: T,
  options: PaginationOptions,
): T {
  if (options.start === undefined && options.pageLength === undefined) return result;
  const raw = result as T & { page_length?: number };
  return {
    ...result,
    total: Number(result.total ?? 0),
    start: Number(result.start ?? options.start ?? 0),
    pageLength: Number(result.pageLength ?? raw.page_length ?? options.pageLength ?? 20),
  };
}

function buildListParams(options: ListOptions): URLSearchParams {
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  for (const [key, value] of Object.entries(options)) {
    if (key === "baseUrl" || key === "search" || value === undefined) continue;
    const apiKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    params.set(apiKey, String(value));
  }
  return params;
}

async function listRequest<T extends { total?: number; start?: number; pageLength?: number }>(
  method: string,
  options: ListOptions,
  responseKey: string,
  unavailableMessage: string,
): Promise<T> {
  const root = getBaseUrl(options.baseUrl);
  ensureRoot(root, unavailableMessage, ReferenceCatalogApiError);
  const result = await frappeRequest(
    `${root}/api/method/crm.api.geography_catalog.${method}${queryString(buildListParams(options))}`,
    {},
    root,
    ReferenceCatalogApiError,
  );
  if (!Array.isArray(result[responseKey])) {
    throw new ReferenceCatalogApiError(
      502,
      `INVALID_${responseKey.toUpperCase()}_RESPONSE`,
      "Phản hồi danh mục tham chiếu không hợp lệ.",
    );
  }
  return normalizePagination(result as T, options);
}

export function listProvinces(options: {
  baseUrl?: string;
  search?: string;
  region?: string;
  cityType?: string;
  start?: number;
  pageLength?: number;
} = {}): Promise<ProvinceCatalog> {
  return listRequest(
    "list_provinces",
    options,
    "provinces",
    "Chưa cấu hình API Frappe CRM để tải tỉnh/thành.",
  );
}

export function listWards(options: {
  baseUrl?: string;
  search?: string;
  province?: string;
  zone?: string;
  wardType?: string;
  start?: number;
  pageLength?: number;
} = {}): Promise<WardCatalog> {
  return listRequest(
    "list_wards",
    options,
    "wards",
    "Chưa cấu hình API Frappe CRM để tải xã/phường.",
  );
}

export function listSchools(options: {
  baseUrl?: string;
  search?: string;
  province?: string;
  ward?: string;
  schoolArea?: string;
  isActive?: boolean;
  start?: number;
  pageLength?: number;
} = {}): Promise<SchoolCatalog> {
  return listRequest(
    "list_high_schools",
    options,
    "schools",
    "Chưa cấu hình API Frappe CRM để tải trường học.",
  );
}

export function listSchoolAreas(options: {
  baseUrl?: string;
  search?: string;
  includeDisabled?: boolean;
  enabled?: boolean;
  start?: number;
  pageLength?: number;
} = {}): Promise<SchoolAreaCatalog> {
  return listRequest(
    "list_school_areas",
    options,
    "schoolAreas",
    "Chưa cấu hình API Frappe CRM để tải khu vực trường.",
  );
}

export async function listGeographyOptions(options: {
  baseUrl?: string;
  province?: string;
} = {}): Promise<GeographyOptions> {
  const root = getBaseUrl(options.baseUrl);
  ensureRoot(root, "Chưa cấu hình API Frappe CRM để tải tùy chọn địa bàn.", ReferenceCatalogApiError);
  const params = new URLSearchParams();
  if (options.province) params.set("province", options.province);
  const result = await frappeRequest(
    `${root}/api/method/crm.api.geography_catalog.list_geography_options${queryString(params)}`,
    {},
    root,
    ReferenceCatalogApiError,
  );
  if (!Array.isArray(result.provinces) || !Array.isArray(result.wards)) {
    throw new ReferenceCatalogApiError(
      502,
      "INVALID_GEOGRAPHY_OPTIONS_RESPONSE",
      "Phản hồi tùy chọn địa bàn không hợp lệ.",
    );
  }
  return result as unknown as GeographyOptions;
}

async function mutate<T>(
  method: string,
  data: Record<string, unknown>,
  message: string,
  options: { baseUrl?: string } = {},
): Promise<T> {
  const root = getBaseUrl(options.baseUrl);
  ensureRoot(root, message, ReferenceCatalogApiError);
  return (await frappeRequest(
    `${root}/api/method/crm.api.geography_catalog.${method}`,
    { method: "POST", body: JSON.stringify(data) },
    root,
    ReferenceCatalogApiError,
  )) as unknown as T;
}

export function createProvince(
  data: ProvinceMutationInput,
  options: { baseUrl?: string } = {},
): Promise<ProvinceOption> {
  return mutate("create_province", { data }, "Chưa cấu hình API Frappe CRM để tạo tỉnh/thành.", options);
}

export function updateProvince(
  input: UpdateProvinceInput,
  options: { baseUrl?: string } = {},
): Promise<ProvinceOption> {
  return mutate(
    "update_province",
    { name: input.name, data: input.data, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để sửa tỉnh/thành.",
    options,
  );
}

export function deleteProvince(
  input: DeleteCatalogInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  return mutate(
    "delete_province",
    { name: input.name, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để xóa tỉnh/thành.",
    options,
  );
}

export function createWard(
  data: WardMutationInput,
  options: { baseUrl?: string } = {},
): Promise<WardOption> {
  return mutate("create_ward", { data }, "Chưa cấu hình API Frappe CRM để tạo xã/phường.", options);
}

export function updateWard(
  input: UpdateWardInput,
  options: { baseUrl?: string } = {},
): Promise<WardOption> {
  return mutate(
    "update_ward",
    { name: input.name, data: input.data, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để sửa xã/phường.",
    options,
  );
}

export function deleteWard(
  input: DeleteCatalogInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  return mutate(
    "delete_ward",
    { name: input.name, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để xóa xã/phường.",
    options,
  );
}

export function createSchool(
  data: SchoolMutationInput,
  options: { baseUrl?: string } = {},
): Promise<SchoolOption> {
  return mutate("create_high_school", { data }, "Chưa cấu hình API Frappe CRM để tạo trường học.", options);
}

export function updateSchool(
  input: UpdateSchoolInput,
  options: { baseUrl?: string } = {},
): Promise<SchoolOption> {
  return mutate(
    "update_high_school",
    { name: input.name, data: input.data, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để sửa trường học.",
    options,
  );
}

export function deleteSchool(
  input: DeleteCatalogInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  return mutate(
    "delete_high_school",
    { name: input.name, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để xóa trường học.",
    options,
  );
}

export function createSchoolArea(
  data: SchoolAreaMutationInput,
  options: { baseUrl?: string } = {},
): Promise<SchoolAreaOption> {
  return mutate(
    "create_school_area",
    { data },
    "Chưa cấu hình API Frappe CRM để tạo khu vực trường.",
    options,
  );
}

export function updateSchoolArea(
  input: UpdateSchoolAreaInput,
  options: { baseUrl?: string } = {},
): Promise<SchoolAreaOption> {
  return mutate(
    "update_school_area",
    { name: input.name, data: input.data, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để sửa khu vực trường.",
    options,
  );
}

export function deleteSchoolArea(
  input: DeleteCatalogInput,
  options: { baseUrl?: string } = {},
): Promise<{ deleted: string }> {
  return mutate(
    "delete_school_area",
    { name: input.name, expected_modified: input.expectedModified },
    "Chưa cấu hình API Frappe CRM để xóa khu vực trường.",
    options,
  );
}
