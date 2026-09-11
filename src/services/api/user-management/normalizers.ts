import type { CrmUser, UserRoleLog, UserRoleLogAction } from "./types";

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

export function normalizeCrmUser(value: unknown): CrmUser | null {
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
  };
}

export function normalizeUserRoleLog(value: unknown): UserRoleLog | null {
  const object = asRecord(value);
  if (!object || typeof object.name !== "string") return null;

  const action: UserRoleLogAction = object.action === "removed" ? "removed" : "role_changed";

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
