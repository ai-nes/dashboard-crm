import { NestApiError, nestRequest } from "../nest/nest-client";

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
    staffCount: number;
    activeStaffCount: number;
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
  teamLeadStaffId?: string | null;
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
      throw new TeamManagementApiError(error.status, error.code, error.message);
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
  groupLeadStaff?: string | null;
  clearGroupLead?: boolean;
  isActive?: boolean;
  expectedRevision?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.SAVE_GROUP, {
    group_id: payload.groupId,
    group_name: payload.groupName,
    province: payload.provinceId,
    group_lead_staff: payload.groupLeadStaff,
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
  teamLeadStaff?: string | null;
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
    team_lead_staff: payload.teamLeadStaff,
    is_active: payload.isActive ?? true,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function addTeamMember(payload: {
  staffId: string;
  teamId: string;
  function?: string;
  isPrimary?: boolean;
  isTeamLead?: boolean;
}) {
  return call<TeamManagementMutationResponse>(METHODS.ADD_MEMBER, {
    staff_id: payload.staffId,
    team_id: payload.teamId,
    function: payload.function ?? "Sale",
    is_primary: payload.isPrimary ?? false,
    is_team_lead: payload.isTeamLead ?? false,
    idempotency_key: idempotencyKey(),
  });
}

export async function moveTeamMember(payload: {
  staffId: string;
  sourceTeamId: string;
  targetTeamId: string;
  function?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.MOVE_MEMBER, {
    staff_id: payload.staffId,
    source_team_id: payload.sourceTeamId,
    target_team_id: payload.targetTeamId,
    function: payload.function ?? "Sale",
    idempotency_key: idempotencyKey(),
  });
}

export async function removeTeamMember(payload: {
  staffId: string;
  teamId: string;
  expectedRevision?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.REMOVE_MEMBER, {
    staff_id: payload.staffId,
    team_id: payload.teamId,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}

export async function updateTeamMember(payload: {
  staffId: string;
  fullName: string;
  expectedRevision?: string;
}) {
  return call<TeamManagementMutationResponse>(METHODS.UPDATE_MEMBER, {
    staff_id: payload.staffId,
    full_name: payload.fullName,
    expected_revision: payload.expectedRevision,
    idempotency_key: idempotencyKey(),
  });
}
