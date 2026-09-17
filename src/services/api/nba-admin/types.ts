import type { ActionTimeSlot } from "@/services/api/nba-actions";

export type TimingTriggerType = "event" | "relative" | "deadline" | "schedule";
export type DelayUnit = "minutes" | "hours" | "days";
export type DeadlineType = "none" | "fixed_offset" | "business_days";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface NbaAdminActionType {
  name: string;
  actionType: string;
  displayName: string;
  enabled: boolean;
  sortOrder: number;
  modified: string | null;
}

export interface ListActionTypesParams {
  enabled?: boolean;
  search?: string;
  start?: number;
  pageLength?: number;
}

export interface ListActionTypesResponse {
  total: number;
  start: number;
  pageLength: number;
  actionTypes: NbaAdminActionType[];
}

export interface UpdateActionTypePayload {
  name: string;
  displayName?: string;
  enabled?: boolean;
  sortOrder?: number;
}

export interface CreateActionTypePayload {
  actionType: string;
  displayName: string;
  enabled: boolean;
  sortOrder: number;
}

export interface NbaTimingPolicy {
  name: string;
  policyKey: string;
  triggerType: TimingTriggerType;
  triggerEvent: string | null;
  delayValue: number;
  delayUnit: DelayUnit;
  timeSlot: ActionTimeSlot | null;
  allowedStartTime: string | null;
  allowedEndTime: string | null;
  deadlineType: DeadlineType;
  deadlineOffset: number;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  stopCondition: string | null;
  optimizationEnabled: boolean;
  optimizationObjective: string | null;
  modified: string | null;
}

export interface TimingPolicyPayload {
  policyKey?: string;
  triggerType: TimingTriggerType;
  triggerEvent?: string;
  delayValue?: number;
  delayUnit?: DelayUnit;
  timeSlot?: ActionTimeSlot | null;
  allowedStartTime?: string;
  allowedEndTime?: string;
  deadlineType?: DeadlineType;
  deadlineOffset?: number;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  stopCondition?: string;
  optimizationEnabled?: boolean;
  optimizationObjective?: string;
}

export interface ListTimingPoliciesParams {
  search?: string;
  triggerType?: TimingTriggerType | "all";
  start?: number;
  pageLength?: number;
}

export interface ListTimingPoliciesResponse {
  total: number;
  start: number;
  pageLength: number;
  policies: NbaTimingPolicy[];
}

export type RequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};
