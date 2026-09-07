import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";

import { teamMemberRoleColor, teamMemberRoleLabel } from "./mappings";
import type { TeamMember } from "./types";

interface TeamMemberIdentityProps {
  member: TeamMember;
  showRole?: boolean;
  showEmail?: boolean;
}

export default function TeamMemberIdentity({
  member,
  showRole = false,
  showEmail = false,
}: TeamMemberIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar size="sm">
        <AvatarFallback className="bg-badge-primary-background text-badge-primary-text">
          {member.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p
          title={member.name}
          className="truncate text-sm font-medium text-text-primary"
        >
          {member.name}
        </p>
        {showEmail && (
          <p
            title={member.email}
            className="mt-1 truncate text-xs text-text-secondary"
          >
            {member.email}
          </p>
        )}
      </div>
      {showRole && (
        <Badge
          size="sm"
          color={teamMemberRoleColor[member.role]}
          className="shrink-0"
        >
          {teamMemberRoleLabel[member.role]}
        </Badge>
      )}
    </div>
  );
}
