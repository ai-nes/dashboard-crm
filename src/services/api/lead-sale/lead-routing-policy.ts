import { NestApiError, nestRequest } from "../nest/nest-client";

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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

async function nestCall(
  method: "GET" | "PUT",
  body?: Record<string, unknown>,
): Promise<unknown> {
  try {
    return await nestRequest("/api/v1/lead-routing-policy", { method, body });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new LeadRoutingPolicyApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

export async function getLeadRoutingPolicy(): Promise<LeadRoutingPolicyResponse> {
  const source = asRecord(await nestCall("GET"));
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
): Promise<LeadRoutingPolicyResponse> {
  const source = asRecord(
    await nestCall("PUT", {
      enabled: request.enabled,
      layerOrder: request.layerOrder.join(","),
      campaignLayerEnabled: request.campaignLayerEnabled,
      groupLayerEnabled: request.groupLayerEnabled,
      globalLayerEnabled: request.globalLayerEnabled,
      distributionStrategy: request.distributionStrategy,
      capacityRequired: request.capacityRequired,
      reason: request.reason,
    }),
  );
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
