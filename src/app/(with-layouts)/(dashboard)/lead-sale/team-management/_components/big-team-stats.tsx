"use client";

import LeadPickerField from "./lead-picker-field";
import OverviewFact from "./overview-fact";
import type { BigTeam, TeamMember } from "./types";

interface BigTeamStatsProps {
  bigTeam: BigTeam;
  allMembers: TeamMember[];
  smallTeamCount: number;
  memberCount: number;
  onLeadChange: (leadId: string | null) => void;
}

export default function BigTeamStats({
  bigTeam,
  allMembers,
  smallTeamCount,
  memberCount,
  onLeadChange,
}: BigTeamStatsProps) {
  return (
    <section aria-label="Tổng quan đội" className="grid gap-3 sm:grid-cols-3">
      <OverviewFact kind="groups" label="Số nhóm" value={smallTeamCount} />
      <OverviewFact label="Tổng thành viên" value={memberCount} />
      <OverviewFact label="Trưởng đội" kind="lead">
        <LeadPickerField
          candidates={allMembers}
          value={bigTeam.leadId}
          onChange={onLeadChange}
          ariaLabel={`Trưởng đội ${bigTeam.name}`}
        />
      </OverviewFact>
    </section>
  );
}
