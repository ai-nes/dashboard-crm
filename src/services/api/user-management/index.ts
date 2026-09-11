import { normalizeCrmUser, normalizeUserRoleLog, unwrapMethodPayload } from "./normalizers";
import type {
  CreateCrmUserPayload,
  ListCrmUsersResponse,
  ListUserRoleLogsParams,
  ListUserRoleLogsResponse,
  RemoveUserPayload,
  RequestOptions,
  UpdateCrmUserProfilePayload,
  UpdateUserRolePayload,
} from "./types";

export type * from "./types";

const METHODS = {
  LIST_USERS: "crm.api.session.get_users",
  UPDATE_ROLE: "crm.api.user.update_user_role",
  REMOVE_USER: "crm.api.user.remove_crm_roles_from_user",
  LIST_LOGS: "crm.api.user.list_user_role_logs",
  CREATE_USER: "crm.api.user.create_crm_user",
  UPDATE_PROFILE: "crm.api.user.update_crm_user_profile",
} as const;

export class UserManagementApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "UserManagementApiError";
  }
}

type RequestMethod = "GET" | "POST";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function resolveBaseUrl(options: RequestOptions): string {
  const baseUrl = (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(/\/+$/, "");
  if (!baseUrl) throw new UserManagementApiError(0, "FRAPPE_URL_MISSING", "Chưa cấu hình địa chỉ Frappe CRM API.");
  return baseUrl;
}

function cookieHeader(value: string): string {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("sid="))
    .join("; ");
}

async function headers(options: RequestOptions, write: boolean): Promise<Record<string, string>> {
  const result: Record<string, string> = {
    Accept: "application/json",
    ...(write ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };
  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const sid = cookieHeader((await cookies()).toString());
      if (sid) result.Cookie = sid;
    } catch {
      // Tests and non-request contexts do not have a Next request store.
    }
  }
  if (typeof window !== "undefined" && write) {
    const csrf = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="));
    if (csrf) result["X-Frappe-CSRF-Token"] = decodeURIComponent(csrf.split("=").slice(1).join("="));
  }
  return result;
}

function errorDetails(payload: unknown): { code?: string; message?: string } {
  const root = asRecord(payload);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);
  const exception = typeof root?.exception === "string" ? root.exception : "";
  const code = typeof error?.code === "string" ? error.code : typeof root?.exc_type === "string" ? root.exc_type : undefined;
  const extractedMessage = typeof error?.message === "string"
    ? error.message
    : typeof message?.message === "string"
      ? message.message
      : exception || (typeof root?.message === "string" ? root.message : undefined);
  return { code, message: extractedMessage };
}

async function call<T>(
  method: string,
  requestMethod: RequestMethod,
  options: RequestOptions,
  query: Record<string, string | number | boolean | undefined> = {},
  body?: Record<string, unknown>,
): Promise<T> {
  const url = new URL(`${resolveBaseUrl(options)}/api/method/${method}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: requestMethod,
      headers: await headers(options, requestMethod !== "GET"),
      ...(typeof window !== "undefined" ? { credentials: "include" as RequestCredentials } : {}),
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new UserManagementApiError(503, "USER_MANAGEMENT_API_UNAVAILABLE", "Không thể kết nối đến máy chủ Frappe CRM.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload);
    const code = details.code ?? `HTTP_${response.status}`;
    throw new UserManagementApiError(response.status, code, details.message ?? "Thao tác người dùng thất bại.");
  }
  return unwrapMethodPayload(payload) as T;
}

export async function listCrmUsers(options: RequestOptions = {}): Promise<ListCrmUsersResponse> {
  const raw = await call<unknown>(METHODS.LIST_USERS, "GET", options);
  const [allUsers, crmUsers] = Array.isArray(raw) ? raw : [[], []];
  return {
    allUsers: Array.isArray(allUsers) ? allUsers.flatMap((user) => normalizeCrmUser(user) ?? []) : [],
    crmUsers: Array.isArray(crmUsers) ? crmUsers.flatMap((user) => normalizeCrmUser(user) ?? []) : [],
  };
}

export async function updateUserRole(payload: UpdateUserRolePayload, options: RequestOptions = {}): Promise<void> {
  await call(METHODS.UPDATE_ROLE, "POST", options, {}, {
    user: payload.user,
    new_role: payload.newRole,
  });
}

export async function removeUser(payload: RemoveUserPayload, options: RequestOptions = {}): Promise<void> {
  await call(METHODS.REMOVE_USER, "POST", options, {}, {
    user: payload.user,
  });
}

export async function createCrmUser(payload: CreateCrmUserPayload, options: RequestOptions = {}): Promise<string> {
  const raw = await call<unknown>(METHODS.CREATE_USER, "POST", options, {}, {
    email: payload.email,
    full_name: payload.fullName,
    password: payload.password,
    role: payload.role,
  });
  return typeof raw === "string" ? raw : payload.email;
}

export async function updateCrmUserProfile(
  payload: UpdateCrmUserProfilePayload,
  options: RequestOptions = {},
): Promise<void> {
  await call(METHODS.UPDATE_PROFILE, "POST", options, {}, {
    user: payload.user,
    full_name: payload.fullName,
    new_password: payload.newPassword,
  });
}

export async function listUserRoleLogs(
  params: ListUserRoleLogsParams = {},
  options: RequestOptions = {},
): Promise<ListUserRoleLogsResponse> {
  const raw = await call<unknown>(METHODS.LIST_LOGS, "GET", options, {
    user: params.user,
    start: params.start ?? 0,
    page_length: Math.min(params.pageLength ?? 50, 200),
  });
  const payload = asRecord(raw);
  return {
    logs: Array.isArray(payload?.logs) ? payload.logs.flatMap((log) => normalizeUserRoleLog(log) ?? []) : [],
    total: Number(payload?.total ?? 0),
    start: Number(payload?.start ?? params.start ?? 0),
    pageLength: Number(payload?.page_length ?? params.pageLength ?? 50),
  };
}
