/**
 * Transport for the NestJS CRM backend (`crm-backend`). Enabled by setting
 * `NEXT_PUBLIC_CRM_API_URL`; when unset the dashboard keeps talking to Frappe.
 * Auth is a Better Auth session cookie, so every call sends credentials.
 */

export const NEST_API_URL = (process.env.NEXT_PUBLIC_CRM_API_URL ?? "").replace(
  /\/+$/,
  "",
);

export function isNestApiEnabled(): boolean {
  return NEST_API_URL !== "";
}

export class NestApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "NestApiError";
  }
}

export interface NestRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, string | number | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query: NestRequestOptions["query"]): string {
  const url = `${NEST_API_URL}${path}`;
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
      ? (payload as { error?: { code?: unknown; message?: unknown } }).error
      : undefined;
  const code = typeof error?.code === "string" ? error.code : `HTTP_${status}`;
  const message =
    typeof error?.message === "string"
      ? error.message
      : "Không thể xử lý yêu cầu.";
  return new NestApiError(status, code, message);
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
