"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { useCallback, useEffect, useState } from "react";

import {
  addTeamMember,
  getTeamManagementWorkspace,
  moveTeamMember,
  removeTeamMember,
  saveTeam,
  saveTeamGroup,
  updateTeamMember,
} from "@/services/api/lead-sale/team-management";
import type { CurrentUser } from "@/services/api/auth";
import type { TeamManagementWorkspace } from "@/services/api/lead-sale/team-management";

import { getTeamManagementPermissions } from "./team-management-access";
import type { BigTeam, SmallTeam, TeamMember, TeamOrgState } from "./types";

function normalizeWorkspace(
  workspace: TeamManagementWorkspace,
  user: CurrentUser | null,
): TeamOrgState {
  const permissions = getTeamManagementPermissions(user, workspace);
  const visibleGroupIds = new Set(permissions.visibleGroupIds);
  const visibleTeamIds = new Set(permissions.visibleTeamIds);
  const visibleWorkspaceTeams = workspace.teams.filter((team) =>
    visibleTeamIds.has(team.id),
  );
  const visibleMemberIds = new Set(
    workspace.members
      .filter(
        (member) =>
          permissions.canManageAll ||
          (member.isActive !== false && (member.teamIds ?? []).length === 0) ||
          (member.teamIds ?? []).some((teamId) => visibleTeamIds.has(teamId)),
      )
      .map((member) => member.id),
  );

  const teams: SmallTeam[] = visibleWorkspaceTeams.map((team) => ({
    id: team.id,
    bigTeamId: team.groupId ?? "",
    name: team.name,
    leadId: team.leadId,
    memberIds: team.memberIds.filter((memberId) =>
      visibleMemberIds.has(memberId),
    ),
    campusId: team.campusId,
    teamType: team.teamType,
    isActive: team.isActive,
    readiness: team.readiness,
    readinessReason: team.readinessReason,
    zoneCount: team.zoneCount,
    revision: team.revision,
  }));

  const members: TeamMember[] = workspace.members
    .filter((member) => visibleMemberIds.has(member.id))
    .map((member) => ({
      id: member.id,
      name: member.name,
      initials: member.initials,
      email: member.email,
      role: member.role,
      isActive: member.isActive,
      campusId: member.campusId,
      teamIds: (member.teamIds ?? []).filter((teamId) =>
        visibleTeamIds.has(teamId),
      ),
      memberships: member.memberships.filter((membership) =>
        visibleTeamIds.has(membership.teamId),
      ),
      revision: member.revision,
    }));
  const memberIdsByTeam = new Map(
    teams.map((team) => [team.id, new Set(team.memberIds)]),
  );

  const groups: BigTeam[] = workspace.groups
    .filter((group) => visibleGroupIds.has(group.id))
    .map((group) => {
      const smallTeamIds = group.teamIds.filter((teamId) =>
        visibleTeamIds.has(teamId),
      );
      const memberIds = new Set(
        smallTeamIds.flatMap((teamId) => [
          ...(memberIdsByTeam.get(teamId) ?? new Set<string>()),
        ]),
      );
      return {
        id: group.id,
        name: group.name,
        provinceId: group.provinceId,
        provinceName: group.provinceName,
        provinceCode: group.provinceCode,
        groupLeadId: group.groupLeadId,
        smallTeamIds,
        teamCount: smallTeamIds.length,
        memberCount: memberIds.size,
        isActive: group.isActive,
        revision: group.revision,
      };
    });
  return {
    bigTeams: groups,
    smallTeams: teams,
    members,
    options: workspace.options,
    permissions,
  };
}

export function useTeamManagement() {
  const { user } = useAuth();
  const [state, setState] = useState<TeamOrgState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const workspace = await getTeamManagementWorkspace();
      setState(normalizeWorkspace(workspace, user));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Không thể tải dữ liệu đội ngũ.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const handle = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(handle);
  }, [refresh]);

  const runMutation = useCallback(
    async (mutation: () => Promise<unknown>) => {
      await mutation();
      await refresh();
    },
    [refresh],
  );

  return {
    state,
    isLoading,
    error,
    refresh,
    saveGroup: (payload: Parameters<typeof saveTeamGroup>[0]) =>
      runMutation(() => saveTeamGroup(payload)),
    saveTeam: (payload: Parameters<typeof saveTeam>[0]) =>
      runMutation(() => saveTeam(payload)),
    addMember: (payload: Parameters<typeof addTeamMember>[0]) =>
      runMutation(() => addTeamMember(payload)),
    moveMember: (payload: Parameters<typeof moveTeamMember>[0]) =>
      runMutation(() => moveTeamMember(payload)),
    removeMember: (payload: Parameters<typeof removeTeamMember>[0]) =>
      runMutation(() => removeTeamMember(payload)),
    updateMember: (payload: Parameters<typeof updateTeamMember>[0]) =>
      runMutation(() => updateTeamMember(payload)),
  };
}
