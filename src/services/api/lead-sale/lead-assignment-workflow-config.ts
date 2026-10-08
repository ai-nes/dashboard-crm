import { NestApiError, nestRequest } from "../nest/nest-client";
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

export type LeadAssignmentWorkflowInputUpdate =
  Partial<LeadAssignmentWorkflowInputSettings>;
export type LeadAssignmentWorkflowClassificationUpdate =
  Partial<LeadAssignmentWorkflowClassificationSettings>;
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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
      input: normalizeSettings(
        "input",
        input,
        {} as LeadRoutingPolicy,
      ) as LeadAssignmentWorkflowInputSettings,
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
      enabled:
        id === "validation" ||
        id === "matching" ||
        id === "review" ||
        id === "assignment"
          ? true
          : boolean(row.enabled, true),
      canToggle: id === "input" || id === "classification",
      settings: normalizeSettings(id, row.settings, policy),
    };
  }
  return result;
}

async function nestCall(
  path: string,
  method: "GET" | "PUT",
  body?: Record<string, unknown>,
): Promise<unknown> {
  try {
    return await nestRequest(path, { method, body });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new LeadAssignmentWorkflowConfigApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

export async function getLeadAssignmentWorkflowConfig(): Promise<LeadAssignmentWorkflowConfigResponse> {
  const source = asRecord(
    await nestCall("/api/v1/lead-assignment-workflow", "GET"),
  );
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
): Promise<LeadAssignmentWorkflowConfigResponse> {
  const source = asRecord(
    await nestCall(
      `/api/v1/lead-assignment-workflow/steps/${encodeURIComponent(request.stepId)}`,
      "PUT",
      {
        settings: request.settings,
        reason: request.reason,
        expectedRevision: request.expectedRevision,
      },
    ),
  );
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
