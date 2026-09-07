"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/tailgrids/core/card";

import AddMemberDialog from "./add-member-dialog";
import SmallTeamDetailHeader from "./small-team-detail-header";
import LeadPickerField from "./lead-picker-field";
import SmallTeamStats from "./small-team-stats";
import { findMember, membersOfSmallTeam } from "./team-management-utils";
import TeamMemberList from "./team-member-list";
import { useTeamManagement } from "./use-team-management";

export default function SmallTeamDetailDashboard({
  bigTeamId,
  smallTeamId,
}: {
  bigTeamId: string;
  smallTeamId: string;
}) {
  const {
    state,
    isLoading,
    error,
    saveTeam,
    addMember,
    moveMember,
    removeMember,
    updateMember,
  } = useTeamManagement();
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading && !state) return <LoadingState />;
  if (error && !state) return <ErrorState message={error} />;
  if (!state) return null;

  const bigTeam = state.bigTeams.find((team) => team.id === bigTeamId) ?? null;
  const smallTeam =
    state.smallTeams.find(
      (team) => team.id === smallTeamId && team.bigTeamId === bigTeamId,
    ) ?? null;

  if (!bigTeam || !smallTeam) return <NotFoundState />;

  const members = membersOfSmallTeam(state, smallTeam);
  const candidates = state.members.filter(
    (member) =>
      member.isActive !== false &&
      member.campusId === smallTeam.campusId &&
      !smallTeam.memberIds.includes(member.id),
  );
  const saleCount = members.filter((member) => member.role === "SALE").length;
  const ctvSaleCount = members.filter(
    (member) => member.role === "CTV_SALE",
  ).length;

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

  const saveCurrentTeam = (leadId: string | null) => {
    if (!smallTeam.campusId) {
      return Promise.reject(new Error("Team chưa có cơ sở hoạt động."));
    }
    return saveTeam({
      teamId: smallTeam.id,
      teamName: smallTeam.name,
      groupId: bigTeam.id,
      teamType: smallTeam.teamType ?? "Sales",
      campus: smallTeam.campusId,
      teamLeadStaff: leadId,
      isActive: smallTeam.isActive,
      expectedRevision: smallTeam.revision,
    });
  };

  const handleAddMember = (memberId: string) => {
    const added = findMember(state.members, memberId);
    if (!added) return;
    const sourceTeamId = added.teamIds?.find(
      (teamId) => teamId !== smallTeam.id,
    );
    const functionName =
      added.role === "CTV_SALE"
        ? "CTV Sale"
        : added.role === "LEAD_SALE"
          ? "Lead Sale"
          : "Sale";
    const action = sourceTeamId
      ? () =>
          moveMember({
            staffId: memberId,
            sourceTeamId,
            targetTeamId: smallTeam.id,
            function: functionName,
          })
      : () =>
          addMember({
            staffId: memberId,
            teamId: smallTeam.id,
            function: functionName,
          });
    void run(
      action,
      sourceTeamId
        ? `Đã chuyển ${added.name} vào ${smallTeam.name}.`
        : `Đã thêm ${added.name} vào ${smallTeam.name}.`,
    ).finally(() => setIsAdding(false));
  };

  const handleRemoveMember = (memberId: string) => {
    const removed = findMember(state.members, memberId);
    const member = members.find((item) => item.id === memberId);
    if (!member) return;
    void run(
      () =>
        removeMember({
          staffId: memberId,
          teamId: smallTeam.id,
          expectedRevision: member.revision,
        }),
      removed
        ? `Đã gỡ ${removed.name} khỏi ${smallTeam.name}.`
        : "Đã gỡ thành viên.",
    );
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <SmallTeamDetailHeader
        bigTeam={bigTeam}
        smallTeam={smallTeam}
        onCreate={() => setIsAdding(true)}
      />
      <SmallTeamStats
        total={members.length}
        sale={saleCount}
        ctvSale={ctvSaleCount}
      />

      <section aria-label="Quản lý thành viên">
        <TeamMemberList
          smallTeam={smallTeam}
          members={members}
          leadPicker={
            <div className="flex w-full flex-col items-start gap-2 sm:w-auto">
              <span className="text-xs text-text-tertiary">Trưởng nhóm</span>
              <LeadPickerField
                candidates={members}
                value={smallTeam.leadId}
              onChange={(leadId) =>
                  void run(
                    () => saveCurrentTeam(leadId),
                    leadId ? "Đã cập nhật trưởng nhóm." : "Đã bỏ trưởng nhóm.",
                  )
              }
                isDisabled={!state.permissions?.canManage}
                ariaLabel={`Trưởng nhóm ${smallTeam.name}`}
                placeholder={
                  members.length === 0
                    ? "Chưa có thành viên"
                    : "Chọn trưởng nhóm"
                }
                className="w-full sm:w-60"
              />
            </div>
          }
          onUpdate={(id, field, value) => {
            if (field === "email")
              return "Email được lấy từ tài khoản CRM và không sửa ở đây.";
            const member = state.members.find((item) => item.id === id);
            if (!member) return "Không tìm thấy nhân sự.";
            void run(
              () =>
                updateMember({
                  staffId: id,
                  fullName: value,
                  expectedRevision: member.revision,
                }),
              "Đã cập nhật tên thành viên.",
            );
            return null;
          }}
          onRemove={handleRemoveMember}
        />
      </section>

      {isAdding && (
        <AddMemberDialog
          teamName={smallTeam.name}
          candidates={candidates}
          onClose={() => setIsAdding(false)}
          onSubmit={handleAddMember}
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

function NotFoundState() {
  return (
    <main id="main-content" className="min-w-0 p-6">
      <Card className="border-0 bg-badge-error-background p-5 text-error-600">
        <p className="text-base font-semibold">Không tìm thấy nhóm này.</p>
        <p className="mt-1 text-sm">
          Mã nhóm có thể không đúng hoặc đã ngừng hoạt động.
        </p>
      </Card>
    </main>
  );
}
