"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card } from "@/components/tailgrids/core/card";

import BigTeamStats from "./big-team-stats";
import BigTeamDetailHeader from "./big-team-detail-header";
import CreateTeamDialog from "./create-team-dialog";
import SmallTeamCard from "./small-team-card";
import TeamManagementSkeleton from "./team-management-skeleton";
import {
  getTeamManagementEntryPath,
  membersOfBigTeam,
  membersOfSmallTeam,
  smallTeamsOfBigTeam,
  unassignedMembers,
} from "./team-management-utils";
import { canManageTeam } from "./team-management-access";
import { useTeamManagement } from "./use-team-management";

export default function BigTeamDetailDashboard({
  bigTeamId,
}: {
  bigTeamId: string;
}) {
  const { state, isLoading, error, saveTeam } = useTeamManagement();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const canViewGroupDetail = Boolean(
    state?.permissions?.canManageAll ||
    state?.permissions?.managedGroupIds.includes(bigTeamId),
  );
  const redirectPath =
    state && !canViewGroupDetail ? getTeamManagementEntryPath(state) : null;

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  if (isLoading && !state) return <LoadingState />;
  if (error && !state) return <ErrorState message={error} />;
  if (!state) return null;
  if (redirectPath) {
    return <LoadingState message="Đang mở Team của bạn..." />;
  }

  const bigTeam = state.bigTeams.find((team) => team.id === bigTeamId) ?? null;
  if (!bigTeam) return <NotFoundState label="đội" />;

  const smallTeams = smallTeamsOfBigTeam(state, bigTeam);
  const canManageTeams = Boolean(
    state.permissions?.canManageAll ||
    state.permissions?.managedGroupIds.includes(bigTeam.id),
  );
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

  const saveExistingTeam = (
    teamId: string,
    values: { name?: string; leadId?: string | null; isActive?: boolean },
  ) => {
    const team = state.smallTeams.find((item) => item.id === teamId);
    if (!team || !team.campusId) {
      toast.error("Team chưa có cơ sở hoạt động.");
      return Promise.reject(new Error("Thiếu cơ sở hoạt động."));
    }
    return saveTeam({
      teamId: team.id,
      teamName: values.name ?? team.name,
      groupId: bigTeam.id,
      teamType: team.teamType ?? "Sales",
      campus: team.campusId,
      teamLeadStaff: values.leadId === undefined ? team.leadId : values.leadId,
      isActive: values.isActive ?? team.isActive,
      expectedRevision: team.revision,
    });
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <BigTeamDetailHeader
        bigTeam={bigTeam}
        onCreate={() => setIsCreating(true)}
        canManageTeams={canManageTeams}
        canViewOverview={state.permissions?.canManageAll ?? false}
      />
      <BigTeamStats
        bigTeam={bigTeam}
        smallTeamCount={smallTeams.length}
        memberCount={membersOfBigTeam(state, bigTeam).length}
      />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-primary">
          Team trong {bigTeam.name}
        </h2>
      </div>

      {smallTeams.length === 0 ? (
        <div className="rounded-2xl border border-card-border bg-card-background p-10 text-center text-sm text-text-tertiary">
          Chưa có Team nào trong Group này.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {smallTeams.map((smallTeam) => (
            <SmallTeamCard
              key={smallTeam.id}
              bigTeamId={bigTeamId}
              smallTeam={smallTeam}
              members={membersOfSmallTeam(state, smallTeam)}
              onEdit={(name) =>
                void run(
                  () => saveExistingTeam(smallTeam.id, { name }),
                  "Đã cập nhật tên nhóm.",
                )
              }
              onDelete={() =>
                void run(
                  () => saveExistingTeam(smallTeam.id, { isActive: false }),
                  `Đã ngừng hoạt động nhóm "${smallTeam.name}".`,
                )
              }
              onReactivate={() =>
                void run(
                  () => saveExistingTeam(smallTeam.id, { isActive: true }),
                  `Đã kích hoạt lại nhóm "${smallTeam.name}".`,
                )
              }
              onLeadChange={(leadId) =>
                void run(
                  () => saveExistingTeam(smallTeam.id, { leadId }),
                  leadId ? "Đã cập nhật trưởng nhóm." : "Đã bỏ trưởng nhóm.",
                )
              }
              canManageTeam={canManageTeam(state.permissions, smallTeam.id)}
            />
          ))}
        </div>
      )}

      {isCreating && (
        <CreateTeamDialog
          title="Tạo Team"
          description={`Team thuộc Group ${bigTeam.name} (${bigTeam.provinceName ?? "chưa có tỉnh"}). Người được chọn làm Trưởng nhóm sẽ được tự động thêm vào Team và phân công sau khi tạo.`}
          fieldLabel="Tên Team"
          placeholder="Ví dụ: Team Tư vấn Khu Đông"
          submitLabel="Tạo Team"
          campusOptions={state.options?.campuses}
          teamLeadOptions={unassignedMembers(state).filter(
            (member) =>
              member.isActive !== false && member.role !== "LEAD_SALE",
          )}
          onClose={() => setIsCreating(false)}
          onSubmit={(name, campusId, _provinceId, teamLeadId) => {
            if (!campusId) return;
            void run(
              () =>
                saveTeam({
                  teamName: name,
                  groupId: bigTeam.id,
                  teamType: "Sales",
                  campus: campusId,
                  teamLeadStaff: teamLeadId,
                  isActive: true,
                }),
              `Đã tạo Team "${name}".`,
            ).finally(() => setIsCreating(false));
          }}
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
  return <TeamManagementSkeleton view="group" message={message} />;
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

function NotFoundState({ label }: { label: string }) {
  return (
    <main id="main-content" className="min-w-0 p-6">
      <Card className="border-0 bg-badge-error-background p-5 text-error-600">
        <p className="text-base font-semibold">Không tìm thấy {label} này.</p>
        <p className="mt-1 text-sm">
          Mã có thể không đúng hoặc đã ngừng hoạt động.
        </p>
      </Card>
    </main>
  );
}
