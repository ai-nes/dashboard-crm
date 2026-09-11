"use client";

import { ArrowRight, Layers2, UserMultiple1 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";

import EditableTeamTitle from "./editable-team-title";
import TeamCardActions from "./team-card-actions";
import EditableLeadPickerField from "./editable-lead-picker-field";
import ProvincePickerField from "./province-picker-field";
import type { BigTeam, TeamMember } from "./types";

interface BigTeamCardProps {
  bigTeam: BigTeam;
  smallTeamCount: number;
  memberCount: number;
  allMembers: TeamMember[];
  provinces: Array<{ id: string; label: string }>;
  canManageGroup: boolean;
  onEdit: (name: string) => void;
  onDelete: () => void;
  onReactivate: () => void;
  onLeadChange: (leadId: string | null) => void;
  onProvinceChange: (provinceId: string | null) => void;
}

export default function BigTeamCard({
  bigTeam,
  smallTeamCount,
  memberCount,
  allMembers,
  provinces,
  canManageGroup,
  onEdit,
  onDelete,
  onReactivate,
  onLeadChange,
  onProvinceChange,
}: BigTeamCardProps) {
  const isActive = bigTeam.isActive !== false;

  return (
    <Card className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-card-border p-0 transition-shadow hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <EditableTeamTitle
              name={bigTeam.name}
              onSave={onEdit}
              isDisabled={!canManageGroup}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge size="sm" color={isActive ? "success" : "gray"}>
                {isActive ? "Đang hoạt động" : "Đã ngừng hoạt động"}
              </Badge>
              <Badge
                size="sm"
                color="gray"
                prefixIcon={<Layers2 size={12} aria-hidden="true" />}
              >
                {smallTeamCount} Team
              </Badge>
              <Badge
                size="sm"
                color="gray"
                prefixIcon={<UserMultiple1 size={12} aria-hidden="true" />}
              >
                {memberCount} thành viên
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-text-secondary">
                Tỉnh quản lý
              </span>
              <ProvincePickerField
                options={provinces}
                value={bigTeam.provinceId}
                onChange={onProvinceChange}
                ariaLabel={`Tỉnh quản lý ${bigTeam.name}`}
                isDisabled={!canManageGroup}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-text-secondary">
                Trưởng Group
              </span>
              <EditableLeadPickerField
                candidates={allMembers}
                value={bigTeam.groupLeadId}
                onChange={onLeadChange}
                isDisabled={!canManageGroup}
                ariaLabel={`Trưởng Group ${bigTeam.name}`}
              />
            </div>
          </div>
          <TeamCardActions
            name={bigTeam.name}
            kind="nhóm"
            onDelete={onDelete}
            onReactivate={onReactivate}
            isActive={bigTeam.isActive}
            isDisabled={!canManageGroup}
          />
        </div>

        <Link
          href={`/lead-sale/team-management/${encodeURIComponent(bigTeam.id)}`}
          className="mt-auto inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-badge-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          Xem Team
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
