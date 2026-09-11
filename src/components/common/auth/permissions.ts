import type { CurrentUser } from "@/services/api/auth";

import { getEffectiveDashboardRoles } from "./rbac";

export type CrmRecordScope = "assigned" | "team" | "all" | "none";
export type CrmPermissionAction = "create" | "read" | "update" | "delete";

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

const FULL_ACCESS: CrmResourcePermissions = {
  scope: "all",
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canAssign: true,
};

const LEAD_SALE_STUDENT_ACCESS: CrmResourcePermissions = {
  scope: "all",
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canAssign: true,
};

const SALE_STUDENT_ACCESS: CrmResourcePermissions = {
  scope: "assigned",
  // Sale can read the pool and team queue for assignment work, while edits
  // remain restricted to students assigned to the current user.
  readScope: "team",
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: false,
  canAssign: true,
};

const CTV_SALE_STUDENT_ACCESS: CrmResourcePermissions = {
  scope: "assigned",
  canCreate: false,
  canRead: true,
  canUpdate: true,
  canDelete: false,
  canAssign: false,
};

const SALE_TASK_ACCESS: CrmResourcePermissions = {
  scope: "assigned",
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canAssign: false,
};

const CTV_SALE_TASK_ACCESS: CrmResourcePermissions = {
  scope: "assigned",
  canCreate: false,
  canRead: true,
  canUpdate: true,
  canDelete: false,
  canAssign: false,
};

/**
 * Frontend capability map for the Sales workspaces.
 *
 * Frappe remains the source of truth for authorization. These capabilities
 * only keep the UI from exposing actions that the current role cannot use.
 */
export function getCrmPermissions(
  roles: readonly string[] | null | undefined,
): CrmPermissions {
  const effectiveRoles = getEffectiveDashboardRoles(roles);

  if (
    effectiveRoles.includes("System Manager") ||
    effectiveRoles.includes("Admissions Director") ||
    effectiveRoles.includes("Administrator")
  ) {
    return { lead: FULL_ACCESS, student: FULL_ACCESS, task: FULL_ACCESS };
  }

  if (effectiveRoles.includes("Lead Sale")) {
    return {
      lead: LEAD_SALE_STUDENT_ACCESS,
      student: LEAD_SALE_STUDENT_ACCESS,
      task: FULL_ACCESS,
    };
  }

  if (effectiveRoles.includes("Sale")) {
    return {
      lead: SALE_STUDENT_ACCESS,
      student: SALE_STUDENT_ACCESS,
      task: SALE_TASK_ACCESS,
    };
  }

  if (effectiveRoles.includes("CTV Sale")) {
    return {
      lead: CTV_SALE_STUDENT_ACCESS,
      student: CTV_SALE_STUDENT_ACCESS,
      task: CTV_SALE_TASK_ACCESS,
    };
  }

  return { lead: NO_ACCESS, student: NO_ACCESS, task: NO_ACCESS };
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
