export class FrappeApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "FrappeApiError";
  }
}

type ApiErrorConstructor = new (
  status: number,
  code: string,
  message: string,
) => Error;

function unwrapMessage(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const root = value as Record<string, unknown>;
  return root.message &&
    typeof root.message === "object" &&
    !Array.isArray(root.message)
    ? (root.message as Record<string, unknown>)
    : root;
}

export function getBaseUrl(value?: string): string {
  return (value ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
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

function serverMessage(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const messages = JSON.parse(value) as unknown;
    if (!Array.isArray(messages)) return null;
    for (const entry of messages) {
      const parsed = typeof entry === "string" ? JSON.parse(entry) : entry;
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        typeof (parsed as Record<string, unknown>).message === "string"
      ) {
        return (parsed as Record<string, string>).message;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function request(
  url: string,
  init: RequestInit = {},
  frappeBaseUrl?: string,
  ErrorClass: ApiErrorConstructor = FrappeApiError,
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
    const message =
      (typeof error.message === "string" ? error.message : null) ??
      serverMessage(payload?._server_messages) ??
      (typeof payload?.exception === "string" ? payload.exception : null);
    throw new ErrorClass(
      response.status,
      typeof error.code === "string"
        ? error.code
        : "FRAPPE_REQUEST_FAILED",
      message ?? `Không thể gọi API Frappe (${response.status}).`,
    );
  }
  return unwrapMessage(payload);
}

export function ensureRoot(
  root: string,
  message: string,
  ErrorClass: ApiErrorConstructor = FrappeApiError,
): void {
  if (!root) throw new ErrorClass(503, "FRAPPE_API_UNAVAILABLE", message);
}

export function queryString(params: URLSearchParams): string {
  const value = params.toString();
  return value ? `?${value}` : "";
}
