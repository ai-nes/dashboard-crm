/** The signed-in account, built from `GET /api/v1/me`. */
export interface CurrentUser {
  /** User id (the login email). */
  user: string;
  email: string;
  full_name: string;
  /** Absolute or site-relative avatar URL, or null when unset. */
  user_image: string | null;
  roles: string[];
  /** Canonical CRM profile slug, e.g. "sales" / "admissions_director". */
  crm_profile: string | null;
  /** Human-readable CRM role label. */
  crm_role: string | null;
  crm_capabilities: string[];
  /** Effective record CRUD flags for the signed-in account. */
  crm_doctype_permissions?: Record<string, CurrentUserDocTypePermission>;
  /** Current Staff memberships used by organization-aware screens. */
  crm_team_memberships?: CurrentUserTeamMembership[];
  /** Members of Groups currently managed by the session user. */
  crm_managed_group_members?: CurrentUserManagedGroupMember[];
}

export interface CurrentUserDocTypePermission {
  row_scope?: string | null;
  read: boolean;
  write: boolean;
  create: boolean;
  delete: boolean;
  export: boolean;
}

export interface CurrentUserTeamMembership {
  id: string;
  team_id: string;
  team_name: string;
  group_id: string | null;
  group_name: string | null;
  province_id: string | null;
  role: string;
  function: string;
  membership_role: "Trưởng nhóm" | "Thành viên";
  team_role: "team_lead" | "member";
  is_team_lead: boolean;
  is_primary: boolean;
  term: string | null;
}

export interface CurrentUserManagedGroupMember {
  id: string;
  staff_id: string;
  full_name: string;
  email: string | null;
  team_id: string;
  team_name: string;
  group_id: string;
  group_name: string;
  province_id: string | null;
  role: string;
  function: string;
  membership_role: "Trưởng nhóm" | "Thành viên";
  team_role: "team_lead" | "member";
  is_team_lead: boolean;
  is_primary: boolean;
}

export interface SessionUser {
  name: string;
  email: string;
  full_name: string;
  roles: string[];
  crm_profile: string | null;
}
