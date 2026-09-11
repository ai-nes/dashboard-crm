export interface RequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
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
