import { describe, expect, it } from "vitest";

import { teamLeaderCandidates } from "./team-management-utils";
import type { SmallTeam, TeamOrgState } from "./types";

const team: SmallTeam = {
  id: "team-1",
  bigTeamId: "group-1",
  name: "Team 1",
  leadId: null,
  memberIds: [],
  campusId: "campus-1",
};

describe("team leader candidates", () => {
  it("offers eligible unassigned users from the same campus to a leaderless team", () => {
    const state: TeamOrgState = {
      bigTeams: [],
      smallTeams: [team],
      members: [
        {
          id: "sale-1",
          name: "Sale 1",
          initials: "S1",
          email: "sale@example.test",
          role: "SALE",
          campusId: "campus-1",
          isAvailableForTeam: true,
          teamIds: [],
        },
        {
          id: "sale-other-campus",
          name: "Sale Other Campus",
          initials: "SO",
          email: "other@example.test",
          role: "SALE",
          campusId: "campus-2",
          isAvailableForTeam: true,
          teamIds: [],
        },
        {
          id: "already-assigned",
          name: "Assigned",
          initials: "A",
          email: "assigned@example.test",
          role: "SALE",
          campusId: "campus-1",
          isAvailableForTeam: false,
          teamIds: ["team-2"],
        },
      ],
    };

    expect(
      teamLeaderCandidates(state, team).map((member) => member.id),
    ).toEqual(["sale-1"]);
  });
});
