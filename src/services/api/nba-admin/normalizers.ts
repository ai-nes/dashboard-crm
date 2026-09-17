import { ACTION_TIME_SLOTS, type ActionTimeSlot } from "@/services/api/nba-actions";

import type {
  NbaAdminActionType,
  NbaTimingPolicy,
} from "./types";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}
function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown, fallback = 0): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "1" || value === "true";
  return fallback;
}

function enumValue<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : fallback;
}

function timeSlot(value: unknown): ActionTimeSlot | null {
  return enumValue(value, ACTION_TIME_SLOTS, "" as ActionTimeSlot) || null;
}

export function unwrapMethodPayload(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message ?? value;
}

export function normalizeActionType(value: unknown): NbaAdminActionType {
  const object = asRecord(value);
  if (!object) throw new Error("action type must be an object");
  const actionType = stringValue(object.action_type ?? object.actionType ?? object.name);
  if (!actionType) throw new Error("action type code is missing");

  return {
    name: stringValue(object.name, actionType),
    actionType,
    displayName: stringValue(object.display_name ?? object.displayName, actionType),
    enabled: booleanValue(object.enabled, true),
    sortOrder: numberValue(object.sort_order ?? object.sortOrder),
    modified: nullableString(object.modified),
  };
}

export function normalizeTimingPolicy(value: unknown): NbaTimingPolicy {
  const object = asRecord(value);
  if (!object) throw new Error("timing policy must be an object");
  const policyKey = stringValue(object.policy_key ?? object.policyKey ?? object.name);
  if (!policyKey) throw new Error("timing policy key is missing");

  return {
    name: stringValue(object.name, policyKey),
    policyKey,
    triggerType: enumValue(object.trigger_type ?? object.triggerType, ["event", "relative", "deadline", "schedule"], "relative"),
    triggerEvent: nullableString(object.trigger_event ?? object.triggerEvent),
    delayValue: numberValue(object.delay_value ?? object.delayValue),
    delayUnit: enumValue(object.delay_unit ?? object.delayUnit, ["minutes", "hours", "days"], "hours"),
    timeSlot: timeSlot(object.time_slot ?? object.timeSlot),
    allowedStartTime: nullableString(object.allowed_start_time ?? object.allowedStartTime),
    allowedEndTime: nullableString(object.allowed_end_time ?? object.allowedEndTime),
    deadlineType: enumValue(object.deadline_type ?? object.deadlineType, ["none", "fixed_offset", "business_days"], "none"),
    deadlineOffset: numberValue(object.deadline_offset ?? object.deadlineOffset),
    recurrenceType: enumValue(object.recurrence_type ?? object.recurrenceType, ["none", "daily", "weekly", "monthly"], "none"),
    recurrenceInterval: numberValue(object.recurrence_interval ?? object.recurrenceInterval, 1),
    stopCondition: nullableString(object.stop_condition ?? object.stopCondition),
    optimizationEnabled: booleanValue(object.optimization_enabled ?? object.optimizationEnabled),
    optimizationObjective: nullableString(object.optimization_objective ?? object.optimizationObjective),
    modified: nullableString(object.modified),
  };
}
