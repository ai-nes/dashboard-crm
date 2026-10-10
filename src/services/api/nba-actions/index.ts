import { NestApiError } from "../nest/nest-client";
import { NOT_HANDLED } from "../nest/nest-handler";
import { nestNbaHandler } from "../nest/nest-nba-router";
import {
  normalizeNbaActionTypesResponse,
  normalizeNbaActionUpdateResponse,
  normalizeNbaActionsResponse,
  normalizeNbaTimeSlotsResponse,
} from "./normalizers";
import type {
  ListNbaActionTypesResponse,
  ListNbaActionsParams,
  ListNbaActionsResponse,
  ListNbaTimeSlotsResponse,
  CreateNbaActionPayload,
  NbaAction,
  UpdateNbaActionPayload,
  UpdateNbaActionResponse,
} from "./types";

export type * from "./types";
export { ACTION_TIME_SLOTS } from "./types";
export * from "./normalizers";

const METHODS = {
  LIST_ACTIONS: "crm.api.action.list_actions",
  GET_ACTION: "crm.api.action.get_action",
  CREATE_ACTION: "crm.api.action.create_action",
  UPDATE_ACTION: "crm.api.action.update_action",
  DELETE_ACTION: "crm.api.action.delete_action",
  LIST_ACTION_TYPES: "crm.api.action_type.list_action_types",
  LIST_TIME_SLOTS: "crm.api.action.list_time_slots",
} as const;

export class NbaActionsApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "NbaActionsApiError";
  }
}

type QueryValue = string | number | undefined;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Runs one action operation through the Nest adapter. */
async function callNbaActionsApi<T>(
  method: string,
  query: Record<string, QueryValue> = {},
  body?: Record<string, unknown>,
): Promise<T> {
  const params: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params[key] = String(value);
  }

  try {
    const result = await nestNbaHandler(method, params, body);
    if (result === NOT_HANDLED) {
      throw new NbaActionsApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return result as T;
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new NbaActionsApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

export async function listNbaActions(
  params: ListNbaActionsParams = {},
): Promise<ListNbaActionsResponse> {
  const raw = await callNbaActionsApi<unknown>(METHODS.LIST_ACTIONS, {
    action_type: params.actionType,
    default_channel: params.channel,
    enabled: params.enabled === undefined ? undefined : params.enabled ? 1 : 0,
    search: params.search,
    start: params.start ?? 0,
    page_length: params.pageLength ?? 20,
  });

  try {
    return normalizeNbaActionsResponse(raw);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTIONS_RESPONSE",
      "Phản hồi danh sách Action NBA không hợp lệ.",
    );
  }
}

export async function getNbaAction(name: string): Promise<NbaAction> {
  const raw = await callNbaActionsApi<unknown>(METHODS.GET_ACTION, { name });

  try {
    const payload = asRecord(raw)?.message ?? raw;
    return normalizeNbaActionsResponse({ actions: [payload] }).actions[0];
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTION_RESPONSE",
      "Phản hồi chi tiết Action NBA không hợp lệ.",
    );
  }
}
function actionBody(
  payload: CreateNbaActionPayload | UpdateNbaActionPayload,
): Record<string, unknown> {
  return {
    ...("code" in payload ? { code: payload.code } : {}),
    ...(payload.displayName !== undefined
      ? { display_name: payload.displayName }
      : {}),
    ...(payload.actionType !== undefined
      ? { action_type: payload.actionType }
      : {}),
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
    ...(payload.purpose !== undefined ? { purpose: payload.purpose } : {}),
    ...(payload.defaultChannel !== undefined
      ? { default_channel: payload.defaultChannel }
      : {}),
    ...(payload.allowedActors !== undefined
      ? { allowed_actors: payload.allowedActors }
      : {}),
    ...(payload.allowedTimeSlots !== undefined
      ? { allowed_time_slots: payload.allowedTimeSlots }
      : {}),
    ...(payload.requiresApproval !== undefined
      ? { requires_approval: payload.requiresApproval ? 1 : 0 }
      : {}),
    ...(payload.autoExecute !== undefined
      ? { auto_execute: payload.autoExecute ? 1 : 0 }
      : {}),
    ...(payload.executionType !== undefined
      ? { execution_type: payload.executionType }
      : {}),
    ...(payload.aiAllowed !== undefined
      ? { ai_allowed: payload.aiAllowed ? 1 : 0 }
      : {}),
    ...(payload.enabled !== undefined
      ? { enabled: payload.enabled ? 1 : 0 }
      : {}),
    ...(payload.sortOrder !== undefined
      ? { sort_order: payload.sortOrder }
      : {}),
  };
}

export async function createNbaAction(
  payload: CreateNbaActionPayload,
): Promise<NbaAction> {
  const raw = await callNbaActionsApi<unknown>(
    METHODS.CREATE_ACTION,
    {},
    actionBody(payload),
  );

  try {
    const response = normalizeNbaActionsResponse({
      actions: [asRecord(raw)?.message ?? raw],
    });
    return response.actions[0];
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTION_CREATE_RESPONSE",
      "Phản hồi tạo Action NBA không hợp lệ.",
    );
  }
}

export async function listNbaActionTypes(): Promise<ListNbaActionTypesResponse> {
  const raw = await callNbaActionsApi<unknown>(METHODS.LIST_ACTION_TYPES, {
    start: 0,
    page_length: 100,
  });

  try {
    return normalizeNbaActionTypesResponse(raw);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTION_TYPES_RESPONSE",
      "Phản hồi danh sách loại Action không hợp lệ.",
    );
  }
}

export async function listNbaTimeSlots(): Promise<ListNbaTimeSlotsResponse> {
  const raw = await callNbaActionsApi<unknown>(METHODS.LIST_TIME_SLOTS);

  try {
    return normalizeNbaTimeSlotsResponse(raw);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_TIME_SLOTS_RESPONSE",
      "Phản hồi danh sách khung giờ không hợp lệ.",
    );
  }
}

export async function updateNbaAction(
  payload: UpdateNbaActionPayload,
): Promise<UpdateNbaActionResponse> {
  const raw = await callNbaActionsApi<unknown>(
    METHODS.UPDATE_ACTION,
    { name: payload.name },
    actionBody(payload),
  );

  try {
    return normalizeNbaActionUpdateResponse(raw, payload.name);
  } catch {
    throw new NbaActionsApiError(
      502,
      "INVALID_NBA_ACTION_UPDATE_RESPONSE",
      "Phản hồi cập nhật Action NBA không hợp lệ.",
    );
  }
}

export async function deleteNbaAction(name: string): Promise<void> {
  await callNbaActionsApi<unknown>(METHODS.DELETE_ACTION, { name });
}
