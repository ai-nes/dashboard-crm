import type {
  CurrentUser,
  CurrentUserDocTypePermission,
} from "@/services/api/auth";

import { getEffectiveDashboardRoles } from "./rbac";

export type CrmRecordScope = "assigned" | "team" | "all" | "none";
export type CrmPermissionAction = "create" | "read" | "update" | "delete";

export function hasCrmCapability(
  user: CurrentUser | null | undefined,
  capability: string,
): boolean {
  return user?.crm_capabilities?.includes(capability) ?? false;
}

const CRM_RULE_ADMIN_ROLES = new Set([
  "System Manager",
  "Admissions Director",
  "Business Admin",
]);

/** Mirrors the Frappe Rule Engine admin gate; server authorization remains authoritative. */
export function canManageCrmRules(
  user: CurrentUser | null | undefined,
): boolean {
  return (
    user?.user === "Administrator" ||
    (user?.roles.some((role) => CRM_RULE_ADMIN_ROLES.has(role)) ?? false)
  );
}

export interface CrmResourcePermissions {
  /** Scope used for mutations on an existing record. */
  scope: CrmRecordScope;
  /** Optional broader scope used only for read/list access. */
  readScope?: CrmRecordScope;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  /** Whether the user may change the owner within the allowed scope. */
  canAssign: boolean;
}

export interface CrmPermissions {
  lead: CrmResourcePermissions;
  student: CrmResourcePermissions;
  task: CrmResourcePermissions;
}

const NO_ACCESS: CrmResourcePermissions = {
  scope: "none",
  canCreate: false,
  canRead: false,
  canUpdate: false,
  canDelete: false,
  canAssign: false,
};

function toRecordScope(value: string | null | undefined): CrmRecordScope {
  switch (value) {
    case "all":
      return "all";
    case "team_and_team_pool":
    case "team_members_and_own_team_pool":
      return "team";
    case "assigned":
    case "own_assigned":
    case "campus_assigned":
    case "campus_assigned_contact":
      return "assigned";
    default:
      return "none";
  }
}

function toResourcePermissions(
  user: CurrentUser | null | undefined,
  documentType: string,
  canAssign: boolean,
): CrmResourcePermissions {
  const permission: CurrentUserDocTypePermission | undefined =
    user?.crm_doctype_permissions?.[documentType];
  if (!permission) return NO_ACCESS;

  const scope = toRecordScope(permission.row_scope);
  const readScope =
    scope === "assigned" && hasCrmCapability(user, "student.routing.read")
      ? "team"
      : scope;

  return {
    scope,
    readScope,
    canCreate: permission.create,
    canRead: permission.read,
    canUpdate: permission.write,
    canDelete: permission.delete,
    canAssign,
  };
}

/**
 * Frontend capability map for the Sales workspaces.
 *
 * Frappe remains the source of truth for authorization. These capabilities
 * only keep the UI from exposing actions that the current role cannot use.
 */
export function getCrmPermissions(
  user: CurrentUser | null | undefined,
): CrmPermissions {
  const canAssign = hasCrmCapability(user, "student.ownership.manage");
  return {
    lead: toResourcePermissions(user, "CRM Lead", canAssign),
    student: toResourcePermissions(user, "CRM Student", canAssign),
    task: toResourcePermissions(user, "Task", false),
  };
}

export interface StudentOwnershipInfo {
  owner?: string | null;
  ownerId?: string | null;
  counselor?: string | null;
}

function normalizeIdentity(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("vi-VN") ?? "";
}

function getUserIdentifiers(user: CurrentUser | null | undefined): Set<string> {
  return new Set(
    [user?.user, user?.email, user?.full_name]
      .map(normalizeIdentity)
      .filter(Boolean),
  );
}

export function isStudentAssignedToUser(
  student: StudentOwnershipInfo,
  user: CurrentUser | null | undefined,
): boolean {
  const userIdentifiers = getUserIdentifiers(user);
  if (userIdentifiers.size === 0) return false;

  return [student.ownerId, student.owner, student.counselor]
    .map(normalizeIdentity)
    .some((identifier) => identifier && userIdentifiers.has(identifier));
}

export function canAccessStudent(
  permissions: CrmResourcePermissions,
  student: StudentOwnershipInfo,
  user: CurrentUser | null | undefined,
): boolean {
  if (!permissions.canRead) return false;
  const readScope = permissions.readScope ?? permissions.scope;
  if (readScope === "all" || readScope === "team") return true;
  if (readScope !== "assigned") return false;
  return isStudentAssignedToUser(student, user);
}

export function canPerformStudentAction(
  permissions: CrmResourcePermissions,
  action: CrmPermissionAction,
  student: StudentOwnershipInfo,
  user: CurrentUser | null | undefined,
): boolean {
  const capabilityByAction: Record<
    CrmPermissionAction,
    keyof Pick<
      CrmResourcePermissions,
      "canCreate" | "canRead" | "canUpdate" | "canDelete"
    >
  > = {
    create: "canCreate",
    read: "canRead",
    update: "canUpdate",
    delete: "canDelete",
  };

  if (!permissions[capabilityByAction[action]]) return false;
  if (action === "read") return canAccessStudent(permissions, student, user);

  if (!permissions.canRead) return false;
  if (permissions.scope === "all" || permissions.scope === "team") return true;
  if (permissions.scope !== "assigned") return false;
  return isStudentAssignedToUser(student, user);
}

export function canConvertLeadToStudent(
  roles: readonly string[] | null | undefined,
  lead: StudentOwnershipInfo,
  user: CurrentUser | null | undefined,
): boolean {
  const effectiveRoles = getEffectiveDashboardRoles(roles);
  if (effectiveRoles.includes("Lead Sale")) return true;
  if (
    !effectiveRoles.includes("Sale") &&
    !effectiveRoles.includes("CTV Sale")
  ) {
    return false;
  }
  return isStudentAssignedToUser(lead, user);
}
