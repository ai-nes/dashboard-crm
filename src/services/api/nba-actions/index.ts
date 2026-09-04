import {
  normalizeNbaActionTypesResponse,
  normalizeNbaActionUpdateResponse,
  normalizeNbaActionsResponse,
  normalizeNbaTimeSlotsResponse,
} from "./normalizers";
import type {
  ListNbaActionTypesResponse,
  ListNbaActionsParams,
  ListNbaActionsResponse,
  ListNbaTimeSlotsResponse,
  UpdateNbaActionPayload,
  UpdateNbaActionResponse,
} from "./types";

export type * from "./types";
export { ACTION_TIME_SLOTS } from "./types";
export * from "./normalizers";

const METHODS = {
  LIST_ACTIONS: "crm.api.action.list_actions",
  LIST_ACTION_TYPES: "crm.api.action_type.list_action_types",
  LIST_TIME_SLOTS: "crm.api.action.list_time_slots",
  UPDATE_ACTION: "crm.api.action.update_action",
} as const;

export type RequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

export class NbaActionsApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "NbaActionsApiError";
  }
}

type RequestMethod = "GET" | "POST";
type QueryValue = string | number | undefined;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function resolveBaseUrl(options: RequestOptions = {}): string {
  const baseUrl = (
    options.baseUrl ??
    process.env.NEXT_PUBLIC_FRAPPE_URL ??
    ""
  ).replace(/\/+$/, "");

  if (!baseUrl) {
    throw new NbaActionsApiError(
      0,
      "FRAPPE_URL_MISSING",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }

  return baseUrl;
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: RequestOptions,
  isWrite: boolean,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isWrite ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };

  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Outside a Next request context, such as contract tests.
    }
  }

  if (typeof window !== "undefined" && isWrite) {
    const cookieToken = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");

    if (cookieToken) {
      headers["X-Frappe-CSRF-Token"] = decodeURIComponent(cookieToken);
    } else {
      try {
        const sessionResponse = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          {
            credentials: "include",
            headers: { Accept: "application/json" },
          },
        );
        const sessionPayload = (await sessionResponse
          .json()
          .catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        const csrfToken = sessionPayload?.message?.csrf_token;
        if (typeof csrfToken === "string" && csrfToken) {
          headers["X-Frappe-CSRF-Token"] = csrfToken;
        }
      } catch {
        // Fall back to the session cookie.
      }
    }
  }

  return headers;
}

function getErrorDetails(payload: unknown): {
  code?: string;
  message?: string;
} {
  const root = asRecord(payload);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);

  return {
    code:
      typeof error?.code === "string"
        ? error.code
        : typeof root?.exception === "string"
          ? root.exception
          : undefined,
    message:
      typeof error?.message === "string"
        ? error.message
        : typeof message?.message === "string"
          ? message.message
          : typeof root?.message === "string"
            ? root.message
            : typeof root?.exception === "string"
              ? root.exception
              : undefined,
  };
}

async function callNbaActionsApi<T>(
  method: string,
  requestMethod: RequestMethod,
  options: RequestOptions = {},
  query: Record<string, QueryValue> = {},
  body?: Record<string, unknown>,
): Promise<T> {
  const baseUrl = resolveBaseUrl(options);
  const url = new URL(`${baseUrl}/api/method/${method}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  const headers = await requestHeaders(options, requestMethod !== "GET");
  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: requestMethod,
      headers,
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new NbaActionsApiError(
      503,
      "NBA_ACTIONS_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ cấu hình Action NBA.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = getErrorDetails(payload);
    throw new NbaActionsApiError(
      response.status,
      details.code ?? `HTTP_${response.status}`,
      details.message ?? "Thao tác cấu hình Action NBA thất bại.",
    );
  }

  return payload as T;
}

export async function listNbaActions(
  params: ListNbaActionsParams = {},
  options: RequestOptions = {},
): Promise<ListNbaActionsResponse> {
  const raw = await callNbaActionsApi<unknown>(
    METHODS.LIST_ACTIONS,
    "GET",
    options,
    {
      action_type: params.actionType,
      enabled:
        params.enabled === undefined ? undefined : params.enabled ? 1 : 0,
      search: params.search,
      start: params.start ?? 0,
      page_length: params.pageLength ?? 20,
    },
  );

  try {
    return normalizeNbaActionsResponse(raw);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTIONS_RESPONSE",
      "Phản hồi danh sách Action NBA không hợp lệ.",
    );
  }
}

export async function listNbaActionTypes(
  options: RequestOptions = {},
): Promise<ListNbaActionTypesResponse> {
  const raw = await callNbaActionsApi<unknown>(
    METHODS.LIST_ACTION_TYPES,
    "GET",
    options,
    { start: 0, page_length: 100 },
  );

  try {
    return normalizeNbaActionTypesResponse(raw);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTION_TYPES_RESPONSE",
      "Phản hồi danh sách loại Action không hợp lệ.",
    );
  }
}

export async function listNbaTimeSlots(
  options: RequestOptions = {},
): Promise<ListNbaTimeSlotsResponse> {
  const raw = await callNbaActionsApi<unknown>(
    METHODS.LIST_TIME_SLOTS,
    "GET",
    options,
  );

  try {
    return normalizeNbaTimeSlotsResponse(raw);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_TIME_SLOTS_RESPONSE",
      "Phản hồi danh sách khung giờ không hợp lệ.",
    );
  }
}

export async function updateNbaAction(
  payload: UpdateNbaActionPayload,
  options: RequestOptions = {},
): Promise<UpdateNbaActionResponse> {
  const raw = await callNbaActionsApi<unknown>(
    METHODS.UPDATE_ACTION,
    "POST",
    options,
    {},
    {
      name: payload.name,
      allowed_time_slots: payload.allowedTimeSlots,
    },
  );

  try {
    return normalizeNbaActionUpdateResponse(raw, payload.name);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTION_UPDATE_RESPONSE",
      "Phản hồi cập nhật Action NBA không hợp lệ.",
    );
  }
}
