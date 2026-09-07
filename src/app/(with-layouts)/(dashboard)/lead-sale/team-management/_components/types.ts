export type TeamMemberRole = "SALE" | "CTV_SALE" | "LEAD_SALE";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: TeamMemberRole;
  isActive?: boolean;
  campusId?: string | null;
  teamIds?: string[];
  memberships?: TeamMembership[];
  revision?: string;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  function: string;
  role: TeamMemberRole;
  isPrimary: boolean;
  isTeamLead: boolean;
  term?: string | null;
}

export interface SmallTeam {
  id: string;
  bigTeamId: string;
  name: string;
  leadId: string | null;
  memberIds: string[];
  campusId?: string | null;
  teamType?: string;
  isActive?: boolean;
  readiness?: "ready" | "not_ready" | "inactive";
  readinessReason?: string;
  zoneCount?: number;
  revision?: string;
}

export interface BigTeam {
  id: string;
  name: string;
  leadId: string | null;
  smallTeamIds: string[];
  teamCount?: number;
  memberCount?: number;
  isActive?: boolean;
  revision?: string;
}

export interface TeamOrgState {
  bigTeams: BigTeam[];
  smallTeams: SmallTeam[];
  members: TeamMember[];
  options?: {
    campuses: { id: string; label: string }[];
    functions: { value: string; label: string }[];
  };
  permissions?: {
    canManage: boolean;
    canManageAll: boolean;
  };
}
