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
  total: number;
  start: number;
  pageLength: number;
}

export interface ListCrmUsersParams {
  search?: string;
  role?: string;
  start?: number;
  pageLength?: number;
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

export type PermissionProfileRowScope =
  | "assigned"
  | "own_assigned"
  | "campus_assigned"
  | "campus_assigned_contact"
  | "team_and_team_pool"
  | "team_members_and_own_team_pool"
  | "no_case_scope"
  | "all"
  | "deny";

export type PermissionFlag = "read" | "write" | "create" | "delete" | "export";

export interface PermissionProfileDoctype {
  documentType: string;
  read: boolean;
  write: boolean;
  create: boolean;
  delete: boolean;
  export: boolean;
}

export interface PermissionProfile {
  name: string;
  role: string;
  rowScope: PermissionProfileRowScope;
  deleteRequiresOwnership: boolean;
  isSystemManaged: boolean;
  applicableDoctypes: PermissionProfileDoctype[];
}

export interface ListPermissionProfilesParams {
  role?: string;
  start?: number;
  pageLength?: number;
}

export interface ListPermissionProfilesResponse {
  profiles: PermissionProfile[];
  selectedRole: string | null;
  total: number;
  start: number;
  pageLength: number;
}

export interface UpdatePermissionProfilePayload {
  role: string;
  rowScope: PermissionProfileRowScope;
  deleteRequiresOwnership: boolean;
  applicableDoctypes: PermissionProfileDoctype[];
  replaceApplicableDoctypes?: boolean;
}
