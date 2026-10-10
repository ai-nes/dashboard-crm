/**
 * Transport for the NestJS CRM backend (`crm-backend`). `NEXT_PUBLIC_CRM_API_URL`
 * is its origin. Auth is a Better Auth session cookie, so every call sends
 * credentials.
 */

/** Origin of the Nest API, read on every call so tests can change it. */
export function readApiUrl(): string {
  return (process.env.NEXT_PUBLIC_CRM_API_URL ?? "").replace(/\/+$/, "");
}

/** Origin of the Nest API; fails loudly when the dashboard is not configured. */
export function getApiUrl(): string {
  const url = readApiUrl();
  if (!url) {
    throw new NestApiError(
      503,
      "API_URL_MISSING",
      "Chưa cấu hình NEXT_PUBLIC_CRM_API_URL cho máy chủ CRM.",
    );
  }
  return url;
}

/**
 * Features the Nest backend does not serve yet fail fast with this status so a
 * screen shows an honest message instead of empty data.
 */
export const FEATURE_NOT_MIGRATED_STATUS = 501;
export const FEATURE_NOT_MIGRATED_CODE = "FEATURE_NOT_MIGRATED";
export const FEATURE_NOT_MIGRATED_MESSAGE =
  "Tính năng này đang được chuyển sang hệ thống mới nên chưa khả dụng.";

export interface NestValidationIssue {
  field: string;
  code: string;
  message: string;
}

export class NestApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: NestValidationIssue[] = [],
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "NestApiError";
  }
}

/**
 * Throws the 501 for a function whose Nest endpoint is still being built, so a
 * screen shows an honest message instead of empty data.
 */
export function notMigrated(): never {
  throw new NestApiError(
    FEATURE_NOT_MIGRATED_STATUS,
    FEATURE_NOT_MIGRATED_CODE,
    FEATURE_NOT_MIGRATED_MESSAGE,
  );
}

type ServiceErrorConstructor<E extends Error> = new (
  status: number,
  code: string,
  message: string,
) => E;

/** Re-throws a Nest failure as the service's own error class; other errors pass through. */
export function toServiceError<E extends Error>(
  error: unknown,
  ErrorClass: ServiceErrorConstructor<E>,
): unknown {
  return error instanceof NestApiError
    ? new ErrorClass(error.status, error.code, error.message)
    : error;
}

export interface NestRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, string | number | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query: NestRequestOptions["query"]): string {
  const url = `${getApiUrl()}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

function errorFrom(status: number, payload: unknown): NestApiError {
  const error =
    payload && typeof payload === "object" && "error" in payload
      ? (
          payload as {
            error?: {
              code?: unknown;
              message?: unknown;
              details?: unknown;
              requestId?: unknown;
            };
          }
        ).error
      : undefined;
  const code = typeof error?.code === "string" ? error.code : `HTTP_${status}`;
  const message =
    typeof error?.message === "string"
      ? error.message
      : "Không thể xử lý yêu cầu.";
  const details = Array.isArray(error?.details)
    ? error.details
        .filter((issue): issue is NestValidationIssue =>
          Boolean(
            issue &&
            typeof issue === "object" &&
            typeof issue.field === "string" &&
            typeof issue.code === "string" &&
            typeof issue.message === "string",
          ),
        )
        .map(({ field, code, message }) => ({ field, code, message }))
    : [];
  return new NestApiError(
    status,
    code,
    message,
    details,
    typeof error?.requestId === "string" ? error.requestId : undefined,
  );
}

/** JSON request to the Nest API. Resolves with the parsed body (null for 204). */
export async function nestRequest<T = unknown>(
  path: string,
  options: NestRequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      credentials: "include",
      cache: "no-store",
      ...(options.signal ? { signal: options.signal } : {}),
      headers: {
        Accept: "application/json",
        // The browser sets the multipart boundary for FormData itself.
        ...(options.body !== undefined && !(options.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
      ...(options.body !== undefined
        ? {
            body:
              options.body instanceof FormData
                ? options.body
                : JSON.stringify(options.body),
          }
        : {}),
    });
  } catch {
    throw new NestApiError(
      503,
      "API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ CRM.",
    );
  }

  if (response.status === 204) return null as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw errorFrom(response.status, payload);
  return payload as T;
}
