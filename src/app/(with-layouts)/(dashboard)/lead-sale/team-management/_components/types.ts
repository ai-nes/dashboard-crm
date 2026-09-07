export type TeamMemberRole = "SALE" | "CTV_SALE";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: TeamMemberRole;
}

export interface SmallTeam {
  id: string;
  bigTeamId: string;
  name: string;
  leadId: string | null;
  memberIds: string[];
}

export interface BigTeam {
  id: string;
  name: string;
  leadId: string | null;
  smallTeamIds: string[];
}

export interface TeamOrgState {
  bigTeams: BigTeam[];
  smallTeams: SmallTeam[];
  members: TeamMember[];
}
