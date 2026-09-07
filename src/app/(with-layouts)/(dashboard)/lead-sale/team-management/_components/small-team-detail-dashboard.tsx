"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/tailgrids/core/card";

import AddMemberDialog from "./add-member-dialog";
import { initialBigTeams, initialMembers, initialSmallTeams } from "./data";
import SmallTeamDetailHeader from "./small-team-detail-header";
import LeadPickerField from "./lead-picker-field";
import SmallTeamStats from "./small-team-stats";
import {
  findMember,
  membersOfSmallTeam,
  unassignedMembers,
} from "./team-management-utils";
import TeamMemberList from "./team-member-list";
import type { TeamOrgState } from "./types";

export default function SmallTeamDetailDashboard({
  bigTeamId,
  smallTeamId,
}: {
  bigTeamId: string;
  smallTeamId: string;
}) {
  const [state, setState] = useState<TeamOrgState>({
    bigTeams: initialBigTeams,
    smallTeams: initialSmallTeams,
    members: initialMembers,
  });
  const [isAdding, setIsAdding] = useState(false);

  const bigTeam = state.bigTeams.find((team) => team.id === bigTeamId) ?? null;
  const smallTeam =
    state.smallTeams.find(
      (team) => team.id === smallTeamId && team.bigTeamId === bigTeamId,
    ) ?? null;

  if (!bigTeam || !smallTeam) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-0 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">Không tìm thấy nhóm này.</p>
          <p className="mt-1 text-sm">
            Team có thể đã bị xóa hoặc mã team không đúng.
          </p>
        </Card>
      </main>
    );
  }

  const members = membersOfSmallTeam(state, smallTeam);
  const candidates = unassignedMembers(state);
  const saleCount = members.filter((member) => member.role === "SALE").length;
  const ctvSaleCount = members.filter(
    (member) => member.role === "CTV_SALE",
  ).length;

  const handleLeadChange = (leadId: string | null) => {
    setState((current) => ({
      ...current,
      smallTeams: current.smallTeams.map((team) =>
        team.id === smallTeamId ? { ...team, leadId } : team,
      ),
    }));
    toast.success(leadId ? "Đã cập nhật trưởng nhóm." : "Đã bỏ trưởng nhóm.");
  };

  const handleAddMember = (memberId: string) => {
    setState((current) => ({
      ...current,
      smallTeams: current.smallTeams.map((team) =>
        team.id === smallTeamId
          ? { ...team, memberIds: [...team.memberIds, memberId] }
          : team,
      ),
    }));
    setIsAdding(false);
    const added = findMember(state.members, memberId);
    toast.success(
      added
        ? `Đã thêm ${added.name} vào ${smallTeam.name}.`
        : "Đã thêm thành viên.",
    );
  };

  const handleRemoveMember = (memberId: string) => {
    const removed = findMember(state.members, memberId);
    setState((current) => ({
      ...current,
      smallTeams: current.smallTeams.map((team) =>
        team.id === smallTeamId
          ? {
              ...team,
              memberIds: team.memberIds.filter((id) => id !== memberId),
              leadId: team.leadId === memberId ? null : team.leadId,
            }
          : team,
      ),
    }));
    toast.success(
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
                onChange={handleLeadChange}
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
            if (
              field === "email" &&
              state.members.some(
                (member) =>
                  member.id !== id &&
                  member.email.toLowerCase() === value.toLowerCase(),
              )
            )
              return "Email này đã được sử dụng.";
            setState((current) => ({
              ...current,
              members: current.members.map((member) => {
                if (member.id !== id) return member;
                const parts = value.split(/\s+/);
                return {
                  ...member,
                  [field]: value,
                  ...(field === "name"
                    ? {
                        initials: (parts.length > 1
                          ? parts[0][0] + parts[parts.length - 1][0]
                          : value.slice(0, 2)
                        ).toUpperCase(),
                      }
                    : {}),
                };
              }),
            }));
            toast.success(
              field === "name"
                ? "Đã cập nhật tên thành viên."
                : "Đã cập nhật email.",
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
