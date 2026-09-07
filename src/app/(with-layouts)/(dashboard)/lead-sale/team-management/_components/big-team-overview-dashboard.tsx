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
  const {
    state,
    isLoading,
    error,
    saveGroup,
  } = useTeamManagement();
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
              GROUP & TEAM
            </p>
            <h1 className="mt-2 text-balance text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary lg:text-[28px]">
              Quản lý Group & Team
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Group đại diện cho một tỉnh. Mỗi Group có nhiều Team; Team chứa
              các Sale và CTV Sale để nhận Lead trong tỉnh đó.
            </p>
          </div>
          <Button
            className="shrink-0"
            onPress={() => setIsCreating(true)}
            isDisabled={!canManage}
          >
            <Plus size={16} aria-hidden="true" />
            Tạo Group
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <OverviewFact kind="teams" label="Group tỉnh" value={state.bigTeams.length} />
        <OverviewFact
          kind="groups"
          label="Team"
          value={state.smallTeams.length}
        />
        <OverviewFact label="Thành viên" value={state.members.length} />
      </div>

      {state.bigTeams.length === 0 ? (
        <div className="rounded-2xl border border-card-border bg-card-background p-10 text-center text-sm text-text-tertiary">
          Chưa có Group nào. Bấm &quot;Tạo Group&quot; để bắt đầu.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.bigTeams.map((bigTeam) => (
            <BigTeamCard
              key={bigTeam.id}
              bigTeam={bigTeam}
              smallTeamCount={smallTeamsOfBigTeam(state, bigTeam).length}
              memberCount={membersOfBigTeam(state, bigTeam).length}
              allMembers={state.members.filter((member) => member.isActive !== false)}
              canManageLead={state.permissions?.canManage ?? false}
              onEdit={(name) =>
                void run(
                  () =>
                    saveGroup({
                      groupId: bigTeam.id,
                      groupName: name,
                      expectedRevision: bigTeam.revision,
                    }),
                  "Đã cập nhật tên Group.",
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
                  `Đã ngừng hoạt động Group "${bigTeam.name}".`,
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
                  leadId
                    ? "Đã cập nhật Trưởng Group."
                    : "Đã bỏ Trưởng Group.",
                )
              }
            />
          ))}
        </div>
      )}

      {isCreating && (
        <CreateTeamDialog
          title="Tạo Group theo tỉnh"
          description="Mỗi Group đại diện cho một tỉnh. Sau đó bạn tạo các Team thuộc Group này."
          fieldLabel="Tên Group"
          placeholder="Ví dụ: Group Tuyển sinh TP.HCM"
          submitLabel="Tạo Group"
          provinceOptions={state.options?.provinces}
          onClose={() => setIsCreating(false)}
          onSubmit={(name, _campusId, provinceId) =>
            void run(
              () => saveGroup({ groupName: name, provinceId }),
              `Đã tạo Group "${name}".`,
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
