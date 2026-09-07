"use client";

import { ArrowRight, UserMultiple1 } from "@tailgrids/icons";
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";

import EditableTeamTitle from "./editable-team-title";
import TeamCardActions from "./team-card-actions";
import LeadPickerField from "./lead-picker-field";
import type { SmallTeam, TeamMember } from "./types";

const MAX_AVATARS = 4;

interface SmallTeamCardProps {
  bigTeamId: string;
  smallTeam: SmallTeam;
  members: TeamMember[];
  onEdit: (name: string) => void;
  onDelete: () => void;
  onLeadChange: (leadId: string | null) => void;
  canManageTeam?: boolean;
}

export default function SmallTeamCard({
  bigTeamId,
  smallTeam,
  members,
  onEdit,
  onDelete,
  onLeadChange,
  canManageTeam = false,
}: SmallTeamCardProps) {
  const visibleMembers = members.slice(0, MAX_AVATARS);
  const remaining = members.length - visibleMembers.length;

  return (
    <Card className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-card-border p-0 transition-shadow hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <EditableTeamTitle
              name={smallTeam.name}
              onSave={onEdit}
              isDisabled={!canManageTeam}
            />
            <Badge
              size="sm"
              color="gray"
              prefixIcon={<UserMultiple1 size={12} aria-hidden="true" />}
              className="mt-2"
            >
              {members.length} thành viên
            </Badge>
            {smallTeam.readiness && (
              <Badge
                size="sm"
                color={smallTeam.readiness === "ready" ? "success" : "warning"}
                className="mt-2 ml-1"
                title={smallTeam.readinessReason}
              >
                {smallTeam.readiness === "ready"
                  ? "Sẵn sàng nhận Lead"
                  : "Chưa sẵn sàng"}
              </Badge>
            )}
          </div>
          <TeamCardActions
            name={smallTeam.name}
            kind="đội"
            onDelete={onDelete}
            isDisabled={!canManageTeam}
          />
        </div>

        <div className="flex min-h-8 items-center">
          {members.length > 0 ? (
            <AvatarGroup>
              {visibleMembers.map((member) => (
                <Avatar key={member.id} size="sm">
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
              ))}
              {remaining > 0 && (
                <AvatarGroupCount size="sm">+{remaining}</AvatarGroupCount>
              )}
            </AvatarGroup>
          ) : (
            <span className="text-xs text-text-tertiary">
              Chưa có thành viên
            </span>
          )}
        </div>

        <div className="rounded-xl bg-background-gray-secondary/60 p-3.5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Trưởng nhóm
            </span>
            <LeadPickerField
              candidates={members}
              value={smallTeam.leadId}
              onChange={onLeadChange}
              isDisabled={!canManageTeam}
              ariaLabel={`Trưởng nhóm ${smallTeam.name}`}
              placeholder={
                members.length === 0 ? "Chưa có thành viên" : "Chọn trưởng nhóm"
              }
              className="w-full"
            />
          </label>
        </div>

        <Link
          href={`/lead-sale/team-management/${encodeURIComponent(bigTeamId)}/${encodeURIComponent(smallTeam.id)}`}
          className="mt-auto inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-badge-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          Xem thành viên Team
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
