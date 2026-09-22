export type LeadRoutingLayerKey = "campaign" | "group" | "global";
export type LeadRoutingStrategy = "least_load" | "round_robin";

export interface LeadRoutingLayer {
  key: LeadRoutingLayerKey;
  label: string;
  enabled: boolean;
  priority: number;
}

export interface LeadRoutingPolicy {
  enabled: boolean;
  layers: LeadRoutingLayer[];
  layerOrder: LeadRoutingLayerKey[];
  distributionStrategy: LeadRoutingStrategy;
  capacityRequired: boolean;
  revision: number;
  version: string;
  applyScope: "new_decisions";
  sameCampus: boolean;
  teamLeadFallback: boolean;
  lastChangedBy: string | null;
  lastChangeReason: string | null;
}

export interface LeadRoutingPolicyResponse {
  schemaVersion: string;
  policy: LeadRoutingPolicy;
  canManage: boolean;
}

export interface UpdateLeadRoutingPolicyRequest {
  enabled: boolean;
  layerOrder: LeadRoutingLayerKey[];
  campaignLayerEnabled: boolean;
  groupLayerEnabled: boolean;
  globalLayerEnabled: boolean;
  distributionStrategy: LeadRoutingStrategy;
  capacityRequired: boolean;
  reason: string;
}

export interface LeadRoutingPolicyRequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class LeadRoutingPolicyApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "LeadRoutingPolicyApiError";
  }
}

const METHODS = {
  GET: "crm.api.assignment_control.get_lead_routing_policy_snapshot",
  UPDATE: "crm.api.assignment_control.update_lead_routing_policy",
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

function normalizeLayerKey(value: unknown): LeadRoutingLayerKey | null {
  return value === "campaign" || value === "group" || value === "global"
    ? value
    : null;
}

export function normalizeLeadRoutingPolicy(value: unknown): LeadRoutingPolicy {
  const source = asRecord(value) ?? {};
  const rawLayers = Array.isArray(source.layers) ? source.layers : [];
  const layers = rawLayers.flatMap((value, index): LeadRoutingLayer[] => {
    const row = asRecord(value) ?? {};
    const key = normalizeLayerKey(row.key);
    if (!key) return [];
    return [
      {
        key,
        label: text(row.label, key),
        enabled: boolean(row.enabled, true),
        priority: integer(row.priority, index + 1),
      },
    ];
  });
  const layerOrder = (
    Array.isArray(source.layerOrder)
      ? source.layerOrder
      : layers.map((layer) => layer.key)
  ).flatMap((value): LeadRoutingLayerKey[] => {
    const key = normalizeLayerKey(value);
    return key ? [key] : [];
  });
  const strategy =
    source.distributionStrategy === "round_robin"
      ? "round_robin"
      : "least_load";
  return {
    enabled: boolean(source.enabled),
    layers,
    layerOrder,
    distributionStrategy: strategy,
    capacityRequired: boolean(source.capacityRequired, true),
    revision: integer(source.revision),
    version: text(source.version, "lead-routing-v0"),
    applyScope: "new_decisions",
    sameCampus: boolean(source.sameCampus, true),
    teamLeadFallback: boolean(source.teamLeadFallback),
    lastChangedBy:
      typeof source.lastChangedBy === "string" ? source.lastChangedBy : null,
    lastChangeReason:
      typeof source.lastChangeReason === "string"
        ? source.lastChangeReason
        : null,
  };
}

function baseUrl(options: LeadRoutingPolicyRequestOptions): string {
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
  options: LeadRoutingPolicyRequestOptions,
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
      // Contract tests may not provide Next request cookies.
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
  return {
    code: text(error?.code, status === 403 ? "FORBIDDEN" : `HTTP_${status}`),
    message:
      text(error?.message) ||
      text(nested?.message) ||
      text(root?._error_message) ||
      text(root?.exception) ||
      (status === 403
        ? "Bạn không có quyền thay đổi cấu hình phân bổ Lead."
        : "Không thể cập nhật cấu hình phân bổ Lead."),
  };
}

async function call<T>(
  method: string,
  requestMethod: "GET" | "POST",
  options: LeadRoutingPolicyRequestOptions,
  body?: Record<string, unknown>,
): Promise<T> {
  const urlBase = baseUrl(options);
  if (!urlBase) {
    throw new LeadRoutingPolicyApiError(
      503,
      "LEAD_ROUTING_API_UNAVAILABLE",
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
    throw new LeadRoutingPolicyApiError(
      503,
      "LEAD_ROUTING_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ phân bổ Lead.",
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new LeadRoutingPolicyApiError(
      response.status,
      details.code,
      details.message,
    );
  }
  return (asRecord(payload)?.message ?? payload) as T;
}

export async function getLeadRoutingPolicy(
  options: LeadRoutingPolicyRequestOptions = {},
): Promise<LeadRoutingPolicyResponse> {
  const raw = await call<unknown>(METHODS.GET, "GET", options);
  const source = asRecord(unwrapMessage(raw));
  const policy = source?.policy;
  if (!source || !policy) {
    throw new LeadRoutingPolicyApiError(
      502,
      "INVALID_LEAD_ROUTING_POLICY",
      "Phản hồi policy phân bổ Lead không hợp lệ.",
    );
  }
  return {
    schemaVersion: text(source.schemaVersion, "lead-routing-policy-v1"),
    policy: normalizeLeadRoutingPolicy(policy),
    canManage: boolean(source.canManage),
  };
}

export async function updateLeadRoutingPolicy(
  request: UpdateLeadRoutingPolicyRequest,
  options: LeadRoutingPolicyRequestOptions = {},
): Promise<LeadRoutingPolicyResponse> {
  const raw = await call<unknown>(METHODS.UPDATE, "POST", options, {
    enabled: request.enabled,
    layer_order: request.layerOrder.join(","),
    campaign_layer_enabled: request.campaignLayerEnabled,
    group_layer_enabled: request.groupLayerEnabled,
    global_layer_enabled: request.globalLayerEnabled,
    distribution_strategy: request.distributionStrategy,
    capacity_required: request.capacityRequired,
    reason: request.reason,
  });
  const source = asRecord(unwrapMessage(raw));
  if (!source?.policy) {
    throw new LeadRoutingPolicyApiError(
      502,
      "INVALID_LEAD_ROUTING_POLICY",
      "Phản hồi policy sau khi lưu không hợp lệ.",
    );
  }
  return {
    schemaVersion: text(source.schemaVersion, "lead-routing-policy-v1"),
    policy: normalizeLeadRoutingPolicy(source.policy),
    canManage: boolean(source.canManage, true),
  };
}
