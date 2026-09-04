export const ACTION_TIME_SLOTS = [
  "0-6",
  "6-12",
  "12-18",
  "18-24",
] as const;

export type ActionTimeSlot = (typeof ACTION_TIME_SLOTS)[number];

export interface NbaAction {
  name: string;
  code: string;
  displayName: string;
  actionType: string | null;
  description: string | null;
  purpose: string | null;
  defaultChannel: string | null;
  allowedTimeSlots: ActionTimeSlot[];
  enabled: boolean;
}

export interface NbaActionType {
  name: string;
  actionType: string;
  displayName: string;
  enabled: boolean;
}

export interface ListNbaActionsParams {
  actionType?: string;
  enabled?: boolean;
  search?: string;
  start?: number;
  pageLength?: number;
}

export interface ListNbaActionsResponse {
  total: number;
  start: number;
  pageLength: number;
  actions: NbaAction[];
}

export interface ListNbaActionTypesResponse {
  total: number;
  start: number;
  pageLength: number;
  actionTypes: NbaActionType[];
}

export interface ListNbaTimeSlotsResponse {
  timeSlots: ActionTimeSlot[];
}

export interface UpdateNbaActionPayload {
  name: string;
  allowedTimeSlots: ActionTimeSlot[];
}

export interface UpdateNbaActionResponse {
  name: string;
  action: NbaAction | null;
}
