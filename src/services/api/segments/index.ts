import type {
  CreateSegmentPayload,
  DeleteSegmentPayload,
  ListSegmentsParams,
  SegmentFieldDefinition,
  SegmentFilterOptionsResponse,
  SegmentPreviewParams,
  SegmentPreviewResponse,
  SegmentRecord,
  SegmentStatus,
  SegmentTermRecord,
  UpdateSegmentPayload,
  TransitionSegmentPayload,
} from "./types";

export type * from "./types";

const METHODS = {
  FIELDS: "crm.api.student_segment.get_fields",
  LIST: "crm.api.student_segment.list_segments",
  GET: "crm.api.student_segment.get_segment",
  PREVIEW: "crm.api.student_segment.preview_segment",
  CREATE: "crm.api.student_segment.create_segment",
  UPDATE: "crm.api.student_segment.update_segment",
  TRANSITION: "crm.api.student_segment.transition_segment",
  DELETE: "crm.api.student_segment.delete_segment",
  NEEDS: "crm.api.student_classification.list_needs",
  TAGS: "crm.api.student_classification.list_tags",
} as const;

export class SegmentApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "SegmentApiError";
  }
}

type RequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

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
    throw new SegmentApiError(
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
      // The service is also used by unit tests outside a Next request.
    }
  }

  if (typeof window !== "undefined" && isWrite) {
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

async function callSegmentApi<T>(
  method: string,
  requestMethod: "GET" | "POST",
  options: RequestOptions = {},
  query: Record<string, string | number | undefined> = {},
  body?: Record<string, unknown>,
): Promise<T> {
  const baseUrl = resolveBaseUrl(options);
  const url = new URL(`${baseUrl}/api/method/${method}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: requestMethod,
      headers: await requestHeaders(options, requestMethod !== "GET"),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new SegmentApiError(
      503,
      "SEGMENT_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ quản lý segment.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  const root = asRecord(payload);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);

  if (!response.ok) {
    const code =
      (typeof error?.code === "string" && error.code) ||
      (typeof root?.exception === "string" && root.exception) ||
      `HTTP_${response.status}`;
    const errorMessage =
      (typeof error?.message === "string" && error.message) ||
      (typeof message?.message === "string" && message.message) ||
      (typeof root?.message === "string" && root.message) ||
      `Thao tác segment thất bại (${response.status}).`;
    throw new SegmentApiError(response.status, code, errorMessage);
  }

  return (root?.message !== undefined ? root.message : payload) as T;
}

export async function getSegmentFields(
  options: RequestOptions = {},
): Promise<SegmentFieldDefinition[]> {
  return callSegmentApi<SegmentFieldDefinition[]>(
    METHODS.FIELDS,
    "GET",
    options,
  );
}

export async function listSegmentTerms(
  kind: "need" | "tag",
  options: RequestOptions = {},
): Promise<SegmentTermRecord[]> {
  return callSegmentApi<SegmentTermRecord[]>(
    kind === "need" ? METHODS.NEEDS : METHODS.TAGS,
    "GET",
    options,
    { status: "active", start: 0, page_length: 100 },
  );
}

export async function getSegmentFilterOptions(
  options: RequestOptions = {},
): Promise<SegmentFilterOptionsResponse> {
  const [fields, needs, tags] = await Promise.all([
    getSegmentFields(options),
    listSegmentTerms("need", options),
    listSegmentTerms("tag", options),
  ]);
  return { fields, needs, tags };
}

export async function listSegments(
  params: ListSegmentsParams = {},
  options: RequestOptions = {},
): Promise<SegmentRecord[]> {
  return callSegmentApi<SegmentRecord[]>(METHODS.LIST, "GET", options, {
    status: params.status,
    category: params.category,
    start: params.start ?? 0,
    page_length: params.pageLength ?? 20,
  });
}

export async function getSegment(
  name: string,
  options: RequestOptions = {},
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(METHODS.GET, "GET", options, { name });
}

export async function previewSegment(
  params: SegmentPreviewParams,
  options: RequestOptions = {},
): Promise<SegmentPreviewResponse> {
  return callSegmentApi<SegmentPreviewResponse>(
    METHODS.PREVIEW,
    "GET",
    options,
    {
      segment: params.segment,
      filters: params.filters ? JSON.stringify(params.filters) : undefined,
      start: params.start ?? 0,
      page_length: params.pageLength ?? 25,
    },
  );
}

export async function createSegment(
  payload: CreateSegmentPayload,
  options: RequestOptions = {},
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(
    METHODS.CREATE,
    "POST",
    options,
    {},
    {
      data: payload,
    },
  );
}

export async function updateSegment(
  payload: UpdateSegmentPayload,
  options: RequestOptions = {},
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(
    METHODS.UPDATE,
    "POST",
    options,
    {},
    {
      name: payload.name,
      data: payload.data,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function transitionSegment(
  payload: TransitionSegmentPayload,
  options: RequestOptions = {},
): Promise<SegmentRecord> {
  return callSegmentApi<SegmentRecord>(
    METHODS.TRANSITION,
    "POST",
    options,
    {},
    {
      name: payload.name,
      status: payload.status,
      expected_revision: payload.expectedRevision,
    },
  );
}

export async function deleteSegment(
  payload: DeleteSegmentPayload,
  options: RequestOptions = {},
): Promise<{ name: string; deleted: boolean }> {
  return callSegmentApi<{ name: string; deleted: boolean }>(
    METHODS.DELETE,
    "POST",
    options,
    {},
    {
      name: payload.name,
      expected_revision: payload.expectedRevision,
    },
  );
}

export function segmentStatus(value: unknown): SegmentStatus {
  return value === "active" || value === "inactive" || value === "archive"
    ? value
    : "draft";
}
