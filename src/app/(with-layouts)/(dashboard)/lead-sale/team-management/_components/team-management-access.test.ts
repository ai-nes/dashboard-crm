import { describe, expect, it } from "vitest";

import type { CurrentUser } from "@/services/api/auth";
import type { TeamManagementWorkspace } from "@/services/api/lead-sale/team-management";

import {
  canManageMembers,
  canManageTeam,
  getTeamManagementPermissions,
} from "./team-management-access";
import { getTeamManagementEntryPath } from "./team-management-utils";
import type { TeamOrgState } from "./types";

const workspace: TeamManagementWorkspace = {
  schemaVersion: "team-management-v1",
  asOf: "2026-09-08T00:00:00",
  summary: {
    groupCount: 2,
    teamCount: 3,
    activeTeamCount: 3,
    staffCount: 5,
    activeStaffCount: 5,
  },
  groups: [
    {
      id: "group-1",
      name: "Group 1",
      provinceId: "province-1",
      provinceName: "Tỉnh 1",
      provinceCode: "P1",
      groupLeadId: "staff-group-lead",
      teamIds: ["team-1", "team-2"],
      teamCount: 2,
      memberCount: 3,
      isActive: true,
      revision: "group-1-rev",
    },
    {
      id: "group-2",
      name: "Group 2",
      provinceId: "province-2",
      provinceName: "Tỉnh 2",
      provinceCode: "P2",
      groupLeadId: "staff-other",
      teamIds: ["team-3"],
      teamCount: 1,
      memberCount: 1,
      isActive: true,
      revision: "group-2-rev",
    },
  ],
  teams: [
    {
      id: "team-1",
      name: "Team 1",
      groupId: "group-1",
      teamType: "Sales",
      campusId: "campus-1",
      territoryId: null,
      leadId: "staff-team-lead",
      memberIds: ["staff-team-lead", "staff-member"],
      memberCount: 2,
      zoneCount: 0,
      isActive: true,
      readiness: "ready",
      readinessReason: "ready",
      revision: "team-1-rev",
    },
    {
      id: "team-2",
      name: "Team 2",
      groupId: "group-1",
      teamType: "Sales",
      campusId: "campus-1",
      territoryId: null,
      leadId: "staff-other",
      memberIds: ["staff-other"],
      memberCount: 1,
      zoneCount: 0,
      isActive: true,
      readiness: "not_ready",
      readinessReason: "not_ready",
      revision: "team-2-rev",
    },
    {
      id: "team-3",
      name: "Team 3",
      groupId: "group-2",
      teamType: "Sales",
      campusId: "campus-2",
      territoryId: null,
      leadId: "staff-other",
      memberIds: ["staff-other"],
      memberCount: 1,
      zoneCount: 0,
      isActive: true,
      readiness: "not_ready",
      readinessReason: "not_ready",
      revision: "team-3-rev",
    },
  ],
  members: [
    {
      id: "staff-group-lead",
      name: "Group Lead",
      initials: "GL",
      email: "group-lead@example.com",
      role: "SALE",
      isActive: true,
      campusId: "campus-1",
      teamIds: [],
      memberships: [],
      revision: "staff-group-lead-rev",
    },
    {
      id: "staff-team-lead",
      name: "Team Lead",
      initials: "TL",
      email: "team-lead@example.com",
      role: "SALE",
      isActive: true,
      campusId: "campus-1",
      teamIds: ["team-1"],
      memberships: [
        {
          id: "membership-team-lead",
          teamId: "team-1",
          function: "Sale",
          role: "SALE",
          isPrimary: true,
          isTeamLead: true,
          term: null,
        },
      ],
      revision: "staff-team-lead-rev",
    },
    {
      id: "staff-member",
      name: "Member",
      initials: "ME",
      email: "member@example.com",
      role: "SALE",
      isActive: true,
      campusId: "campus-1",
      teamIds: ["team-1"],
      memberships: [
        {
          id: "membership-member",
          teamId: "team-1",
          function: "Sale",
          role: "SALE",
          isPrimary: true,
          isTeamLead: false,
          term: null,
        },
      ],
      revision: "staff-member-rev",
    },
    {
      id: "staff-other",
      name: "Other",
      initials: "OT",
      email: "other@example.com",
      role: "SALE",
      isActive: true,
      campusId: "campus-1",
      teamIds: ["team-2", "team-3"],
      memberships: [],
      revision: "staff-other-rev",
    },
  ],
  options: { campuses: [], provinces: [], functions: [] },
  permissions: { canManage: true, canManageAll: false },
};

function user(
  email: string,
  roles: string[],
  memberships: CurrentUser["crm_team_memberships"] = [],
): CurrentUser {
  return {
    user: email,
    email,
    full_name: email,
    user_image: null,
    roles,
    crm_profile: null,
    crm_role: null,
    crm_capabilities: [],
    crm_team_memberships: memberships,
    csrf_token: null,
  };
}

function stateWithPermissions(
  permissions: ReturnType<typeof getTeamManagementPermissions>,
): TeamOrgState {
  return {
    bigTeams: workspace.groups.map((group) => ({
      ...group,
      smallTeamIds: group.teamIds,
    })),
    smallTeams: workspace.teams.map((team) => ({
      ...team,
      bigTeamId: team.groupId ?? "",
    })),
    members: workspace.members,
    options: workspace.options,
    permissions,
  };
}

describe("team management organization permissions", () => {
  it("gives Lead Sale full organization access", () => {
    const permissions = getTeamManagementPermissions(
      user("lead-sale@example.com", ["Lead Sale"]),
      workspace,
    );

    expect(permissions.canManageAll).toBe(true);
    expect(permissions.visibleTeamIds).toEqual(["team-1", "team-2", "team-3"]);
    expect(canManageMembers(permissions, "team-3")).toBe(true);
    expect(getTeamManagementEntryPath(stateWithPermissions(permissions))).toBe(
      null,
    );
  });

  it("does not grant Team Management access to Director or CEO profiles", () => {
    for (const profile of ["admissions_director", "ceo"] as const) {
      const permissions = getTeamManagementPermissions(
        {
          ...user(`${profile}@example.com`, ["Administrator"]),
          crm_profile: profile,
        },
        workspace,
      );

      expect(permissions.canManage).toBe(false);
      expect(permissions.canManageAll).toBe(false);
      expect(permissions.visibleTeamIds).toEqual([]);
      expect(
        getTeamManagementEntryPath(stateWithPermissions(permissions)),
      ).toBe(null);
    }
  });

  it("lets a Group Lead manage Teams in the led Group only", () => {
    const permissions = getTeamManagementPermissions(
      user("group-lead@example.com", ["Sale"]),
      workspace,
    );

    expect(permissions.visibleTeamIds).toEqual(["team-1", "team-2"]);
    expect(permissions.managedGroupIds).toEqual(["group-1"]);
    expect(canManageTeam(permissions, "team-1")).toBe(true);
    expect(canManageTeam(permissions, "team-2")).toBe(true);
    expect(canManageTeam(permissions, "team-3")).toBe(false);
    expect(canManageMembers(permissions, "team-1")).toBe(false);
    expect(getTeamManagementEntryPath(stateWithPermissions(permissions))).toBe(
      "/lead-sale/team-management/group-1",
    );
  });

  it("lets a Team Lead manage members in led Teams only", () => {
    const permissions = getTeamManagementPermissions(
      user(
        "team-lead@example.com",
        ["Sale"],
        [
          {
            id: "membership-team-lead",
            team_id: "team-1",
            team_name: "Team 1",
            group_id: "group-1",
            group_name: "Group 1",
            province_id: "province-1",
            role: "Sale",
            function: "Sale",
            membership_role: "Trưởng nhóm",
            team_role: "team_lead",
            is_team_lead: true,
            is_primary: true,
            term: null,
          },
        ],
      ),
      workspace,
    );

    expect(permissions.visibleTeamIds).toEqual(["team-1"]);
    expect(canManageTeam(permissions, "team-1")).toBe(false);
    expect(canManageMembers(permissions, "team-1")).toBe(true);
    expect(canManageMembers(permissions, "team-2")).toBe(false);
    expect(getTeamManagementEntryPath(stateWithPermissions(permissions))).toBe(
      "/lead-sale/team-management/group-1/team-1",
    );
  });

  it("keeps a Team Member read-only and scoped to their Team", () => {
    const permissions = getTeamManagementPermissions(
      user(
        "member@example.com",
        ["Sale"],
        [
          {
            id: "membership-member",
            team_id: "team-1",
            team_name: "Team 1",
            group_id: "group-1",
            group_name: "Group 1",
            province_id: "province-1",
            role: "Sale",
            function: "Sale",
            membership_role: "Thành viên",
            team_role: "member",
            is_team_lead: false,
            is_primary: true,
            term: null,
          },
        ],
      ),
      workspace,
    );

    expect(permissions.visibleTeamIds).toEqual(["team-1"]);
    expect(permissions.canManage).toBe(false);
    expect(canManageTeam(permissions, "team-1")).toBe(false);
    expect(canManageMembers(permissions, "team-1")).toBe(false);
    expect(getTeamManagementEntryPath(stateWithPermissions(permissions))).toBe(
      "/lead-sale/team-management/group-1/team-1",
    );
  });

  it("keeps CTV Sale read-only even when the workspace contains lead metadata", () => {
    const permissions = getTeamManagementPermissions(
      user("group-lead@example.com", ["CTV Sale"]),
      workspace,
    );

    expect(permissions.visibleTeamIds).toEqual([]);
    expect(permissions.managedGroupIds).toEqual([]);
    expect(permissions.canManage).toBe(false);
    expect(canManageTeam(permissions, "team-1")).toBe(false);
    expect(canManageMembers(permissions, "team-1")).toBe(false);
  });
});
