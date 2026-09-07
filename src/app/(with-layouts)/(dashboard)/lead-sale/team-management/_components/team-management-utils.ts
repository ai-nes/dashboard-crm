import type { BigTeam, SmallTeam, TeamMember, TeamOrgState } from "./types";

export function decodeTeamRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function findMember(
  members: TeamMember[],
  id: string | null,
): TeamMember | null {
  if (!id) return null;
  return members.find((item) => item.id === id) ?? null;
}

export function smallTeamsOfBigTeam(
  state: TeamOrgState,
  bigTeam: BigTeam,
): SmallTeam[] {
  return state.smallTeams.filter((team) =>
    bigTeam.smallTeamIds.includes(team.id),
  );
}

export function membersOfSmallTeam(
  state: TeamOrgState,
  smallTeam: SmallTeam,
): TeamMember[] {
  return smallTeam.memberIds
    .map((id) => findMember(state.members, id))
    .filter((item): item is TeamMember => item !== null);
}

export function membersOfBigTeam(
  state: TeamOrgState,
  bigTeam: BigTeam,
): TeamMember[] {
  const smallTeams = smallTeamsOfBigTeam(state, bigTeam);
  const ids = new Set(smallTeams.flatMap((team) => team.memberIds));
  return state.members.filter((member) => ids.has(member.id));
}

export function unassignedMembers(state: TeamOrgState): TeamMember[] {
  const assignedIds = new Set(
    state.smallTeams.flatMap((team) => team.memberIds),
  );
  return state.members.filter((member) => !assignedIds.has(member.id));
}
