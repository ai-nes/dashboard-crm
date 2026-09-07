"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/tailgrids/core/card";

import BigTeamStats from "./big-team-stats";
import BigTeamDetailHeader from "./big-team-detail-header";
import CreateTeamDialog from "./create-team-dialog";
import SmallTeamCard from "./small-team-card";
import {
  membersOfBigTeam,
  membersOfSmallTeam,
  smallTeamsOfBigTeam,
} from "./team-management-utils";
import { useTeamManagement } from "./use-team-management";

export default function BigTeamDetailDashboard({
  bigTeamId,
}: {
  bigTeamId: string;
}) {
  const { state, isLoading, error, saveGroup, saveTeam } = useTeamManagement();
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading && !state) return <LoadingState />;
  if (error && !state) return <ErrorState message={error} />;
  if (!state) return null;

  const bigTeam = state.bigTeams.find((team) => team.id === bigTeamId) ?? null;
  if (!bigTeam) return <NotFoundState label="đội" />;

  const smallTeams = smallTeamsOfBigTeam(state, bigTeam);
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
      />
      <BigTeamStats
        bigTeam={bigTeam}
        allMembers={state.members.filter((member) => member.isActive !== false)}
        smallTeamCount={smallTeams.length}
        memberCount={membersOfBigTeam(state, bigTeam).length}
        canManageLead={state.permissions?.canManageAll ?? false}
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
              onLeadChange={(leadId) =>
                void run(
                  () => saveExistingTeam(smallTeam.id, { leadId }),
                  leadId ? "Đã cập nhật trưởng nhóm." : "Đã bỏ trưởng nhóm.",
                )
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
          placeholder="Ví dụ: Nhóm Tư vấn Quận 1"
          submitLabel="Tạo nhóm"
          campusOptions={state.options?.campuses}
          onClose={() => setIsCreating(false)}
          onSubmit={(name, campusId) => {
            if (!campusId) return;
            void run(
              () =>
                saveTeam({
                  teamName: name,
                  groupId: bigTeam.id,
                  teamType: "Sales",
                  campus: campusId,
                  isActive: true,
                }),
              `Đã tạo nhóm "${name}".`,
            ).finally(() => setIsCreating(false));
          }}
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
