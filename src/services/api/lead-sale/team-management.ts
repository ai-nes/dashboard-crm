import {
  NestApiError,
  nestRequest,
  type NestValidationIssue,
} from "../nest/nest-client";

export interface TeamManagementGroup {
  id: string;
  name: string;
  provinceId: string | null;
  provinceName: string | null;
  provinceCode: string | null;
  groupLeadId: string | null;
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
    userCount: number;
    activeUserCount: number;
  };
  groups: TeamManagementGroup[];
  teams: TeamManagementTeam[];
  members: TeamManagementMember[];
  availableMembers: TeamManagementMember[];
  options: {
    campuses: Array<{ id: string; label: string }>;
    provinces: Array<{ id: string; label: string; code?: string | null }>;
    functions: Array<{ value: string; label: string }>;
  };
  permissions: { canManage: boolean; canManageAll: boolean };
}

export interface TeamManagementMutationResponse {
  action: string;
  status: string;
  correlation_id?: string;
  replayed?: boolean;
  groupId?: string;
  teamId?: string;
  teamLeadUserId?: string | null;
  userId?: string;
  revision?: string;
}

export class TeamManagementApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    readonly details: NestValidationIssue[] = [],
    readonly requestId?: string,
  ) {
    super(
      details.length
        ? `Dữ liệu đội nhóm không hợp lệ. ${details
            .map((issue) => {
              const reason =
                issue.code === "invalid_type"
                  ? "Thiếu hoặc không đúng kiểu dữ liệu."
                  : issue.code === "invalid_value"
                    ? "Giá trị không được hỗ trợ."
                    : issue.message;
              return `${issue.field}: ${reason}`;
            })
            .join(" ")}`
        : message,
    );
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

const NEST_PATHS: Record<string, string> = {
  [METHODS.WORKSPACE]: "/api/v1/team-management/workspace",
  [METHODS.SAVE_GROUP]: "/api/v1/team-management/groups",
  [METHODS.SAVE_TEAM]: "/api/v1/team-management/teams",
  [METHODS.ADD_MEMBER]: "/api/v1/team-management/members",
  [METHODS.MOVE_MEMBER]: "/api/v1/team-management/members/move",
  [METHODS.REMOVE_MEMBER]: "/api/v1/team-management/members/remove",
  [METHODS.UPDATE_MEMBER]: "/api/v1/team-management/members/update",
};

async function call<T>(
  method: string,
  body?: Record<string, unknown>,
): Promise<T> {
  try {
    return await nestRequest<T>(NEST_PATHS[method], {
      method: body ? "POST" : "GET",
      ...(body ? { body } : {}),
    });
  } catch (error) {
    if (error instanceof NestApiError) {
      // Only diagnostic metadata, never request bodies, cookies or user data.
      console.error("[team-management] API request failed", {
        method: body ? "POST" : "GET",
        path: NEST_PATHS[method],
        status: error.status,
        code: error.code,
        requestId: error.requestId,
        details: error.details,
      });
      throw new TeamManagementApiError(
        error.status,
        error.code,
        error.message,
        error.details,
        error.requestId,
      );
    }
    throw error;
  }
}

function idempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `team-management-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function getTeamManagementWorkspace(): Promise<TeamManagementWorkspace> {
  const workspace = await call<unknown>(METHODS.WORKSPACE);
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

export async function saveTeamGroup(payload: {
  groupId?: string;
  groupName: string;
  provinceId?: string | null;
  groupLeadUser?: string | null;
  clearGroupLead?: boolean;
  isActive?: boolean;
  expectedRevision?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.SAVE_GROUP, {
    group_id: payload.groupId,
    group_name: payload.groupName,
    province: payload.provinceId,
    group_lead_user: payload.groupLeadUser,
    clear_group_lead: payload.clearGroupLead ?? false,
    is_active: payload.isActive ?? true,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function saveTeam(payload: {
  teamId?: string;
  teamName: string;
  groupId?: string | null;
  teamType?: string;
  campus: string;
  territory?: string | null;
  teamLeadUser?: string | null;
  isActive?: boolean;
  expectedRevision?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.SAVE_TEAM, {
    team_id: payload.teamId,
    team_name: payload.teamName,
    group_id: payload.groupId,
    team_type: payload.teamType ?? "Sales",
    campus: payload.campus,
    territory: payload.territory,
    team_lead_user: payload.teamLeadUser,
    is_active: payload.isActive ?? true,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function addTeamMember(payload: {
  userId: string;
  teamId: string;
  function?: string;
  isPrimary?: boolean;
  isTeamLead?: boolean;
}) {
  return call<TeamManagementMutationResponse>(METHODS.ADD_MEMBER, {
    user_id: payload.userId,
    team_id: payload.teamId,
    function: payload.function,
    is_primary: payload.isPrimary ?? false,
    is_team_lead: payload.isTeamLead ?? false,
    idempotency_key: idempotencyKey(),
  });
}

export async function moveTeamMember(payload: {
  userId: string;
  sourceTeamId: string;
  targetTeamId: string;
  function?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.MOVE_MEMBER, {
    user_id: payload.userId,
    source_team_id: payload.sourceTeamId,
    target_team_id: payload.targetTeamId,
    function: payload.function,
    idempotency_key: idempotencyKey(),
  });
}

export async function removeTeamMember(payload: {
  userId: string;
  teamId: string;
  expectedRevision?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.REMOVE_MEMBER, {
    user_id: payload.userId,
    team_id: payload.teamId,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function updateTeamMember(payload: {
  userId: string;
  fullName: string;
  expectedRevision?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.UPDATE_MEMBER, {
    user_id: payload.userId,
    full_name: payload.fullName,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}
