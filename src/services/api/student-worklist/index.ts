import type {
  CompleteActionParams,
  CompleteActionResponse,
  StartActionParams,
  StartActionResponse,
  StudentWorklistActionsResponse,
  StudentWorklistItem,
} from "./types";

export type * from "./types";

const METHOD = "crm.api.student_worklist.list_actions_for_record";
const TRANSITION_METHOD = "crm.api.student_decision.transition_action";
const COMPLETE_METHOD = "crm.api.action_workbench.complete_action_manually";

type RequestOptions = { baseUrl?: string; headers?: Record<string, string> };

export class StudentWorklistApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "StudentWorklistApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

function resolveBaseUrl(options: RequestOptions): string {
  const baseUrl = (
    options.baseUrl ??
    process.env.NEXT_PUBLIC_FRAPPE_URL ??
    ""
  ).replace(/\/+$/, "");

  if (!baseUrl) {
    throw new StudentWorklistApiError(
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
  isWrite = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isWrite ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Outside a Next request context (for example, contract tests).
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
        const sessionRes = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const sessionPayload = (await sessionRes.json().catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        const csrfToken = sessionPayload?.message?.csrf_token;
        if (typeof csrfToken === "string" && csrfToken) {
          headers["X-Frappe-CSRF-Token"] = csrfToken;
        }
      } catch {
        // Fallback to cookie-only.
      }
    }
  }

  return headers;
}

async function callWorklistApi<T>(
  method: string,
  options: RequestOptions,
  body: Record<string, unknown>,
): Promise<T> {
  const baseUrl = resolveBaseUrl(options);
  const headers = await requestHeaders(options, true);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/method/${method}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new StudentWorklistApiError(
      503,
      "STUDENT_WORKLIST_UNAVAILABLE",
      "Không thể kết nối tới máy chủ Frappe CRM.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = getErrorDetails(payload);
    throw new StudentWorklistApiError(
      response.status,
      details.code ?? "STUDENT_WORKLIST_UNAVAILABLE",
      details.message ?? `Lỗi HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return unwrapMessage(payload) as T;
}

function unwrapMessage(value: unknown): Record<string, unknown> {
  const root = asRecord(value) ?? {};
  return asRecord(root.message) ?? root;
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizeStudentWorklistActions(
  value: unknown,
): StudentWorklistActionsResponse {
  const payload = unwrapMessage(value);
  if (!Array.isArray(payload.items)) {
    throw new Error("Invalid student worklist response");
  }

  const items: StudentWorklistItem[] = payload.items.flatMap((item, index) => {
    const action = asRecord(item);
    const objective = textValue(action?.objective);
    if (!objective) return [];

    const outcomeCodes = Array.isArray(action?.outcome_codes)
      ? action.outcome_codes.flatMap((entry) => {
          const option = asRecord(entry);
          const value = textValue(option?.value);
          if (!value) return [];
          return [{ value, label: textValue(option?.label) ?? value }];
        })
      : [];

    return [
      {
        name: textValue(action?.name) ?? `student-action-${index}`,
        student: textValue(action?.student),
        actionType: textValue(action?.action_type),
        objective,
        state: textValue(action?.state) ?? "pending",
        executionStatus: textValue(action?.execution_status),
        priority: textValue(action?.priority) ?? "medium",
        dueAt: textValue(action?.due_at),
        actionOwner: textValue(action?.action_owner),
        origin: textValue(action?.origin),
        revision: numberValue(action?.revision, 1),
        packageRevision: numberValue(action?.package_revision, 0),
        outcome: textValue(action?.outcome),
        outcomeCodes,
        linkedInteraction: textValue(action?.linked_interaction),
        permittedTransitions: Array.isArray(action?.permitted_transitions)
          ? action.permitted_transitions.filter(
              (value): value is string => typeof value === "string",
            )
          : [],
        isToday: action?.is_today === true,
        isOverdue: action?.is_overdue === true,
      },
    ];
  });

  return { items };
}

function generateIdempotencyKey(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getStudentWorklistActions(
  studentId: string,
  options: RequestOptions = {},
): Promise<StudentWorklistActionsResponse> {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) {
    throw new StudentWorklistApiError(
      400,
      "INVALID_STUDENT_ID",
      "Thiếu mã học sinh để tải NBA.",
    );
  }

  const baseUrl = resolveBaseUrl(options);
  const query = new URLSearchParams({
    doctype: "CRM Student",
    name: normalizedStudentId,
    page_size: "50",
  });
  const headers = await requestHeaders(options);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/method/${METHOD}?${query}`, {
      headers,
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new StudentWorklistApiError(
      503,
      "STUDENT_WORKLIST_UNAVAILABLE",
      "Không thể kết nối tới danh sách NBA của học sinh.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = getErrorDetails(payload);
    throw new StudentWorklistApiError(
      response.status,
      details.code ?? "STUDENT_WORKLIST_UNAVAILABLE",
      details.message ?? `Lỗi HTTP ${response.status}: ${response.statusText}`,
    );
  }

  try {
    return normalizeStudentWorklistActions(payload);
  } catch {
    throw new StudentWorklistApiError(
      502,
      "INVALID_STUDENT_WORKLIST_RESPONSE",
      "Phản hồi danh sách NBA của học sinh không hợp lệ.",
    );
  }
}

export async function startAction(
  params: StartActionParams,
  options: RequestOptions = {},
): Promise<StartActionResponse> {
  const raw = await callWorklistApi<Record<string, unknown>>(
    TRANSITION_METHOD,
    options,
    {
      name: params.action,
      expected_revision: params.expectedActionRevision,
      status: "in_progress",
      idempotency_key: params.idempotencyKey,
    },
  );

  return {
    name: textValue(raw.action) ?? params.action,
    executionStatus: textValue(raw.status) ?? "in_progress",
    revision: numberValue(raw.revision, params.expectedActionRevision + 1),
  };
}

export async function completeActionManually(
  params: CompleteActionParams,
  options: RequestOptions = {},
): Promise<CompleteActionResponse> {
  const raw = await callWorklistApi<Record<string, unknown>>(
    COMPLETE_METHOD,
    options,
    {
      action: params.action,
      idempotency_key: params.idempotencyKey,
      expected_action_revision: params.expectedActionRevision,
      expected_package_revision: params.expectedPackageRevision,
      outcome_code: params.outcomeCode,
      ...(params.outcomeEvidence ? { outcome_evidence: params.outcomeEvidence } : {}),
      ...(params.outcomeNotes ? { outcome_notes: params.outcomeNotes } : {}),
    },
  );

  return {
    name: textValue(raw.action) ?? params.action,
    executionStatus: textValue(raw.status) ?? "completed",
    revision: numberValue(raw.revision, params.expectedActionRevision + 1),
  };
}

export { generateIdempotencyKey };
