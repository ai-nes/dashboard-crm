import type {
  CrmUser,
  CrmUserCapacity,
  PermissionProfile,
  PermissionProfileDoctype,
  PermissionProfileRowScope,
  UserRoleLog,
  UserRoleLogAction,
} from "./types";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function booleanValue(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "1" || value === "true";
  return fallback;
}

export function unwrapMethodPayload(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message ?? value;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeCrmUserCapacity(
  value: unknown,
): CrmUserCapacity | null {
  const object = asRecord(value);
  if (!object) return null;
  return {
    limit: numberOrNull(object.limit),
    active: numberOrNull(object.active) ?? 0,
    remaining: numberOrNull(object.remaining),
    configured: booleanValue(object.configured, false),
  };
}

export function normalizeCrmUser(
  value: unknown,
  capacityByUser?: Record<string, unknown>,
): CrmUser | null {
  const object = asRecord(value);
  if (!object || typeof object.name !== "string") return null;

  return {
    name: object.name,
    email: stringValue(object.email, object.name),
    fullName: stringValue(object.full_name, object.name),
    userImage: nullableString(object.user_image),
    enabled: booleanValue(object.enabled, true),
    role: nullableString(object.role),
    crmRoleState: nullableString(object.crm_role_state),
    sessionUser: booleanValue(object.session_user, false),
    capacity: normalizeCrmUserCapacity(capacityByUser?.[object.name]),
  };
}

export function normalizeUserRoleLog(value: unknown): UserRoleLog | null {
  const object = asRecord(value);
  if (!object || typeof object.name !== "string") return null;

  const action: UserRoleLogAction =
    object.action === "removed" ? "removed" : "role_changed";

  return {
    name: object.name,
    user: stringValue(object.user),
    action,
    previousRole: nullableString(object.previous_role),
    newRole: nullableString(object.new_role),
    owner: stringValue(object.owner),
    creation: stringValue(object.creation),
  };
}

const ROW_SCOPES: PermissionProfileRowScope[] = [
  "assigned",
  "own_assigned",
  "campus_assigned",
  "campus_assigned_contact",
  "team_and_team_pool",
  "team_members_and_own_team_pool",
  "no_case_scope",
  "all",
  "deny",
];

function normalizePermissionProfileDoctype(
  value: unknown,
): PermissionProfileDoctype | null {
  const object = asRecord(value);
  const documentType = stringValue(object?.document_type).trim();
  if (!documentType) return null;

  return {
    documentType,
    label: stringValue(object?.label).trim() || undefined,
    description: stringValue(object?.description).trim() || undefined,
    includedDoctypes: Array.isArray(object?.included_doctypes)
      ? object.included_doctypes.filter(
          (doctype): doctype is string => typeof doctype === "string",
        )
      : undefined,
    groupLabel: stringValue(object?.group_label).trim() || undefined,
    read: booleanValue(object?.read),
    write: booleanValue(object?.write),
    create: booleanValue(object?.create),
    delete: booleanValue(object?.delete),
    export: booleanValue(object?.export),
  };
}

export function normalizePermissionProfile(
  value: unknown,
): PermissionProfile | null {
  const object = asRecord(value);
  const rowScope = stringValue(object?.row_scope) as PermissionProfileRowScope;
  const role = stringValue(object?.role).trim();
  const name = stringValue(object?.name).trim();
  if (!role || !name || !ROW_SCOPES.includes(rowScope)) return null;

  const applicableDoctypes = Array.isArray(object?.applicable_doctypes)
    ? object.applicable_doctypes.flatMap(
        (item) => normalizePermissionProfileDoctype(item) ?? [],
      )
    : [];

  return {
    name,
    role,
    rowScope,
    deleteRequiresOwnership: booleanValue(object?.delete_requires_ownership),
    isSystemManaged: booleanValue(object?.is_system_managed),
    applicableDoctypes,
  };
}
