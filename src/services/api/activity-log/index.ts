import type {
  ActivityLogEntry,
  ActivityLogModule,
  ActivityLogSeverity,
  GetActivityLogsParams,
  GetActivityLogsResponse,
} from "./types";

export type * from "./types";

const METHOD = "crm.api.activity_log.get_activity_logs";

export class ActivityLogApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ActivityLogApiError";
  }
}

export type RequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function resolveBaseUrl(options: RequestOptions): string {
  const baseUrl = (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );

  if (!baseUrl) {
    throw new ActivityLogApiError(
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

async function requestHeaders(options: RequestOptions): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // The service is also used by unit tests outside a Next request.
    }
  }

  if (typeof window !== "undefined") {
    const csrfToken = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");

    if (csrfToken) {
      headers["X-Frappe-CSRF-Token"] = decodeURIComponent(csrfToken);
    } else {
      try {
        const response = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const payload = (await response.json().catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        if (typeof payload?.message?.csrf_token === "string") {
          headers["X-Frappe-CSRF-Token"] = payload.message.csrf_token;
        }
      } catch {
        // Frappe still accepts the session cookie when CSRF is disabled.
      }
    }
  }
  return headers;
}

function rawValue(value: unknown): unknown | null {
  return value === undefined ? null : value;
}

function normalizeActivityLog(raw: unknown): ActivityLogEntry {
  const record = asRecord(raw) ?? {};
  const severity: ActivityLogSeverity = record.severity === "critical" ? "critical" : "info";

  return {
    eventId: String(record.event_id ?? record.eventId ?? ""),
    action: String(record.action ?? "updated"),
    doctype: String(record.doctype ?? record.ref_doctype ?? ""),
    docname: String(record.docname ?? ""),
    fieldname: (record.fieldname as string | null | undefined) ?? null,
    fieldLabel: (record.field_label as string | null | undefined) ?? null,
    oldValue: rawValue(record.old_value ?? record.oldValue),
    newValue: rawValue(record.new_value ?? record.newValue),
    owner: (record.owner as string | null | undefined) ?? null,
    ownerFullName: (record.owner_full_name as string | null | undefined) ?? null,
    occurredAt: String(record.occurred_at ?? record.occurredAt ?? ""),
    eventType: String(record.event_type ?? record.eventType ?? ""),
    category: String(record.category ?? ""),
    severity,
  };
}

export async function getActivityLogs(
  params: GetActivityLogsParams,
  options: RequestOptions = {},
): Promise<GetActivityLogsResponse> {
  const baseUrl = resolveBaseUrl(options);
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/api/method/${METHOD}`, {
      method: "POST",
      headers: await requestHeaders(options),
      ...(typeof window !== "undefined" ? { credentials: "include" } : {}),
      body: JSON.stringify({
        module: params.module,
        actor: params.actor || undefined,
        role: params.role || undefined,
        severity: params.severity || undefined,
        start_date: params.startDate || undefined,
        end_date: params.endDate || undefined,
        start: params.start ?? 0,
        page_length: params.pageLength ?? 50,
      }),
      cache: "no-store",
    });
  } catch {
    throw new ActivityLogApiError(
      503,
      "ACTIVITY_LOG_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ nhật ký hoạt động.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  const root = asRecord(payload);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);

  if (!response.ok) {
    throw new ActivityLogApiError(
      response.status,
      (typeof error?.code === "string" && error.code) ||
        (typeof root?.exception === "string" && root.exception) ||
        `HTTP_${response.status}`,
      (typeof error?.message === "string" && error.message) ||
        (typeof root?.message === "string" && root.message) ||
        `Không thể tải nhật ký hoạt động (${response.status}).`,
    );
  }

  const data = asRecord(root?.message ?? payload) ?? {};
  const logs = Array.isArray(data.logs) ? data.logs.map(normalizeActivityLog) : [];

  return {
    logs,
    total: Number(data.total ?? logs.length),
    start: Number(data.start ?? params.start ?? 0),
    pageLength: Number(data.page_length ?? params.pageLength ?? 50),
    module: (data.module as ActivityLogModule) ?? params.module,
    tracked: data.tracked !== false,
  };
}
