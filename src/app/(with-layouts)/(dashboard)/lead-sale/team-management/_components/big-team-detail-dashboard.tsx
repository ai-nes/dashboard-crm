"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/tailgrids/core/card";

import BigTeamStats from "./big-team-stats";
import BigTeamDetailHeader from "./big-team-detail-header";
import CreateTeamDialog from "./create-team-dialog";
import { initialBigTeams, initialMembers, initialSmallTeams } from "./data";
import SmallTeamCard from "./small-team-card";
import {
  membersOfBigTeam,
  membersOfSmallTeam,
  smallTeamsOfBigTeam,
} from "./team-management-utils";
import type { SmallTeam, TeamOrgState } from "./types";

export default function BigTeamDetailDashboard({
  bigTeamId,
}: {
  bigTeamId: string;
}) {
  const [state, setState] = useState<TeamOrgState>({
    bigTeams: initialBigTeams,
    smallTeams: initialSmallTeams,
    members: initialMembers,
  });
  const [isCreating, setIsCreating] = useState(false);

  const bigTeam = state.bigTeams.find((team) => team.id === bigTeamId) ?? null;

  if (!bigTeam) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-0 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">Không tìm thấy đội này.</p>
          <p className="mt-1 text-sm">
            Team có thể đã bị xóa hoặc mã team không đúng.
          </p>
        </Card>
      </main>
    );
  }

  const smallTeams = smallTeamsOfBigTeam(state, bigTeam);

  const handleBigTeamLeadChange = (leadId: string | null) => {
    setState((current) => ({
      ...current,
      bigTeams: current.bigTeams.map((team) =>
        team.id === bigTeamId ? { ...team, leadId } : team,
      ),
    }));
    toast.success(leadId ? "Đã cập nhật trưởng đội." : "Đã bỏ trưởng đội.");
  };

  const handleSmallTeamLeadChange = (
    smallTeamId: string,
    leadId: string | null,
  ) => {
    setState((current) => ({
      ...current,
      smallTeams: current.smallTeams.map((team) =>
        team.id === smallTeamId ? { ...team, leadId } : team,
      ),
    }));
    toast.success(leadId ? "Đã cập nhật trưởng nhóm." : "Đã bỏ trưởng nhóm.");
  };

  const handleCreate = (name: string) => {
    const newTeam: SmallTeam = {
      id: `st-${Date.now()}`,
      bigTeamId,
      name,
      leadId: null,
      memberIds: [],
    };
    setState((current) => ({
      ...current,
      smallTeams: [newTeam, ...current.smallTeams],
      bigTeams: current.bigTeams.map((team) =>
        team.id === bigTeamId
          ? { ...team, smallTeamIds: [newTeam.id, ...team.smallTeamIds] }
          : team,
      ),
    }));
    setIsCreating(false);
    toast.success(`Đã tạo nhóm "${name}".`);
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <BigTeamDetailHeader
        bigTeam={bigTeam}
        onCreate={() => setIsCreating(true)}
      />
      <BigTeamStats
        bigTeam={bigTeam}
        allMembers={state.members}
        smallTeamCount={smallTeams.length}
        memberCount={membersOfBigTeam(state, bigTeam).length}
        onLeadChange={handleBigTeamLeadChange}
      />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-primary">
          Nhóm trong {bigTeam.name}
        </h2>
      </div>

      {smallTeams.length === 0 ? (
        <div className="rounded-2xl border border-card-border bg-card-background p-10 text-center text-sm text-text-tertiary">
          Chưa có nhóm nào trong đội này.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {smallTeams.map((smallTeam) => (
            <SmallTeamCard
              key={smallTeam.id}
              bigTeamId={bigTeamId}
              smallTeam={smallTeam}
              members={membersOfSmallTeam(state, smallTeam)}
              onEdit={(name) => {
                setState((current) => ({
                  ...current,
                  smallTeams: current.smallTeams.map((team) =>
                    team.id === smallTeam.id ? { ...team, name } : team,
                  ),
                }));
                toast.success("Đã cập nhật tên nhóm.");
              }}
              onDelete={() => {
                setState((current) => ({
                  ...current,
                  smallTeams: current.smallTeams.filter(
                    (team) => team.id !== smallTeam.id,
                  ),
                  bigTeams: current.bigTeams.map((team) =>
                    team.id === bigTeamId
                      ? {
                          ...team,
                          smallTeamIds: team.smallTeamIds.filter(
                            (id) => id !== smallTeam.id,
                          ),
                        }
                      : team,
                  ),
                }));
                toast.success(`Đã xóa nhóm "${smallTeam.name}".`);
              }}
              onLeadChange={(leadId) =>
                handleSmallTeamLeadChange(smallTeam.id, leadId)
              }
            />
          ))}
        </div>
      )}

      {isCreating && (
        <CreateTeamDialog
          title="Tạo nhóm"
          description={`Nhóm thuộc ${bigTeam.name}, gồm trưởng nhóm và các thành viên Sale/CTV Sale.`}
          fieldLabel="Tên nhóm"
          placeholder="Ví dụ: Team Hà Nội 1"
          submitLabel="Tạo nhóm"
          onClose={() => setIsCreating(false)}
          onSubmit={handleCreate}
        />
      )}
    </main>
  );
}
