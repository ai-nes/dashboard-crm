import type {
  CurrentUser,
  CurrentUserDocTypePermission,
} from "@/services/api/auth";

import { getDefaultRouteForRoles, getEffectiveDashboardRoles } from "./rbac";

export type CrmRecordScope = "assigned" | "team" | "all" | "none";
export type CrmPermissionAction = "create" | "read" | "update" | "delete";

export function hasCrmCapability(
  user: CurrentUser | null | undefined,
  capability: string,
): boolean {
  return user?.crm_capabilities?.includes(capability) ?? false;
}

export interface CrmDoctypePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

/** Effective business grants returned by the backend, including non-case data. */
export function getCrmDoctypePermissions(
  user: CurrentUser | null | undefined,
  documentType: string,
): CrmDoctypePermissions {
  const permission = user?.crm_doctype_permissions?.[documentType];
  const canRead = permission?.read === true;
  return {
    canRead,
    canCreate: canRead && permission?.create === true,
    canUpdate: canRead && permission?.write === true,
    canDelete: canRead && permission?.delete === true,
    canExport: canRead && permission?.export === true,
  };
}

const CRM_PATH_RESOURCES: ReadonlyArray<{
  path: string;
  documentTypes: readonly string[];
  exact?: boolean;
  requiresAllScope?: boolean;
  requireAllResources?: boolean;
}> = [
  {
    path: "/director/ai/next-best-action",
    documentTypes: ["CRM Student", "CRM Recommendation"],
    requireAllResources: true,
  },
  { path: "/director/tasks", documentTypes: ["Task"] },
  {
    path: "/director/message-template",
    documentTypes: ["CRM Message Template"],
  },
  { path: "/director/snippest", documentTypes: ["CRM Snippet"] },
  {
    path: "/director/admin/message-templates",
    documentTypes: ["CRM Message Template Library"],
  },
  { path: "/director/admin/rules-config", documentTypes: ["CRM Rule"] },
  { path: "/director/admin/catalogs", documentTypes: ["CRM Score Template"] },
  { path: "/director/admin/segments", documentTypes: ["CRM Segment"] },
  {
    path: "/director/admin/nba-actions",
    documentTypes: ["CRM Action", "CRM Action Type", "CRM Timing Policy"],
  },
  {
    path: "/director",
    documentTypes: ["CRM Student"],
    exact: true,
    requiresAllScope: true,
  },
  {
    path: "/director/demographics",
    documentTypes: ["CRM Student"],
    requiresAllScope: true,
  },
  {
    path: "/director/admission-funnel",
    documentTypes: ["CRM Student"],
    requiresAllScope: true,
  },
  {
    path: "/director/regional-performance",
    documentTypes: ["CRM Student"],
    requiresAllScope: true,
  },
  {
    path: "/director/revenue-forecast",
    documentTypes: ["CRM Student"],
    requiresAllScope: true,
  },
  {
    path: "/director/market-intelligence",
    documentTypes: ["CRM High School", "CRM Student"],
    requiresAllScope: true,
    requireAllResources: true,
  },
  { path: "/director/campaigns", documentTypes: ["CRM Campaign"] },
  { path: "/director/students", documentTypes: ["CRM Student"] },
  { path: "/director/leads", documentTypes: ["CRM Lead"] },
  {
    path: "/director/schools",
    documentTypes: ["CRM High School", "CRM Student"],
    requireAllResources: true,
    requiresAllScope: true,
  },
  {
    path: "/director/school",
    documentTypes: ["CRM High School", "CRM Student"],
    requireAllResources: true,
    requiresAllScope: true,
  },
  {
    path: "/director/school-field-activity",
    documentTypes: ["CRM High School", "CRM Student"],
    requireAllResources: true,
    requiresAllScope: true,
  },
  {
    path: "/director/campaign-intelligence",
    documentTypes: ["CRM Campaign", "CRM Student"],
    requireAllResources: true,
    requiresAllScope: true,
  },
  {
    path: "/director/admin/majors",
    documentTypes: [
      "CRM Major",
      "CRM Major Group",
      "CRM Education Program",
      "CRM Province",
      "CRM Ward",
      "CRM Admission Year",
      "CRM Campaign Type",
      "CRM Platform",
      "CRM Lead Source",
    ],
  },
  {
    path: "/director/admin/student-config",
    documentTypes: [
      "CRM Campus",
      "CRM Admission Profile Template",
      "CRM Document Type",
      "CRM Admission Method",
    ],
  },
];

/** Adds resource read grants to the existing role-based route policy. */
export function canReadCrmPath(
  path: string,
  user: CurrentUser | null | undefined,
): boolean {
  const pathname = path.split(/[?#]/, 1)[0];
  if (pathname === "/director/admin/activity-logs")
    return user?.crm_is_administrator === true;
  if (pathname === "/director/sla")
    return canReadCrmPath("/director/ai/next-best-action", user);
  if (pathname === "/director/admin/action-recommendations")
    return canReadCrmPath("/director/admin/nba-actions", user);
  if (pathname === "/director/activity-campaign") {
    const tab = new URLSearchParams(path.split("?")[1]?.split("#")[0]).get(
      "tab",
    );
    const field = canReadCrmPath("/director/school-field-activity", user);
    const campaign = canReadCrmPath("/director/campaign-intelligence", user);
    return tab === "field"
      ? field
      : tab === "campaign"
        ? campaign
        : field || campaign;
  }
  const resource = CRM_PATH_RESOURCES.find(
    (entry) =>
      pathname === entry.path ||
      (!entry.exact && pathname.startsWith(`${entry.path}/`)),
  );
  if (!resource) return true;
  const hasReadAccess = (documentType: string) => {
    if (documentType === "CRM Student") {
      const permission = getCrmPermissions(user).student;
      return (
        permission.canRead &&
        (!resource.requiresAllScope || permission.readScope === "all")
      );
    }
    if (documentType === "CRM Lead")
      return getCrmPermissions(user).lead.canRead;
    return getCrmDoctypePermissions(user, documentType).canRead;
  };
  return resource.requireAllResources
    ? resource.documentTypes.every(hasReadAccess)
    : resource.documentTypes.some(hasReadAccess);
}

/** Resolve the role entry without routing through a workspace the user cannot read. */
export function getCrmHomePath(user: CurrentUser | null | undefined): string {
  const destination = getDefaultRouteForRoles(user?.roles);
  return canReadCrmPath(destination, user) ? destination : "/profile";
}

/** Mirrors the Rule Engine admin gate; server authorization remains authoritative. */
export function canManageCrmRules(
  user: CurrentUser | null | undefined,
): boolean {
  return getCrmDoctypePermissions(user, "CRM Rule").canUpdate;
}

export interface CrmResourcePermissions {
  deleteRequiresOwnership?: boolean;
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
  if (!permission.read || scope === "none") return NO_ACCESS;
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
    deleteRequiresOwnership: permission.delete_requires_ownership,
    canAssign: canAssign && permission.write,
  };
}

/**
 * Frontend capability map for CRM case workspaces.
 *
 * The backend remains the source of truth for authorization. These capabilities
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
    [user?.crm_user_id, user?.user, user?.email, user?.full_name]
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
  if (
    action === "delete" &&
    permissions.deleteRequiresOwnership &&
    !isStudentAssignedToUser(student, user)
  )
    return false;
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
