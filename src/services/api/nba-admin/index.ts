import { NestApiError, nestRequest } from "../nest/nest-client";
import { NOT_HANDLED } from "../nest/nest-handler";
import { nestNbaHandler } from "../nest/nest-nba-router";
import { normalizeActionType, normalizeTimingPolicy } from "./normalizers";
import type {
  CreateActionTypePayload,
  ListActionTypesParams,
  ListActionTypesResponse,
  ListTimingPoliciesParams,
  ListTimingPoliciesResponse,
  NbaAdminActionType,
  NbaTimingPolicy,
  TimingPolicyPayload,
  UpdateActionTypePayload,
} from "./types";

export type * from "./types";

const METHODS = {
  LIST_ACTION_TYPES: "crm.api.action_type.list_action_types",
  GET_ACTION_TYPE: "crm.api.action_type.get_action_type",
  CREATE_ACTION_TYPE: "crm.api.action_type.create_action_type",
  UPDATE_ACTION_TYPE: "crm.api.action_type.update_action_type",
  DELETE_ACTION_TYPE: "crm.api.action_type.delete_action_type",
} as const;

const TIMING_POLICIES_PATH = "/api/v1/nba/timing-policies";

export class NbaAdminApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "NbaAdminApiError";
  }
}

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

function toAdminError(error: unknown): unknown {
  if (error instanceof NestApiError) {
    return new NbaAdminApiError(error.status, error.code, error.message);
  }
  return error;
}

/** Runs one action-type operation through the Nest adapter. */
async function callActionType<T>(
  method: string,
  params: Record<string, string | undefined>,
  body?: RecordValue,
): Promise<T> {
  try {
    const result = await nestNbaHandler(method, params, body);
    if (result === NOT_HANDLED) {
      throw new NbaAdminApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return result as T;
  } catch (error) {
    throw toAdminError(error);
  }
}

async function callTimingPolicy<T>(
  path: string,
  options: Parameters<typeof nestRequest>[1] = {},
): Promise<T> {
  try {
    return await nestRequest<T>(path, options);
  } catch (error) {
    throw toAdminError(error);
  }
}

function requireModified(modified: string | null | undefined): string {
  const value = modified?.trim();
  if (!value) {
    throw new NbaAdminApiError(
      400,
      "INVALID_MODIFIED",
      "Thiếu phiên bản dữ liệu chính sách; hãy tải lại trang.",
    );
  }
  return value;
}

function numberValue(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function listValue(value: unknown, key: string): unknown[] {
  const payload = asRecord(value);
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

export async function listAdminActionTypes(
  params: ListActionTypesParams = {},
): Promise<ListActionTypesResponse> {
  const raw = await callActionType<unknown>(METHODS.LIST_ACTION_TYPES, {
    enabled:
      params.enabled === undefined ? undefined : params.enabled ? "1" : "0",
    search: params.search,
    start: String(params.start ?? 0),
    page_length: String(params.pageLength ?? 100),
  });
  const payload = asRecord(raw);
  const rows = listValue(raw, "action_types").map(normalizeActionType);
  return {
    total: numberValue(payload?.total, rows.length),
    start: numberValue(payload?.start, params.start ?? 0),
    pageLength: numberValue(payload?.page_length, params.pageLength ?? 100),
    actionTypes: rows,
  };
}

export async function getAdminActionType(
  name: string,
): Promise<NbaAdminActionType> {
  return normalizeActionType(
    await callActionType(METHODS.GET_ACTION_TYPE, { name }),
  );
}

export async function updateAdminActionType(
  payload: UpdateActionTypePayload,
): Promise<NbaAdminActionType> {
  const raw = await callActionType(
    METHODS.UPDATE_ACTION_TYPE,
    { name: payload.name },
    {
      ...(payload.displayName !== undefined
        ? { display_name: payload.displayName }
        : {}),
      ...(payload.enabled !== undefined
        ? { enabled: payload.enabled ? 1 : 0 }
        : {}),
      ...(payload.sortOrder !== undefined
        ? { sort_order: payload.sortOrder }
        : {}),
    },
  );
  return normalizeActionType(raw);
}

export async function createAdminActionType(
  payload: CreateActionTypePayload,
): Promise<NbaAdminActionType> {
  const raw = await callActionType(
    METHODS.CREATE_ACTION_TYPE,
    {},
    {
      action_type: payload.actionType,
      display_name: payload.displayName,
      enabled: payload.enabled ? 1 : 0,
      sort_order: payload.sortOrder,
    },
  );
  return normalizeActionType(raw);
}

export async function deleteAdminActionType(name: string): Promise<void> {
  await callActionType(METHODS.DELETE_ACTION_TYPE, { name });
}

export async function listTimingPolicies(
  params: ListTimingPoliciesParams = {},
): Promise<ListTimingPoliciesResponse> {
  const raw = await callTimingPolicy<unknown>(TIMING_POLICIES_PATH, {
    query: {
      search: params.search,
      trigger_type:
        params.triggerType && params.triggerType !== "all"
          ? params.triggerType
          : undefined,
      start: params.start ?? 0,
      page_length: params.pageLength ?? 20,
    },
  });
  const payload = asRecord(raw);
  const policies = listValue(raw, "policies").map(normalizeTimingPolicy);
  return {
    total: numberValue(payload?.total, policies.length),
    start: numberValue(payload?.start, params.start ?? 0),
    pageLength: numberValue(payload?.page_length, params.pageLength ?? 20),
    policies,
  };
}

export async function getTimingPolicy(name: string): Promise<NbaTimingPolicy> {
  return normalizeTimingPolicy(
    await callTimingPolicy(
      `${TIMING_POLICIES_PATH}/${encodeURIComponent(name)}`,
    ),
  );
}

/** The editor sends empty text for cleared fields; the API stores them as null. */
const textOrNull = (value: string | undefined) => value?.trim() || null;
function timingPolicyBody(
  payload: TimingPolicyPayload,
): Record<string, unknown> {
  return {
    ...(payload.policyKey !== undefined
      ? { policy_key: payload.policyKey }
      : {}),
    trigger_type: payload.triggerType,
    ...(payload.triggerEvent !== undefined
      ? { trigger_event: textOrNull(payload.triggerEvent) }
      : {}),
    ...(payload.delayValue !== undefined
      ? { delay_value: payload.delayValue }
      : {}),
    ...(payload.delayUnit !== undefined
      ? { delay_unit: payload.delayUnit }
      : {}),
    ...(payload.timeSlot !== undefined ? { time_slot: payload.timeSlot } : {}),
    ...(payload.allowedStartTime !== undefined
      ? { allowed_start_time: textOrNull(payload.allowedStartTime) }
      : {}),
    ...(payload.allowedEndTime !== undefined
      ? { allowed_end_time: textOrNull(payload.allowedEndTime) }
      : {}),
    ...(payload.deadlineType !== undefined
      ? { deadline_type: payload.deadlineType }
      : {}),
    ...(payload.deadlineOffset !== undefined
      ? { deadline_offset: payload.deadlineOffset }
      : {}),
    ...(payload.recurrenceType !== undefined
      ? { recurrence_type: payload.recurrenceType }
      : {}),
    ...(payload.recurrenceInterval !== undefined
      ? { recurrence_interval: payload.recurrenceInterval }
      : {}),
    ...(payload.stopCondition !== undefined
      ? { stop_condition: textOrNull(payload.stopCondition) }
      : {}),
    ...(payload.optimizationEnabled !== undefined
      ? { optimization_enabled: payload.optimizationEnabled }
      : {}),
    ...(payload.optimizationObjective !== undefined
      ? { optimization_objective: textOrNull(payload.optimizationObjective) }
      : {}),
  };
}

export async function createTimingPolicy(
  payload: TimingPolicyPayload,
): Promise<NbaTimingPolicy> {
  return normalizeTimingPolicy(
    await callTimingPolicy(TIMING_POLICIES_PATH, {
      method: "POST",
      body: timingPolicyBody(payload),
    }),
  );
}

export async function updateTimingPolicy(
  name: string,
  payload: TimingPolicyPayload,
  expectedModified: string | null | undefined,
): Promise<NbaTimingPolicy> {
  const expected = requireModified(expectedModified);
  const body = timingPolicyBody(payload);
  // The key identifies the record and cannot change.
  delete body.policy_key;
  return normalizeTimingPolicy(
    await callTimingPolicy(
      `${TIMING_POLICIES_PATH}/${encodeURIComponent(name)}`,
      {
        method: "PATCH",
        body: { ...body, expectedModified: expected },
      },
    ),
  );
}

export async function deleteTimingPolicy(
  name: string,
  expectedModified: string | null | undefined,
): Promise<void> {
  const expected = requireModified(expectedModified);
  await callTimingPolicy(
    `${TIMING_POLICIES_PATH}/${encodeURIComponent(name)}`,
    {
      method: "DELETE",
      query: { expectedModified: expected },
    },
  );
}
