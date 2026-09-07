"use client";

import { ArrowRight, Layers2, UserMultiple1 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";

import EditableTeamTitle from "./editable-team-title";
import TeamCardActions from "./team-card-actions";
import LeadPickerField from "./lead-picker-field";
import type { BigTeam, TeamMember } from "./types";

interface BigTeamCardProps {
  bigTeam: BigTeam;
  allMembers: TeamMember[];
  smallTeamCount: number;
  memberCount: number;
  onEdit: (name: string) => void;
  onDelete: () => void;
  onLeadChange: (leadId: string | null) => void;
}

export default function BigTeamCard({
  bigTeam,
  allMembers,
  smallTeamCount,
  memberCount,
  onEdit,
  onDelete,
  onLeadChange,
}: BigTeamCardProps) {
  return (
    <Card className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-card-border p-0 transition-shadow hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <EditableTeamTitle name={bigTeam.name} onSave={onEdit} />
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge
                size="sm"
                color="gray"
                prefixIcon={<Layers2 size={12} aria-hidden="true" />}
              >
                {smallTeamCount} nhóm
              </Badge>
              <Badge
                size="sm"
                color="gray"
                prefixIcon={<UserMultiple1 size={12} aria-hidden="true" />}
              >
                {memberCount} thành viên
              </Badge>
            </div>
          </div>
          <TeamCardActions name={bigTeam.name} kind="đội" onDelete={onDelete} />
        </div>

        <div className="rounded-xl bg-background-gray-secondary/60 p-3.5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Trưởng đội
            </span>
            <LeadPickerField
              candidates={allMembers}
              value={bigTeam.leadId}
              onChange={onLeadChange}
              ariaLabel={`Trưởng đội ${bigTeam.name}`}
              className="w-full"
            />
          </label>
        </div>

        <Link
          href={`/lead-sale/team-management/${bigTeam.id}`}
          className="mt-auto inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-badge-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          Xem nhóm
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
