/**
 * Adapter for the user-management operations. The admin screen keeps its
 * client contract while these calls use the Nest user, permission-profile, and
 * staff-capacity resources.
 */
import { nestGetCurrentUser } from "./nest-auth";
import { NestApiError, nestRequest } from "./nest-client";
import {
  NOT_HANDLED,
  type MethodHandler,
  type Params,
} from "./nest-handler";

const USERS = "/api/v1/users";
const PERMISSION_PROFILES = "/api/v1/permission-profiles";
const STAFF_CAPACITY = "/api/v1/staff-capacity";

const PROFILE_BY_LABEL: Record<string, string> = {
  Sale: "sales",
  "CTV Sale": "ctv_sale",
  "Lead Sale": "lead_sales",
  Promoter: "pr",
  "Lead Promoter": "pr_manager",
  Marketing: "marketing",
  "Lead Marketing": "lead_marketing",
  "Admissions Director": "admissions_director",
  Administrator: "ceo",
};

const LABEL_BY_PROFILE: Record<string, string> = Object.fromEntries(
  Object.entries(PROFILE_BY_LABEL).map(([label, profile]) => [profile, label]),
);

interface NestUser {
  id: string;
  email: string;
  name: string;
  identityRole: "admin" | "user";
  crmProfile: string | null;
  emailVerified: boolean;
  status: "active" | "suspended";
}

interface UsersPage {
  data: NestUser[];
  meta: { pagination: { page: number; pageSize: number; total: number } };
}

interface CapacitySnapshot {
  limit: number | null;
  active: number;
  remaining: number | null;
  configured: boolean;
}

function profileOf(label: unknown): string {
  const profile =
    typeof label === "string" ? PROFILE_BY_LABEL[label] : undefined;
  if (!profile) {
    throw new NestApiError(
      400,
      "INVALID_CRM_PROFILE",
      "Vai trò CRM không hợp lệ.",
    );
  }
  return profile;
}

function userIdOf(value: unknown): string {
  return encodeURIComponent(String(value ?? ""));
}

function idempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `dashboard-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function legacyRole(user: NestUser): string | null {
  return (
    (user.crmProfile ? LABEL_BY_PROFILE[user.crmProfile] : undefined) ??
    (user.identityRole === "admin" ? "System Manager" : null)
  );
}

function legacyUser(
  user: NestUser,
  capacity: CapacitySnapshot | undefined,
  currentEmail: string | null,
) {
  return {
    name: user.id,
    email: user.email,
    full_name: user.name,
    user_image: null,
    enabled: user.status === "active",
    role: legacyRole(user),
    crm_role_state: user.crmProfile ? "assigned" : null,
    session_user: user.email === currentEmail,
    ...(capacity ? { capacity } : {}),
  };
}

function legacyPermissionProfile(profile: Record<string, unknown>) {
  const rows = Array.isArray(profile.applicableDoctypes)
    ? profile.applicableDoctypes
    : [];
  return {
    name: profile.name,
    role: profile.role,
    row_scope: profile.rowScope,
    delete_requires_ownership: profile.deleteRequiresOwnership,
    is_system_managed: profile.isSystemManaged,
    applicable_doctypes: rows.map((row) => {
      const value = row as Record<string, unknown>;
      return {
        document_type: value.documentType,
        label: value.label,
        description: value.description,
        included_doctypes: value.includedDoctypes,
        group_label: value.groupLabel,
        read: value.read,
        write: value.write,
        create: value.create,
        delete: value.delete,
        export: value.export,
      };
    }),
  };
}

async function listUsers(params: Params) {
  const start = Math.max(0, Number(params.start ?? 0) || 0);
  const pageLength = Math.min(
    100,
    Math.max(1, Number(params.page_length ?? 20) || 20),
  );
  const page = Math.floor(start / pageLength) + 1;
  const role =
    params.role && params.role !== "all" ? profileOf(params.role) : undefined;
  const [users, capacityResponse, current] = await Promise.all([
    nestRequest<UsersPage>(USERS, {
      query: {
        page,
        pageSize: pageLength,
        search: params.search?.trim() || undefined,
        crmProfile: role,
      },
    }),
    nestRequest<{ data: Record<string, CapacitySnapshot> }>(
      STAFF_CAPACITY,
    ).catch((error: unknown) => {
      if (error instanceof NestApiError && error.status === 403) return null;
      throw error;
    }),
    nestGetCurrentUser().catch(() => null),
  ]);
  const capacityByUser = capacityResponse?.data ?? {};
  const currentEmail = current?.email ?? null;

  return {
    users: users.data.map((user) =>
      legacyUser(user, capacityByUser[user.id], currentEmail),
    ),
    total: users.meta.pagination.total,
    start,
    page_length: pageLength,
  };
}

export const nestUserManagementHandler: MethodHandler = async (
  method,
  params,
  body,
) => {
  switch (method) {
    case "crm.api.session.list_admin_users":
    case "crm.api.session.get_users":
      return listUsers(params);

    case "crm.api.user.update_user_role":
      await nestRequest(`${USERS}/${userIdOf(body?.user)}/crm-profile`, {
        method: "PUT",
        body: { crmProfile: profileOf(body?.new_role) },
      });
      return null;

    case "crm.api.user.remove_crm_roles_from_user":
      await nestRequest(`${USERS}/${userIdOf(body?.user)}/crm-profile`, {
        method: "PUT",
        body: { crmProfile: null },
      });
      return null;

    case "crm.api.user.create_crm_user": {
      const requestedProfile = body?.role
        ? profileOf(body.role)
        : profileOf("Sale");
      const created = await nestRequest<{ data: NestUser }>(USERS, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey() },
        body: {
          email: body?.email,
          name: body?.full_name,
          password: body?.password,
        },
      });
      await nestRequest(`${USERS}/${userIdOf(created.data.id)}/crm-profile`, {
        method: "PUT",
        body: { crmProfile: requestedProfile },
      });
      return created.data.id;
    }

    case "crm.api.user.update_crm_user_profile":
      await nestRequest(`${USERS}/${userIdOf(body?.user)}/profile`, {
        method: "PATCH",
        body: {
          fullName: body?.full_name,
          newPassword: body?.new_password,
        },
      });
      return null;

    case "crm.api.assignment_control.list_user_capacity": {
      const result = await nestRequest<{
        data: Record<string, CapacitySnapshot>;
      }>(STAFF_CAPACITY);
      return result.data;
    }

    case "crm.api.assignment_control.upsert_user_capacity": {
      const result = await nestRequest<{ data: CapacitySnapshot }>(
        `${STAFF_CAPACITY}/${userIdOf(body?.user)}`,
        {
          method: "PUT",
          body: {
            maxActiveStudents: Number(body?.max_active_students),
            reason: body?.reason,
          },
        },
      );
      return result.data;
    }

    case "crm.api.user.list_user_role_logs": {
      const result = await nestRequest<{
        data: Array<{
          id: string;
          userId: string;
          action: "role_changed" | "removed";
          previousRole: string | null;
          newRole: string | null;
          actorEmail: string;
          occurredAt: string;
        }>;
        meta: { pagination: { page: number; pageSize: number; total: number } };
      }>(`${USERS}/role-logs`, {
        query: {
          user: params.user,
          page:
            Math.floor(
              Math.max(0, Number(params.start ?? 0) || 0) /
                Math.max(1, Number(params.page_length ?? 50) || 50),
            ) + 1,
          pageSize: Math.min(
            200,
            Math.max(1, Number(params.page_length ?? 50) || 50),
          ),
        },
      });
      const pageSize = result.meta.pagination.pageSize;
      return {
        logs: result.data.map((log) => ({
          name: log.id,
          user: log.userId,
          action: log.action,
          previous_role: log.previousRole
            ? (LABEL_BY_PROFILE[log.previousRole] ?? log.previousRole)
            : null,
          new_role: log.newRole
            ? (LABEL_BY_PROFILE[log.newRole] ?? log.newRole)
            : null,
          owner: log.actorEmail,
          creation: log.occurredAt,
        })),
        total: result.meta.pagination.total,
        start: (result.meta.pagination.page - 1) * pageSize,
        page_length: pageSize,
      };
    }

    case "crm.api.permission_profile.list_permission_profiles": {
      const result = await nestRequest<{
        data: {
          profiles: Array<Record<string, unknown>>;
          selectedRole: string | null;
          viewMode: "grouped" | "detailed";
        };
        meta: {
          pagination: { total: number; start: number; pageSize: number };
        };
      }>(PERMISSION_PROFILES, {
        query: {
          role: params.role,
          start: params.start,
          pageSize: params.page_length,
          viewMode: params.view_mode,
        },
      });
      return {
        profiles: result.data.profiles.map(legacyPermissionProfile),
        selected_role: result.data.selectedRole,
        total: result.meta.pagination.total,
        start: result.meta.pagination.start,
        page_length: result.meta.pagination.pageSize,
        view_mode: result.data.viewMode,
      };
    }

    case "crm.api.permission_profile.update_permission_profile": {
      const role = encodeURIComponent(String(body?.role ?? ""));
      const result = await nestRequest<{ data: Record<string, unknown> }>(
        `${PERMISSION_PROFILES}/${role}`,
        {
          method: "PUT",
          body: {
            rowScope: body?.row_scope,
            deleteRequiresOwnership: body?.delete_requires_ownership,
            applicableDoctypes: Array.isArray(body?.applicable_doctypes)
              ? body.applicable_doctypes.map((row) => {
                  const value = row as Record<string, unknown>;
                  return {
                    documentType: value.document_type,
                    read: value.read,
                    write: value.write,
                    create: value.create,
                    delete: value.delete,
                    export: value.export,
                  };
                })
              : [],
            replaceApplicableDoctypes: body?.replace_applicable_doctypes,
            viewMode: body?.view_mode,
          },
        },
      );
      return legacyPermissionProfile(result.data);
    }

    default:
      return NOT_HANDLED;
  }
};
