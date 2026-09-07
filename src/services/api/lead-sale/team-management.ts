export interface TeamManagementGroup {
  id: string;
  name: string;
  leadId: string | null;
  teamIds: string[];
  teamCount: number;
  memberCount: number;
  isActive: boolean;
  revision: string;
}

export interface TeamManagementTeam {
  id: string;
  name: string;
  groupId: string | null;
  teamType: string;
  campusId: string;
  territoryId: string | null;
  leadId: string | null;
  memberIds: string[];
  memberCount: number;
  zoneCount: number;
  isActive: boolean;
  readiness: "ready" | "not_ready" | "inactive";
  readinessReason: string;
  revision: string;
}

export interface TeamManagementMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: "SALE" | "CTV_SALE" | "LEAD_SALE";
  isActive: boolean;
  campusId: string | null;
  teamIds: string[];
  memberships: Array<{
    id: string;
    teamId: string;
    function: string;
    role: "SALE" | "CTV_SALE" | "LEAD_SALE";
    isPrimary: boolean;
    isTeamLead: boolean;
    term: string | null;
  }>;
  revision: string;
}

export interface TeamManagementWorkspace {
  schemaVersion: string;
  asOf: string;
  summary: {
    groupCount: number;
    teamCount: number;
    activeTeamCount: number;
    staffCount: number;
    activeStaffCount: number;
  };
  groups: TeamManagementGroup[];
  teams: TeamManagementTeam[];
  members: TeamManagementMember[];
  options: {
    campuses: Array<{ id: string; label: string }>;
    functions: Array<{ value: string; label: string }>;
  };
  permissions: { canManage: boolean; canManageAll: boolean };
}

export interface TeamManagementRequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface TeamManagementMutationResponse {
  action: string;
  status: string;
  correlation_id?: string;
  replayed?: boolean;
  groupId?: string;
  teamId?: string;
  staffId?: string;
  revision?: string;
}

export class TeamManagementApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "TeamManagementApiError";
  }
}

const METHODS = {
  WORKSPACE: "crm.api.team_management.get_team_management_workspace",
  SAVE_GROUP: "crm.api.team_management.save_team_group",
  SAVE_TEAM: "crm.api.team_management.save_team",
  ADD_MEMBER: "crm.api.team_management.add_team_member",
  MOVE_MEMBER: "crm.api.team_management.move_team_member",
  REMOVE_MEMBER: "crm.api.team_management.remove_team_member",
  UPDATE_MEMBER: "crm.api.team_management.update_team_member",
} as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function resolveBaseUrl(options: TeamManagementRequestOptions): string {
  return (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
}

function cookieHeader(value: string): string {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function headers(
  options: TeamManagementRequestOptions,
  write: boolean,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {
    Accept: "application/json",
    ...(write ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };
  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const sid = cookieHeader((await cookies()).toString());
      if (sid) result.Cookie = sid;
    } catch {
      // Client-side calls use credentials instead.
    }
  }
  if (typeof window !== "undefined" && write) {
    const csrf = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (csrf) {
      result["X-Frappe-CSRF-Token"] = decodeURIComponent(csrf);
    } else {
      try {
        const sessionResponse = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const sessionPayload = (await sessionResponse
          .json()
          .catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        const csrfToken = sessionPayload?.message?.csrf_token;
        if (typeof csrfToken === "string" && csrfToken) {
          result["X-Frappe-CSRF-Token"] = csrfToken;
        }
      } catch {
        // Fallback to cookie-only authentication.
      }
    }
  }
  return result;
}

function errorDetails(payload: unknown, status: number) {
  const root = asRecord(payload);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);
  return {
    code:
      text(error?.code) ||
      (status === 401
        ? "UNAUTHENTICATED"
        : status === 403
          ? "FORBIDDEN"
          : `HTTP_${status}`),
    message:
      text(error?.message) ||
      text(message?.message) ||
      text(root?.message) ||
      text(root?.exception) ||
      "Không thể thực hiện thao tác quản lý đội ngũ.",
  };
}

async function call<T>(
  method: string,
  options: TeamManagementRequestOptions,
  body?: Record<string, unknown>,
): Promise<T> {
  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    throw new TeamManagementApiError(
      503,
      "TEAM_MANAGEMENT_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/method/${method}`, {
      method: body ? "POST" : "GET",
      headers: await headers(options, Boolean(body)),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new TeamManagementApiError(
      503,
      "TEAM_MANAGEMENT_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ CRM.",
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new TeamManagementApiError(
      response.status,
      details.code,
      details.message,
    );
  }
  return (asRecord(payload)?.message ?? payload) as T;
}

function idempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `team-management-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function getTeamManagementWorkspace(
  options: TeamManagementRequestOptions = {},
): Promise<TeamManagementWorkspace> {
  const workspace = await call<unknown>(METHODS.WORKSPACE, options);
  const payload = asRecord(workspace);
  if (
    !payload ||
    !Array.isArray(payload.groups) ||
    !Array.isArray(payload.teams)
  ) {
    throw new TeamManagementApiError(
      502,
      "INVALID_TEAM_MANAGEMENT_RESPONSE",
      "Dữ liệu quản lý đội ngũ không hợp lệ.",
    );
  }
  return workspace as TeamManagementWorkspace;
}

export async function saveTeamGroup(
  payload: {
    groupId?: string;
    groupName: string;
    groupLeadStaff?: string | null;
    clearGroupLead?: boolean;
    isActive?: boolean;
    expectedRevision?: string;
  },
  options: TeamManagementRequestOptions = {},
) {
  return call<TeamManagementMutationResponse>(METHODS.SAVE_GROUP, options, {
    group_id: payload.groupId,
    group_name: payload.groupName,
    group_lead_staff: payload.groupLeadStaff,
    clear_group_lead: payload.clearGroupLead ?? false,
    is_active: payload.isActive ?? true,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function saveTeam(
  payload: {
    teamId?: string;
    teamName: string;
    groupId?: string | null;
    teamType?: string;
    campus: string;
    territory?: string | null;
    teamLeadStaff?: string | null;
    isActive?: boolean;
    expectedRevision?: string;
  },
  options: TeamManagementRequestOptions = {},
) {
  return call<TeamManagementMutationResponse>(METHODS.SAVE_TEAM, options, {
    team_id: payload.teamId,
    team_name: payload.teamName,
    group_id: payload.groupId,
    team_type: payload.teamType ?? "Sales",
    campus: payload.campus,
    territory: payload.territory,
    team_lead_staff: payload.teamLeadStaff,
    is_active: payload.isActive ?? true,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function addTeamMember(
  payload: {
    staffId: string;
    teamId: string;
    function?: string;
    isPrimary?: boolean;
    isTeamLead?: boolean;
  },
  options: TeamManagementRequestOptions = {},
) {
  return call<TeamManagementMutationResponse>(METHODS.ADD_MEMBER, options, {
    staff_id: payload.staffId,
    team_id: payload.teamId,
    function: payload.function ?? "Sale",
    is_primary: payload.isPrimary ?? false,
    is_team_lead: payload.isTeamLead ?? false,
    idempotency_key: idempotencyKey(),
  });
}

export async function moveTeamMember(
  payload: {
    staffId: string;
    sourceTeamId: string;
    targetTeamId: string;
    function?: string;
  },
  options: TeamManagementRequestOptions = {},
) {
  return call<TeamManagementMutationResponse>(METHODS.MOVE_MEMBER, options, {
    staff_id: payload.staffId,
    source_team_id: payload.sourceTeamId,
    target_team_id: payload.targetTeamId,
    function: payload.function ?? "Sale",
    idempotency_key: idempotencyKey(),
  });
}

export async function removeTeamMember(
  payload: { staffId: string; teamId: string; expectedRevision?: string },
  options: TeamManagementRequestOptions = {},
) {
  return call<TeamManagementMutationResponse>(METHODS.REMOVE_MEMBER, options, {
    staff_id: payload.staffId,
    team_id: payload.teamId,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function updateTeamMember(
  payload: { staffId: string; fullName: string; expectedRevision?: string },
  options: TeamManagementRequestOptions = {},
) {
  return call<TeamManagementMutationResponse>(METHODS.UPDATE_MEMBER, options, {
    staff_id: payload.staffId,
    full_name: payload.fullName,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}
