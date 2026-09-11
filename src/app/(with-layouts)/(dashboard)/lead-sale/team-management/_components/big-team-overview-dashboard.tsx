"use client";

import { Plus } from "@tailgrids/icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";

import OverviewFact from "./overview-fact";
import BigTeamCard from "./big-team-card";
import CreateTeamDialog from "./create-team-dialog";
import TeamManagementSkeleton from "./team-management-skeleton";
import {
  getTeamManagementEntryPath,
  membersOfBigTeam,
  smallTeamsOfBigTeam,
} from "./team-management-utils";
import { useTeamManagement } from "./use-team-management";

export default function BigTeamOverviewDashboard() {
  const { state, isLoading, error, saveGroup } = useTeamManagement();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const entryPath = state ? getTeamManagementEntryPath(state) : null;

  useEffect(() => {
    if (entryPath) router.replace(entryPath);
  }, [entryPath, router]);

  if (isLoading && !state) return <LoadingState />;
  if (error && !state) return <ErrorState message={error} />;
  if (!state) return null;
  if (entryPath) {
    return <LoadingState message="Đang mở phạm vi đội ngũ của bạn..." />;
  }

  const canManageGroups = state.permissions?.canManageGroups ?? false;
  const activeLeadCandidates = state.members.filter(
    (member) => member.isActive !== false,
  );
  const assignedMemberCount = new Set(
    state.smallTeams.flatMap((team) => team.memberIds),
  ).size;
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
            isDisabled={!canManageGroups}
          >
            <Plus size={16} aria-hidden="true" />
            Tạo Group
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <OverviewFact
          kind="teams"
          label="Group tỉnh"
          value={state.bigTeams.length}
        />
        <OverviewFact
          kind="groups"
          label="Team"
          value={state.smallTeams.length}
        />
        <OverviewFact label="Thành viên" value={assignedMemberCount} />
      </div>

      {state.bigTeams.length === 0 ? (
        <div className="rounded-2xl border border-card-border bg-card-background p-10 text-center text-sm text-text-tertiary">
          {canManageGroups
            ? 'Chưa có Group nào. Bấm "Tạo Group" để bắt đầu.'
            : "Bạn chưa được phân công vào Group hoặc Team nào."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.bigTeams.map((bigTeam) => (
            <BigTeamCard
              key={bigTeam.id}
              bigTeam={bigTeam}
              smallTeamCount={smallTeamsOfBigTeam(state, bigTeam).length}
              memberCount={membersOfBigTeam(state, bigTeam).length}
              allMembers={state.members.filter(
                (member) => member.isActive !== false,
              )}
              provinces={state.options?.provinces ?? []}
              canManageGroup={canManageGroups}
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
              onReactivate={() =>
                void run(
                  () =>
                    saveGroup({
                      groupId: bigTeam.id,
                      groupName: bigTeam.name,
                      isActive: true,
                      expectedRevision: bigTeam.revision,
                    }),
                  `Đã kích hoạt lại Group "${bigTeam.name}".`,
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
                  leadId ? "Đã cập nhật Trưởng Group." : "Đã bỏ Trưởng Group.",
                )
              }
              onProvinceChange={(provinceId) =>
                void run(
                  () =>
                    saveGroup({
                      groupId: bigTeam.id,
                      groupName: bigTeam.name,
                      provinceId,
                      expectedRevision: bigTeam.revision,
                    }),
                  provinceId
                    ? "Đã cập nhật tỉnh quản lý."
                    : "Đã bỏ tỉnh quản lý.",
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
          groupLeadOptions={activeLeadCandidates}
          onClose={() => setIsCreating(false)}
          onSubmit={(name, _campusId, provinceId, _teamLeadId, groupLeadId) =>
            void run(
              () =>
                saveGroup({
                  groupName: name,
                  provinceId,
                  groupLeadStaff: groupLeadId,
                }),
              `Đã tạo Group "${name}".`,
            ).finally(() => setIsCreating(false))
          }
        />
      )}
    </main>
  );
}

function LoadingState({
  message = "Đang tải dữ liệu đội ngũ...",
}: {
  message?: string;
}) {
  return <TeamManagementSkeleton message={message} />;
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
