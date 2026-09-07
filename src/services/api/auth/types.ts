/** Shape returned by `crm.api.session.me` on the Frappe backend. */
export interface CurrentUser {
  /** Frappe user id (the login email). */
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
  /** Current Staff memberships used by organization-aware screens. */
  crm_team_memberships?: CurrentUserTeamMembership[];
  /** Members of Groups currently managed by the session user. */
  crm_managed_group_members?: CurrentUserManagedGroupMember[];
  /** Session-bound token required by Frappe for authenticated write requests. */
  csrf_token: string | null;
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

/** Raw `frappe.whitelist` envelope: the payload sits under `message`. */
export interface FrappeMessage<T> {
  message?: T;
}
