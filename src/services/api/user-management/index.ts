import { toServiceError } from "../nest/nest-client";
import { NOT_HANDLED } from "../nest/nest-handler";
import { nestUserManagementHandler } from "../nest/nest-user-management-router";
import {
  normalizeCrmUser,
  normalizePermissionProfile,
  normalizeUserRoleLog,
} from "./normalizers";
import type {
  CreateCrmUserPayload,
  ListCrmUsersParams,
  ListCrmUsersResponse,
  ListPermissionProfilesParams,
  ListPermissionProfilesResponse,
  ListUserRoleLogsParams,
  ListUserRoleLogsResponse,
  RemoveUserPayload,
  UpdateCrmUserProfilePayload,
  UpdateUserCapacityPayload,
  UpdatePermissionProfilePayload,
  UpdateUserRolePayload,
} from "./types";

export type * from "./types";

/** Operation ids understood by `nestUserManagementHandler`. */
const METHODS = {
  LIST_USERS: "crm.api.session.list_admin_users",
  LEGACY_LIST_USERS: "crm.api.session.get_users",
  UPDATE_ROLE: "crm.api.user.update_user_role",
  REMOVE_USER: "crm.api.user.remove_crm_roles_from_user",
  LIST_LOGS: "crm.api.user.list_user_role_logs",
  LIST_PERMISSION_PROFILES:
    "crm.api.permission_profile.list_permission_profiles",
  UPDATE_PERMISSION_PROFILE:
    "crm.api.permission_profile.update_permission_profile",
  CREATE_USER: "crm.api.user.create_crm_user",
  UPDATE_PROFILE: "crm.api.user.update_crm_user_profile",
  LIST_USER_CAPACITY: "crm.api.assignment_control.list_user_capacity",
  UPDATE_USER_CAPACITY: "crm.api.assignment_control.upsert_user_capacity",
} as const;

const DEFAULT_CAPACITY_UPDATE_REASON =
  "Cập nhật capacity từ trang Quản lý người dùng CRM.";

export class UserManagementApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(status === 403 ? "Bạn không có quyền thao tác." : message);
    this.name = "UserManagementApiError";
  }
}

type Query = Record<string, string | number | boolean | undefined>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Runs one user-management operation against the Nest users, profiles and capacity resources. */
async function call<T>(
  method: string,
  query: Query = {},
  body?: Record<string, unknown>,
): Promise<T> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params[key] = String(value);
  }
  try {
    const result = await nestUserManagementHandler(method, params, body);
    if (result === NOT_HANDLED) {
      throw new UserManagementApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Thao tác người dùng chưa khả dụng.",
      );
    }
    return result as T;
  } catch (error) {
    throw toServiceError(error, UserManagementApiError);
  }
}

export async function listCrmUsers(
  params: ListCrmUsersParams = {},
): Promise<ListCrmUsersResponse> {
  const hasServerParams = [
    params.search,
    params.role,
    params.start,
    params.pageLength,
  ].some((value) => value !== undefined);
  const listMethod = hasServerParams
    ? METHODS.LIST_USERS
    : METHODS.LEGACY_LIST_USERS;
  const [raw, capacitySettled] = await Promise.all([
    call<unknown>(
      listMethod,
      hasServerParams
        ? {
            search: params.search?.trim(),
            role:
              params.role && params.role !== "all" ? params.role : undefined,
            start: params.start ?? 0,
            page_length: params.pageLength ?? 20,
          }
        : {},
    ),
    // Capacity requires system.configure; a non-admin viewer of this page must
    // still see the user list, just without capacity data. A real failure
    // (not that expected permission gap) still shouldn't take down the whole
    // user list, but it must not look identical to "you're not an admin" —
    // log it so it doesn't disappear silently for a caller who does qualify.
    call<unknown>(METHODS.LIST_USER_CAPACITY).catch((error: unknown) => {
      const isPermissionDenied =
        error instanceof UserManagementApiError &&
        (error.status === 403 || /permission/i.test(error.code));
      if (!isPermissionDenied) {
        console.error("Không tải được dữ liệu capacity người dùng.", error);
      }
      return null;
    }),
  ]);
  const capacityByUser = asRecord(capacitySettled) ?? {};
  const payload = asRecord(raw);
  const legacyUsers = Array.isArray(raw) ? raw : [];
  const pageUsers = Array.isArray(payload?.users)
    ? payload.users
    : (legacyUsers[1] ?? legacyUsers[0] ?? []);
  const normalizeUserList = (value: unknown) =>
    (Array.isArray(value) ? value : []).flatMap(
      (user: unknown) => normalizeCrmUser(user, capacityByUser) ?? [],
    );
  const normalizedAllUsers = Array.isArray(raw)
    ? normalizeUserList(legacyUsers[0])
    : normalizeUserList(pageUsers);
  const normalizedCrmUsers = Array.isArray(raw)
    ? normalizeUserList(
        Array.isArray(legacyUsers[1]) ? legacyUsers[1] : legacyUsers[0],
      )
    : normalizedAllUsers;
  const total =
    typeof payload?.total === "number"
      ? payload.total
      : normalizedAllUsers.length;
  return {
    allUsers: normalizedAllUsers,
    crmUsers: normalizedCrmUsers,
    total,
    start:
      typeof payload?.start === "number" ? payload.start : (params.start ?? 0),
    pageLength:
      typeof payload?.page_length === "number"
        ? payload.page_length
        : (params.pageLength ?? normalizedAllUsers.length),
  };
}

export async function updateUserRole(
  payload: UpdateUserRolePayload,
): Promise<void> {
  await call(
    METHODS.UPDATE_ROLE,
    {},
    {
      user: payload.user,
      new_role: payload.newRole,
    },
  );
}

export async function removeUser(payload: RemoveUserPayload): Promise<void> {
  await call(METHODS.REMOVE_USER, {}, { user: payload.user });
}

export async function createCrmUser(
  payload: CreateCrmUserPayload,
): Promise<string> {
  const raw = await call<unknown>(
    METHODS.CREATE_USER,
    {},
    {
      email: payload.email,
      full_name: payload.fullName,
      password: payload.password,
      role: payload.role,
    },
  );
  return typeof raw === "string" ? raw : payload.email;
}

export async function updateCrmUserProfile(
  payload: UpdateCrmUserProfilePayload,
): Promise<void> {
  await call(
    METHODS.UPDATE_PROFILE,
    {},
    {
      user: payload.user,
      full_name: payload.fullName,
      new_password: payload.newPassword,
    },
  );
}

export async function updateUserCapacity(
  payload: UpdateUserCapacityPayload,
): Promise<void> {
  await call(
    METHODS.UPDATE_USER_CAPACITY,
    {},
    {
      user: payload.user,
      max_active_students: payload.maxActiveStudents,
      reason: payload.reason?.trim() || DEFAULT_CAPACITY_UPDATE_REASON,
    },
  );
}

export async function listUserRoleLogs(
  params: ListUserRoleLogsParams = {},
): Promise<ListUserRoleLogsResponse> {
  const raw = await call<unknown>(METHODS.LIST_LOGS, {
    user: params.user,
    start: params.start ?? 0,
    page_length: Math.min(params.pageLength ?? 50, 200),
  });
  const payload = asRecord(raw);
  return {
    logs: Array.isArray(payload?.logs)
      ? payload.logs.flatMap((log) => normalizeUserRoleLog(log) ?? [])
      : [],
    total: Number(payload?.total ?? 0),
    start: Number(payload?.start ?? params.start ?? 0),
    pageLength: Number(payload?.page_length ?? params.pageLength ?? 50),
  };
}

export async function listPermissionProfiles(
  params: ListPermissionProfilesParams = {},
): Promise<ListPermissionProfilesResponse> {
  const raw = await call<unknown>(METHODS.LIST_PERMISSION_PROFILES, {
    role: params.role?.trim() || undefined,
    start: params.start ?? 0,
    page_length: Math.min(params.pageLength ?? 8, 100),
    view_mode: params.viewMode === "detailed" ? "detailed" : undefined,
  });
  const payload = asRecord(raw);
  return {
    profiles: Array.isArray(payload?.profiles)
      ? payload.profiles.flatMap(
          (profile) => normalizePermissionProfile(profile) ?? [],
        )
      : [],
    selectedRole:
      typeof payload?.selected_role === "string" ? payload.selected_role : null,
    total: Number(payload?.total ?? 0),
    start: Number(payload?.start ?? params.start ?? 0),
    pageLength: Number(payload?.page_length ?? params.pageLength ?? 8),
    viewMode: payload?.view_mode === "detailed" ? "detailed" : "grouped",
  };
}

export async function updatePermissionProfile(
  payload: UpdatePermissionProfilePayload,
): Promise<NonNullable<ReturnType<typeof normalizePermissionProfile>>> {
  const raw = await call<unknown>(
    METHODS.UPDATE_PERMISSION_PROFILE,
    {},
    {
      role: payload.role,
      row_scope: payload.rowScope,
      delete_requires_ownership: payload.deleteRequiresOwnership,
      applicable_doctypes: payload.applicableDoctypes.map((row) => ({
        document_type: row.documentType,
        read: row.read,
        write: row.write,
        create: row.create,
        delete: row.delete,
        export: row.export,
      })),
      ...(payload.replaceApplicableDoctypes === undefined
        ? {}
        : { replace_applicable_doctypes: payload.replaceApplicableDoctypes }),
      ...(payload.viewMode === "detailed" ? { view_mode: "detailed" } : {}),
    },
  );
  const profile = normalizePermissionProfile(raw);
  if (!profile) {
    throw new UserManagementApiError(
      502,
      "INVALID_PERMISSION_PROFILE_RESPONSE",
      "Máy chủ trả về cấu hình quyền không hợp lệ.",
    );
  }
  return profile;
}
