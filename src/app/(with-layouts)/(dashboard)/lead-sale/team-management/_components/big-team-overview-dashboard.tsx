"use client";

import { Plus } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";

import OverviewFact from "./overview-fact";
import BigTeamCard from "./big-team-card";
import CreateTeamDialog from "./create-team-dialog";
import { membersOfBigTeam, smallTeamsOfBigTeam } from "./team-management-utils";
import { useTeamManagement } from "./use-team-management";

export default function BigTeamOverviewDashboard() {
  const { state, isLoading, error, saveGroup } = useTeamManagement();
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading && !state) return <LoadingState />;
  if (error && !state) return <ErrorState message={error} />;
  if (!state) return null;

  const canManage = state.permissions?.canManage ?? false;
  const run = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      toast.success(success);
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu thay đổi.",
      );
    }
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
            isDisabled={!canManage}
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
              allMembers={state.members.filter(
                (member) => member.isActive !== false,
              )}
              canManageLead={state.permissions?.canManageAll ?? false}
              smallTeamCount={smallTeamsOfBigTeam(state, bigTeam).length}
              memberCount={membersOfBigTeam(state, bigTeam).length}
              onEdit={(name) =>
                void run(
                  () =>
                    saveGroup({
                      groupId: bigTeam.id,
                      groupName: name,
                      expectedRevision: bigTeam.revision,
                    }),
                  "Đã cập nhật tên đội.",
                )
              }
              onDelete={() =>
                void run(
                  () =>
                    saveGroup({
                      groupId: bigTeam.id,
                      groupName: bigTeam.name,
                      isActive: false,
                      expectedRevision: bigTeam.revision,
                    }),
                  `Đã ngừng hoạt động đội "${bigTeam.name}".`,
                )
              }
              onLeadChange={(leadId) =>
                void run(
                  () =>
                    saveGroup({
                      groupId: bigTeam.id,
                      groupName: bigTeam.name,
                      groupLeadStaff: leadId,
                      clearGroupLead: leadId === null,
                      expectedRevision: bigTeam.revision,
                    }),
                  leadId ? "Đã cập nhật trưởng đội." : "Đã bỏ trưởng đội.",
                )
              }
            />
          ))}
        </div>
      )}

      {isCreating && (
        <CreateTeamDialog
          title="Tạo đội"
          description="Đội quản lý một khu vực hoặc mảng nghiệp vụ, bên trong có thể chứa nhiều nhóm."
          fieldLabel="Tên đội"
          placeholder="Ví dụ: Đội Tư vấn TP.HCM"
          submitLabel="Tạo đội"
          onClose={() => setIsCreating(false)}
          onSubmit={(name) =>
            void run(
              () => saveGroup({ groupName: name }),
              `Đã tạo đội "${name}".`,
            ).finally(() => setIsCreating(false))
          }
        />
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <main id="main-content" className="min-w-0 p-6">
      <div className="rounded-2xl border border-card-border bg-card-background p-10 text-center text-sm text-text-secondary">
        Đang tải dữ liệu đội ngũ...
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main id="main-content" className="min-w-0 p-6">
      <div className="rounded-2xl border border-badge-error-background bg-badge-error-background p-5 text-sm text-badge-error-text">
        {message}
      </div>
    </main>
  );
}
