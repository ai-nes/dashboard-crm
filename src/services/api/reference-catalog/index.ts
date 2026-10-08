import { NestApiError } from "../nest/nest-client";
import { NOT_HANDLED } from "../nest/nest-handler";
import { nestGeographyHandler } from "../nest/nest-geography-router";

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

export class ReferenceCatalogApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ReferenceCatalogApiError";
  }
}

type PaginationOptions = {
  search?: string;
  start?: number;
  pageLength?: number;
};

type ListOptions = PaginationOptions & Record<string, unknown>;

function normalizePagination<
  T extends { total?: number; start?: number; pageLength?: number },
>(result: T, options: PaginationOptions): T {
  if (options.start === undefined && options.pageLength === undefined)
    return result;
  const raw = result as T & { page_length?: number };
  return {
    ...result,
    total: Number(result.total ?? 0),
    start: Number(result.start ?? options.start ?? 0),
    pageLength: Number(
      result.pageLength ?? raw.page_length ?? options.pageLength ?? 20,
    ),
  };
}

function buildListParams(
  options: ListOptions,
): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};
  if (options.search?.trim()) params.search = options.search.trim();
  for (const [key, value] of Object.entries(options)) {
    if (key === "search" || value === undefined) continue;
    const apiKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    params[apiKey] = String(value);
  }
  return params;
}

async function call(
  method: string,
  params: Record<string, string | undefined>,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const result = await nestGeographyHandler(
      `crm.api.geography_catalog.${method}`,
      params,
      body,
    );
    if (result === NOT_HANDLED) {
      throw new ReferenceCatalogApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return (result ?? {}) as Record<string, unknown>;
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new ReferenceCatalogApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

async function listRequest<
  T extends { total?: number; start?: number; pageLength?: number },
>(method: string, options: ListOptions, responseKey: string): Promise<T> {
  const result = await call(method, buildListParams(options));
  if (!Array.isArray(result[responseKey])) {
    throw new ReferenceCatalogApiError(
      502,
      `INVALID_${responseKey.toUpperCase()}_RESPONSE`,
      "Phản hồi danh mục tham chiếu không hợp lệ.",
    );
  }
  return normalizePagination(result as T, options);
}
export function listProvinces(
  options: {
    search?: string;
    region?: string;
    cityType?: string;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<ProvinceCatalog> {
  return listRequest("list_provinces", options, "provinces");
}

export function listWards(
  options: {
    search?: string;
    province?: string;
    zone?: string;
    wardType?: string;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<WardCatalog> {
  return listRequest("list_wards", options, "wards");
}

export function listSchools(
  options: {
    search?: string;
    province?: string;
    ward?: string;
    schoolArea?: string;
    isActive?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<SchoolCatalog> {
  return listRequest("list_high_schools", options, "schools");
}

export function listSchoolAreas(
  options: {
    search?: string;
    includeDisabled?: boolean;
    enabled?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<SchoolAreaCatalog> {
  return listRequest("list_school_areas", options, "schoolAreas");
}

export async function listGeographyOptions(
  options: {
    province?: string;
  } = {},
): Promise<GeographyOptions> {
  const result = await call("list_geography_options", {
    province: options.province,
  });
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
): Promise<T> {
  return (await call(method, {}, data)) as unknown as T;
}

export function createProvince(
  data: ProvinceMutationInput,
): Promise<ProvinceOption> {
  return mutate("create_province", { data });
}

export function updateProvince(
  input: UpdateProvinceInput,
): Promise<ProvinceOption> {
  return mutate("update_province", {
    name: input.name,
    data: input.data,
    expected_modified: input.expectedModified,
  });
}

export function deleteProvince(
  input: DeleteCatalogInput,
): Promise<{ deleted: string }> {
  return mutate("delete_province", {
    name: input.name,
    expected_modified: input.expectedModified,
  });
}

export function createWard(data: WardMutationInput): Promise<WardOption> {
  return mutate("create_ward", { data });
}

export function updateWard(input: UpdateWardInput): Promise<WardOption> {
  return mutate("update_ward", {
    name: input.name,
    data: input.data,
    expected_modified: input.expectedModified,
  });
}

export function deleteWard(
  input: DeleteCatalogInput,
): Promise<{ deleted: string }> {
  return mutate("delete_ward", {
    name: input.name,
    expected_modified: input.expectedModified,
  });
}

export function createSchool(data: SchoolMutationInput): Promise<SchoolOption> {
  return mutate("create_high_school", { data });
}

export function updateSchool(input: UpdateSchoolInput): Promise<SchoolOption> {
  return mutate("update_high_school", {
    name: input.name,
    data: input.data,
    expected_modified: input.expectedModified,
  });
}

export function deleteSchool(
  input: DeleteCatalogInput,
): Promise<{ deleted: string }> {
  return mutate("delete_high_school", {
    name: input.name,
    expected_modified: input.expectedModified,
  });
}

export function createSchoolArea(
  data: SchoolAreaMutationInput,
): Promise<SchoolAreaOption> {
  return mutate("create_school_area", { data });
}

export function updateSchoolArea(
  input: UpdateSchoolAreaInput,
): Promise<SchoolAreaOption> {
  return mutate("update_school_area", {
    name: input.name,
    data: input.data,
    expected_modified: input.expectedModified,
  });
}

export function deleteSchoolArea(
  input: DeleteCatalogInput,
): Promise<{ deleted: string }> {
  return mutate("delete_school_area", {
    name: input.name,
    expected_modified: input.expectedModified,
  });
}
