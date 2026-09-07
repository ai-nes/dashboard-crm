import type { CurrentUser } from "@/services/api/auth";
import type { TeamManagementWorkspace } from "@/services/api/lead-sale/team-management";

import type { TeamManagementPermissions } from "./types";

const GLOBAL_ROLES = new Set([
  "Administrator",
  "System Manager",
  "Admissions Director",
]);

function currentStaffIds(
  user: CurrentUser | null,
  workspace: TeamManagementWorkspace,
): Set<string> {
  if (!user) return new Set();
  const identifiers = new Set([user.user, user.email].filter(Boolean));
  return new Set(
    workspace.members
      .filter((member) => identifiers.has(member.email))
      .map((member) => member.id),
  );
}

function unique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

/**
 * Resolve organization scopes from the authenticated session and workspace.
 * Workspace IDs are only used to connect session.me's staff identity to the
 * existing group/team projection; the UI never grants access from a browser
 * supplied role string.
 */
export function getTeamManagementPermissions(
  user: CurrentUser | null,
  workspace: TeamManagementWorkspace,
): TeamManagementPermissions {
  const isGlobal = Boolean(
    user?.roles.some((role) => GLOBAL_ROLES.has(role)) ||
    user?.crm_profile === "admissions_director" ||
    user?.crm_profile === "ceo",
  );
  const staffIds = currentStaffIds(user, workspace);
  const sessionMemberships = user?.crm_team_memberships ?? [];

  const groupLeadGroupIds = new Set(
    workspace.groups
      .filter((group) => staffIds.has(group.groupLeadId ?? ""))
      .map((group) => group.id),
  );

  const teamLeadTeamIds = new Set(
    sessionMemberships
      .filter(
        (membership) =>
          membership.is_team_lead || membership.team_role === "team_lead",
      )
      .map((membership) => membership.team_id),
  );
  workspace.teams.forEach((team) => {
    if (staffIds.has(team.leadId ?? "")) teamLeadTeamIds.add(team.id);
  });

  const memberTeamIds = new Set(
    sessionMemberships.map((membership) => membership.team_id),
  );
  workspace.members
    .filter((member) => staffIds.has(member.id))
    .flatMap((member) => member.teamIds ?? [])
    .forEach((teamId) => memberTeamIds.add(teamId));

  const managedTeamIds = new Set(
    workspace.teams
      .filter((team) => groupLeadGroupIds.has(team.groupId ?? ""))
      .map((team) => team.id),
  );
  const visibleTeamIds = isGlobal
    ? new Set(workspace.teams.map((team) => team.id))
    : new Set([...memberTeamIds, ...managedTeamIds]);
  const visibleGroupIds = isGlobal
    ? new Set(workspace.groups.map((group) => group.id))
    : new Set(
        workspace.teams
          .filter((team) => visibleTeamIds.has(team.id) && team.groupId)
          .map((team) => team.groupId as string),
      );

  const memberManagementTeamIds = isGlobal
    ? new Set(workspace.teams.map((team) => team.id))
    : teamLeadTeamIds;
  const effectiveManagedTeamIds = isGlobal
    ? new Set(workspace.teams.map((team) => team.id))
    : managedTeamIds;
  const effectiveManagedGroupIds = isGlobal
    ? new Set(workspace.groups.map((group) => group.id))
    : groupLeadGroupIds;

  return {
    canManage: Boolean(
      isGlobal || effectiveManagedTeamIds.size || memberManagementTeamIds.size,
    ),
    canManageAll: isGlobal,
    canManageGroups: isGlobal,
    canManageTeams: Boolean(isGlobal || effectiveManagedTeamIds.size),
    canManageMembers: Boolean(isGlobal || memberManagementTeamIds.size),
    canManageTeamLeads: Boolean(isGlobal || effectiveManagedTeamIds.size),
    visibleGroupIds: unique(visibleGroupIds),
    visibleTeamIds: unique(visibleTeamIds),
    managedGroupIds: unique(effectiveManagedGroupIds),
    managedTeamIds: unique(effectiveManagedTeamIds),
    memberManagementTeamIds: unique(memberManagementTeamIds),
  };
}

export function canManageTeam(
  permissions: TeamManagementPermissions | undefined,
  teamId: string,
): boolean {
  return Boolean(
    permissions?.canManageAll || permissions?.managedTeamIds.includes(teamId),
  );
}

export function canManageMembers(
  permissions: TeamManagementPermissions | undefined,
  teamId: string,
): boolean {
  return Boolean(
    permissions?.canManageAll ||
    permissions?.memberManagementTeamIds.includes(teamId),
  );
}
