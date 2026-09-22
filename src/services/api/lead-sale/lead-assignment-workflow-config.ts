import type {
  LeadRoutingPolicy,
  LeadRoutingStrategy,
} from "./lead-routing-policy";
import { normalizeLeadRoutingPolicy } from "./lead-routing-policy";
import type { LeadAssignmentWorkflowStepId } from "./lead-assignment-batch";

export type LeadAssignmentWorkflowInputSettings = {
  enabled: boolean;
  scheduledMinAgeMinutes: number;
  maxLeadsPerRun: number;
};

export type LeadAssignmentWorkflowValidationSettings = {
  requiredFields: string[];
  optionalFields: string[];
  invalidOutcome: "review";
};

export type LeadAssignmentWorkflowClassificationSettings = {
  enabled: boolean;
};

export type LeadAssignmentWorkflowMatchingSettings = {
  routingPolicy: LeadRoutingPolicy;
  noEligibleOutcome: "review";
};

export type LeadAssignmentWorkflowReviewSettings = {
  retryMode: "manual";
  maxRetries: number;
};

export type LeadAssignmentWorkflowAssignmentSettings = {
  preserveExistingOwner: true;
  recipientFunctions: ["Sale", "CTV Sale"];
  createStudent: false;
};

export type LeadAssignmentWorkflowStepSettings =
  | LeadAssignmentWorkflowInputSettings
  | LeadAssignmentWorkflowValidationSettings
  | LeadAssignmentWorkflowClassificationSettings
  | LeadAssignmentWorkflowMatchingSettings
  | LeadAssignmentWorkflowReviewSettings
  | LeadAssignmentWorkflowAssignmentSettings;

export type LeadAssignmentWorkflowStepSnapshot = {
  id: LeadAssignmentWorkflowStepId;
  enabled: boolean;
  canToggle: boolean;
  settings: LeadAssignmentWorkflowStepSettings;
};

export type LeadAssignmentWorkflowConfig = {
  schemaVersion: string;
  version: string;
  revision: number;
  applyScope: "new_decisions";
  lastChangedBy: string | null;
  lastChangeReason: string | null;
  stored: {
    input: LeadAssignmentWorkflowInputSettings;
    classification: LeadAssignmentWorkflowClassificationSettings;
    review: Pick<LeadAssignmentWorkflowReviewSettings, "maxRetries">;
  };
};

export type LeadAssignmentWorkflowConfigResponse = {
  schemaVersion: string;
  config: LeadAssignmentWorkflowConfig;
  steps: Record<
    LeadAssignmentWorkflowStepId,
    LeadAssignmentWorkflowStepSnapshot
  >;
  policy: LeadRoutingPolicy;
  canManage: boolean;
};

export type LeadAssignmentWorkflowInputUpdate = Partial<
  LeadAssignmentWorkflowInputSettings
>;
export type LeadAssignmentWorkflowClassificationUpdate = Partial<
  LeadAssignmentWorkflowClassificationSettings
>;
export type LeadAssignmentWorkflowReviewUpdate = Partial<
  Pick<LeadAssignmentWorkflowReviewSettings, "maxRetries">
>;
export type LeadAssignmentWorkflowMatchingUpdate = {
  enabled?: boolean;
  layerOrder?: string[];
  campaignLayerEnabled?: boolean;
  groupLayerEnabled?: boolean;
  globalLayerEnabled?: boolean;
  distributionStrategy?: LeadRoutingStrategy;
  capacityRequired?: boolean;
};

export type LeadAssignmentWorkflowStepUpdate = {
  stepId: LeadAssignmentWorkflowStepId;
  settings:
    | LeadAssignmentWorkflowInputUpdate
    | LeadAssignmentWorkflowClassificationUpdate
    | LeadAssignmentWorkflowReviewUpdate
    | LeadAssignmentWorkflowMatchingUpdate;
  reason: string;
  expectedRevision?: number;
};

export type LeadAssignmentWorkflowConfigRequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

export class LeadAssignmentWorkflowConfigApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "LeadAssignmentWorkflowConfigApiError";
  }
}

const STEP_IDS: readonly LeadAssignmentWorkflowStepId[] = [
  "input",
  "validation",
  "classification",
  "matching",
  "review",
  "assignment",
];

const METHODS = {
  GET: "crm.api.assignment_control.get_lead_assignment_workflow_config",
  UPDATE: "crm.api.assignment_control.update_lead_assignment_workflow_step",
} as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return value === null || value === undefined ? null : text(value);
}

function boolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string")
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  if (typeof value === "number") return value !== 0;
  return fallback;
}

function integer(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.floor(value)
    : fallback;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeSettings(
  id: LeadAssignmentWorkflowStepId,
  value: unknown,
  policy: LeadRoutingPolicy,
): LeadAssignmentWorkflowStepSettings {
  const source = asRecord(value) ?? {};
  switch (id) {
    case "input":
      return {
        enabled: boolean(source.enabled, true),
        scheduledMinAgeMinutes: Math.max(
          0,
          Math.min(integer(source.scheduledMinAgeMinutes, 5), 1440),
        ),
        maxLeadsPerRun: Math.max(
          1,
          Math.min(integer(source.maxLeadsPerRun, 1000), 1000),
        ),
      };
    case "validation":
      return {
        requiredFields: stringList(source.requiredFields),
        optionalFields: stringList(source.optionalFields),
        invalidOutcome: "review",
      };
    case "classification":
      return { enabled: boolean(source.enabled, true) };
    case "matching":
      return {
        routingPolicy: policy,
        noEligibleOutcome: "review",
      };
    case "review":
      return {
        retryMode: "manual",
        maxRetries: Math.max(0, Math.min(integer(source.maxRetries, 3), 10)),
      };
    case "assignment":
      return {
        preserveExistingOwner: true,
        recipientFunctions: ["Sale", "CTV Sale"],
        createStudent: false,
      };
  }
}

function normalizeConfig(value: unknown): LeadAssignmentWorkflowConfig {
  const source = asRecord(value) ?? {};
  const stored = asRecord(source.stored) ?? {};
  const input = asRecord(stored.input) ?? {};
  const classification = asRecord(stored.classification) ?? {};
  const review = asRecord(stored.review) ?? {};
  return {
    schemaVersion: text(source.schemaVersion, "lead-assignment-workflow-v1"),
    version: text(source.version, "lead-assignment-workflow-v0"),
    revision: Math.max(0, integer(source.revision)),
    applyScope: "new_decisions",
    lastChangedBy: nullableText(source.lastChangedBy),
    lastChangeReason: nullableText(source.lastChangeReason),
    stored: {
      input: normalizeSettings("input", input, {} as LeadRoutingPolicy) as LeadAssignmentWorkflowInputSettings,
      classification: normalizeSettings(
        "classification",
        classification,
        {} as LeadRoutingPolicy,
      ) as LeadAssignmentWorkflowClassificationSettings,
      review: normalizeSettings(
        "review",
        review,
        {} as LeadRoutingPolicy,
      ) as LeadAssignmentWorkflowReviewSettings,
    },
  };
}

function normalizeSteps(
  value: unknown,
  policy: LeadRoutingPolicy,
): Record<LeadAssignmentWorkflowStepId, LeadAssignmentWorkflowStepSnapshot> {
  const source = asRecord(value) ?? {};
  const result = {} as Record<
    LeadAssignmentWorkflowStepId,
    LeadAssignmentWorkflowStepSnapshot
  >;
  for (const id of STEP_IDS) {
    const row = asRecord(source[id]) ?? {};
    result[id] = {
      id,
      enabled: id === "validation" || id === "matching" || id === "review" || id === "assignment"
        ? true
        : boolean(row.enabled, true),
      canToggle: id === "input" || id === "classification",
      settings: normalizeSettings(id, row.settings, policy),
    };
  }
  return result;
}

function baseUrl(options: LeadAssignmentWorkflowConfigRequestOptions): string {
  return (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
}

function cookieHeader(value: string): string {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function headers(
  options: LeadAssignmentWorkflowConfigRequestOptions,
  write: boolean,
): Promise<Record<string, string>> {
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
      // API contract tests can run without Next request cookies.
    }
  }
  if (write && typeof window !== "undefined") {
    const csrf = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (csrf) {
      result["X-Frappe-CSRF-Token"] = decodeURIComponent(csrf);
    } else {
      try {
        const sessionResponse = await fetch(
          `${baseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const sessionPayload = (await sessionResponse
          .json()
          .catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        const csrfToken = sessionPayload?.message?.csrf_token;
        if (typeof csrfToken === "string" && csrfToken) {
          result["X-Frappe-CSRF-Token"] = csrfToken;
        }
      } catch {
        // Fallback to cookie-only authentication.
      }
    }
  }
  return result;
}

function errorDetails(
  value: unknown,
  status: number,
): { code: string; message: string } {
  const root = asRecord(value);
  const nested = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(nested?.error);
  const serialized = JSON.stringify(value);
  const revisionConflict = serialized.includes("WORKFLOW_REVISION_CONFLICT");
  return {
    code: text(
      error?.code,
      revisionConflict ? "WORKFLOW_REVISION_CONFLICT" : status === 403 ? "FORBIDDEN" : `HTTP_${status}`,
    ),
    message:
      text(error?.message) ||
      text(nested?.message) ||
      text(root?._error_message) ||
      text(root?.exception) ||
      (revisionConflict
        ? "Cấu hình workflow đã thay đổi. Hãy tải lại trước khi lưu lần nữa."
        : undefined) ||
      (status === 403
        ? "Bạn không có quyền thay đổi cấu hình workflow phân công Lead."
        : "Không thể cập nhật cấu hình workflow phân công Lead."),
  };
}

async function call<T>(
  method: string,
  requestMethod: "GET" | "POST",
  options: LeadAssignmentWorkflowConfigRequestOptions,
  body?: Record<string, unknown>,
): Promise<T> {
  const urlBase = baseUrl(options);
  if (!urlBase) {
    throw new LeadAssignmentWorkflowConfigApiError(
      503,
      "LEAD_ASSIGNMENT_WORKFLOW_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }
  let response: Response;
  try {
    response = await fetch(`${urlBase}/api/method/${method}`, {
      method: requestMethod,
      headers: await headers(options, requestMethod !== "GET"),
      ...(typeof window !== "undefined" ? { credentials: "include" } : {}),
      cache: "no-store",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new LeadAssignmentWorkflowConfigApiError(
      503,
      "LEAD_ASSIGNMENT_WORKFLOW_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ cấu hình workflow phân công Lead.",
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new LeadAssignmentWorkflowConfigApiError(
      response.status,
      details.code,
      details.message,
    );
  }
  return (asRecord(payload)?.message ?? payload) as T;
}

export async function getLeadAssignmentWorkflowConfig(
  options: LeadAssignmentWorkflowConfigRequestOptions = {},
): Promise<LeadAssignmentWorkflowConfigResponse> {
  const raw = await call<unknown>(METHODS.GET, "GET", options);
  const source = asRecord(unwrapMessage(raw));
  const policy = normalizeLeadRoutingPolicy(source?.policy);
  if (!source?.config || !source.steps) {
    throw new LeadAssignmentWorkflowConfigApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_WORKFLOW_CONFIG",
      "Phản hồi cấu hình workflow phân công Lead không hợp lệ.",
    );
  }
  return {
    schemaVersion: text(source.schemaVersion, "lead-assignment-workflow-v1"),
    config: normalizeConfig(source.config),
    steps: normalizeSteps(source.steps, policy),
    policy,
    canManage: boolean(source.canManage),
  };
}

export async function updateLeadAssignmentWorkflowStep(
  request: LeadAssignmentWorkflowStepUpdate,
  options: LeadAssignmentWorkflowConfigRequestOptions = {},
): Promise<LeadAssignmentWorkflowConfigResponse> {
  const raw = await call<unknown>(METHODS.UPDATE, "POST", options, {
    step_id: request.stepId,
    settings: JSON.stringify(request.settings),
    reason: request.reason,
    expected_revision: request.expectedRevision,
  });
  const source = asRecord(unwrapMessage(raw));
  if (!source?.config || !source.steps) {
    throw new LeadAssignmentWorkflowConfigApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_WORKFLOW_CONFIG",
      "Phản hồi cấu hình workflow sau khi lưu không hợp lệ.",
    );
  }
  const policy = normalizeLeadRoutingPolicy(source.policy);
  return {
    schemaVersion: text(source.schemaVersion, "lead-assignment-workflow-v1"),
    config: normalizeConfig(source.config),
    steps: normalizeSteps(source.steps, policy),
    policy,
    canManage: boolean(source.canManage, true),
  };
}
