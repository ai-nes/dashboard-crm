"use client";

import OverviewFact from "./overview-fact";
import type { BigTeam } from "./types";

interface BigTeamStatsProps {
  bigTeam: BigTeam;
  smallTeamCount: number;
  memberCount: number;
}

export default function BigTeamStats({
  bigTeam,
  smallTeamCount,
  memberCount,
}: BigTeamStatsProps) {
  return (
    <section aria-label="Tổng quan đội" className="grid gap-3 sm:grid-cols-3">
      <OverviewFact kind="groups" label="Số nhóm" value={smallTeamCount} />
      <OverviewFact label="Tổng thành viên" value={memberCount} />
      <OverviewFact label="Tỉnh quản lý">
        <p className="truncate text-base font-semibold text-text-primary">
          {bigTeam.provinceName ?? "Chưa chọn tỉnh"}
        </p>
      </OverviewFact>
    </section>
  );
}
