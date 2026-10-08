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

import { NestApiError } from "../nest/nest-client";
import { NOT_HANDLED } from "../nest/nest-handler";
import { nestMajorCatalogHandler } from "../nest/nest-catalog-router";

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

async function call(
  method: string,
  params: Record<string, string | undefined>,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const result = await nestMajorCatalogHandler(
      `crm.api.major_catalog.${method}`,
      params,
      body,
    );
    if (result === NOT_HANDLED) {
      throw new MajorCatalogApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return (result ?? {}) as Record<string, unknown>;
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new MajorCatalogApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

function listParams(
  entries: Record<string, string | number | boolean | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [
      key,
      value === undefined || value === "" ? undefined : String(value),
    ]),
  );
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
    search?: string;
    includeDisabled?: boolean;
    enabled?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<MajorGroupCatalog> {
  const result = await call(
    "list_major_groups",
    listParams({
      search: options.search?.trim(),
      include_disabled: options.includeDisabled,
      enabled: options.enabled,
      start: options.start,
      page_length: options.pageLength,
    }),
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
    search?: string;
    group?: string;
    includeInactive?: boolean;
    isActive?: boolean;
    start?: number;
    pageLength?: number;
  } = {},
): Promise<MajorCatalog> {
  const result = await call(
    "list_majors",
    listParams({
      search: options.search?.trim(),
      group: options.group,
      include_inactive: options.includeInactive,
      is_active: options.isActive,
      start: options.start,
      page_length: options.pageLength,
    }),
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
): Promise<T> {
  return (await call(method, {}, data)) as unknown as T;
}
export function createMajorGroup(
  data: MajorGroupMutationInput,
): Promise<MajorGroupOption> {
  return mutate("create_major_group", { data });
}

export function updateMajorGroup(
  input: UpdateMajorGroupInput,
): Promise<MajorGroupOption> {
  return mutate("update_major_group", {
    name: input.name,
    data: input.data,
    expected_modified: input.expectedModified,
  });
}

export function deleteMajorGroup(
  input: DeleteMajorGroupInput,
): Promise<{ deleted: string }> {
  return mutate("delete_major_group", {
    name: input.name,
    expected_modified: input.expectedModified,
  });
}

export function createMajor(data: MajorMutationInput): Promise<MajorOption> {
  return mutate("create_major", { data });
}

export function updateMajor(input: UpdateMajorInput): Promise<MajorOption> {
  return mutate("update_major", {
    name: input.name,
    data: input.data,
    expected_modified: input.expectedModified,
  });
}

export function deleteMajor(
  input: DeleteMajorInput,
): Promise<{ deleted: string }> {
  return mutate("delete_major", {
    name: input.name,
    expected_modified: input.expectedModified,
  });
}
