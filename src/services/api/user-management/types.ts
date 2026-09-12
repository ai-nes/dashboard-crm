export interface RequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface CrmUserCapacity {
  /** Max active Leads this Sale/CTV Sale may hold; null when not configured. */
  limit: number | null;
  active: number;
  remaining: number | null;
  /** False when this Sale/CTV Sale has never had a capacity period set — they cannot receive Leads until one is set. */
  configured: boolean;
}

export interface CrmUser {
  name: string;
  email: string;
  fullName: string;
  userImage: string | null;
  enabled: boolean;
  role: string | null;
  crmRoleState: string | null;
  sessionUser: boolean;
  /** Null when the user has no active CRM Staff record yet (never joined a Sales Team). */
  capacity: CrmUserCapacity | null;
}

export interface ListCrmUsersResponse {
  allUsers: CrmUser[];
  crmUsers: CrmUser[];
}

export interface UpdateUserRolePayload {
  user: string;
  newRole: string;
}

export interface RemoveUserPayload {
  user: string;
}

export interface CreateCrmUserPayload {
  email: string;
  fullName: string;
  password: string;
  role: string;
}

export interface UpdateCrmUserProfilePayload {
  user: string;
  fullName?: string;
  newPassword?: string;
}

export interface UpdateUserCapacityPayload {
  user: string;
  maxActiveStudents: number;
  reason?: string;
}

export type UserRoleLogAction = "role_changed" | "removed";

export interface UserRoleLog {
  name: string;
  user: string;
  action: UserRoleLogAction;
  previousRole: string | null;
  newRole: string | null;
  owner: string;
  creation: string;
}

export interface ListUserRoleLogsParams {
  user?: string;
  start?: number;
  pageLength?: number;
}

export interface ListUserRoleLogsResponse {
  logs: UserRoleLog[];
  total: number;
  start: number;
  pageLength: number;
}
