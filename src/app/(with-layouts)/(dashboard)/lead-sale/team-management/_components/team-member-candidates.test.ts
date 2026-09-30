import { describe, expect, it } from "vitest";
import { candidatesForTeam } from "./team-management-utils";
import type { SmallTeam, TeamMember } from "./types";

const team: SmallTeam = {
  id: "team",
  bigTeamId: "group",
  name: "Team",
  leadId: null,
  campusId: "campus",
  memberIds: [],
};
const member: TeamMember = {
  id: "sale",
  name: "Sale",
  initials: "S",
  email: "sale@example.com",
  role: "SALE",
  campusId: "campus",
  isActive: true,
  isAvailableForTeam: true,
  teamIds: [],
};

describe("team member candidates", () => {
  it("includes eligible Sale and CTV from the API", () => {
    const ctv = { ...member, id: "ctv", role: "CTV_SALE" as const };
    expect(candidatesForTeam([member, ctv], team)).toEqual([member, ctv]);
  });

  it("excludes membership outside visible teams even when local teamIds is empty", () => {
    expect(
      candidatesForTeam([{ ...member, isAvailableForTeam: false }], team),
    ).toEqual([]);
    expect(
      candidatesForTeam([{ ...member, isAvailableForTeam: undefined }], team),
    ).toEqual([]);
  });

  it("excludes disabled, other-campus, manager, and already-added staff", () => {
    expect(
      candidatesForTeam(
        [
          { ...member, isActive: false },
          { ...member, campusId: "other" },
          { ...member, role: "LEAD_SALE" },
        ],
        team,
      ),
    ).toEqual([]);
    expect(
      candidatesForTeam([member], { ...team, memberIds: [member.id] }),
    ).toEqual([]);
  });
});
