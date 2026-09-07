"use client";

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
import type { TeamManagementWorkspace } from "@/services/api/lead-sale/team-management";

import type { BigTeam, SmallTeam, TeamMember, TeamOrgState } from "./types";

function normalizeWorkspace(workspace: TeamManagementWorkspace): TeamOrgState {
  const groups: BigTeam[] = workspace.groups.map((group) => ({
    id: group.id,
    name: group.name,
    provinceId: group.provinceId,
    provinceName: group.provinceName,
    provinceCode: group.provinceCode,
    groupLeadId: group.groupLeadId,
    smallTeamIds: group.teamIds,
    teamCount: group.teamCount,
    memberCount: group.memberCount,
    isActive: group.isActive,
    revision: group.revision,
  }));
  const teams: SmallTeam[] = workspace.teams.map((team) => ({
    id: team.id,
    bigTeamId: team.groupId ?? "",
    name: team.name,
    leadId: team.leadId,
    memberIds: team.memberIds,
    campusId: team.campusId,
    teamType: team.teamType,
    isActive: team.isActive,
    readiness: team.readiness,
    readinessReason: team.readinessReason,
    zoneCount: team.zoneCount,
    revision: team.revision,
  }));
  const members: TeamMember[] = workspace.members.map((member) => ({
    id: member.id,
    name: member.name,
    initials: member.initials,
    email: member.email,
    role: member.role,
    isActive: member.isActive,
    campusId: member.campusId,
    teamIds: member.teamIds,
    memberships: member.memberships,
    revision: member.revision,
  }));
  return {
    bigTeams: groups,
    smallTeams: teams,
    members,
    options: workspace.options,
    permissions: workspace.permissions,
  };
}

export function useTeamManagement() {
  const [state, setState] = useState<TeamOrgState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const workspace = await getTeamManagementWorkspace();
      setState(normalizeWorkspace(workspace));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Không thể tải dữ liệu đội ngũ.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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
