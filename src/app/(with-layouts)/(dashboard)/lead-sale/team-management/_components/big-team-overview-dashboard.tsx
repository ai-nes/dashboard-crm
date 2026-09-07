"use client";

import { Plus } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";

import OverviewFact from "./overview-fact";
import BigTeamCard from "./big-team-card";
import CreateTeamDialog from "./create-team-dialog";
import { initialBigTeams, initialMembers, initialSmallTeams } from "./data";
import { membersOfBigTeam, smallTeamsOfBigTeam } from "./team-management-utils";
import type { BigTeam, TeamOrgState } from "./types";

export default function BigTeamOverviewDashboard() {
  const [state, setState] = useState<TeamOrgState>({
    bigTeams: initialBigTeams,
    smallTeams: initialSmallTeams,
    members: initialMembers,
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleLeadChange = (bigTeamId: string, leadId: string | null) => {
    setState((current) => ({
      ...current,
      bigTeams: current.bigTeams.map((team) =>
        team.id === bigTeamId ? { ...team, leadId } : team,
      ),
    }));
    toast.success(leadId ? "Đã cập nhật trưởng đội." : "Đã bỏ trưởng đội.");
  };

  const handleCreate = (name: string) => {
    const newTeam: BigTeam = {
      id: `bt-${Date.now()}`,
      name,
      leadId: null,
      smallTeamIds: [],
    };
    setState((current) => ({
      ...current,
      bigTeams: [newTeam, ...current.bigTeams],
    }));
    setIsCreating(false);
    toast.success(`Đã tạo đội "${name}".`);
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <header className="rounded-2xl border border-card-border bg-card-background p-5 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-600">
              Đội ngũ kinh doanh
            </p>
            <h1 className="mt-2 text-balance text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary lg:text-[28px]">
              Quản lý đội ngũ
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Theo dõi các đội kinh doanh, phân công người phụ trách và quản lý
              các nhóm trực thuộc.
            </p>
          </div>
          <Button
            className="shrink-0"
            onPress={() => setIsCreating(true)}
          >
            <Plus size={16} aria-hidden="true" />
            Tạo đội
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <OverviewFact kind="teams" label="Đội" value={state.bigTeams.length} />
        <OverviewFact
          kind="groups"
          label="Nhóm"
          value={state.smallTeams.length}
        />
        <OverviewFact label="Thành viên" value={state.members.length} />
      </div>

      {state.bigTeams.length === 0 ? (
        <div className="rounded-2xl border border-card-border bg-card-background p-10 text-center text-sm text-text-tertiary">
          Chưa có đội nào. Bấm &quot;Tạo đội&quot; để bắt đầu.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.bigTeams.map((bigTeam) => (
            <BigTeamCard
              key={bigTeam.id}
              bigTeam={bigTeam}
              allMembers={state.members}
              smallTeamCount={smallTeamsOfBigTeam(state, bigTeam).length}
              memberCount={membersOfBigTeam(state, bigTeam).length}
              onEdit={(name) => {
                setState((current) => ({
                  ...current,
                  bigTeams: current.bigTeams.map((team) =>
                    team.id === bigTeam.id ? { ...team, name } : team,
                  ),
                }));
                toast.success("Đã cập nhật tên đội.");
              }}
              onDelete={() => {
                setState((current) => ({
                  ...current,
                  bigTeams: current.bigTeams.filter(
                    (team) => team.id !== bigTeam.id,
                  ),
                  smallTeams: current.smallTeams.filter(
                    (team) => team.bigTeamId !== bigTeam.id,
                  ),
                }));
                toast.success(`Đã xóa đội "${bigTeam.name}".`);
              }}
              onLeadChange={(leadId) => handleLeadChange(bigTeam.id, leadId)}
            />
          ))}
        </div>
      )}

      {isCreating && (
        <CreateTeamDialog
          title="Tạo đội"
          description="Đội quản lý một khu vực hoặc mảng nghiệp vụ, bên trong có thể chứa nhiều nhóm."
          fieldLabel="Tên đội"
          placeholder="Ví dụ: Team Sale Miền Bắc"
          submitLabel="Tạo đội"
          onClose={() => setIsCreating(false)}
          onSubmit={handleCreate}
        />
      )}
    </main>
  );
}
