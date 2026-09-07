"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Trash1 } from "@tailgrids/icons";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import EditableMemberField from "./editable-member-field";
import { teamMemberRoleColor } from "./mappings";
import type { SmallTeam, TeamMember } from "./types";

export type UpdateMember = (
  id: string,
  field: "name" | "email",
  value: string,
) => string | null;

export function createTeamMemberColumns(
  smallTeam: SmallTeam,
  onUpdate: UpdateMember,
  onRemove: (id: string) => void,
): ColumnDef<TeamMember>[] {
  return [
    {
      accessorKey: "name",
      header: "Thành viên",
      size: 25,
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-1">
          <Avatar size="sm">
            <AvatarFallback className="bg-badge-primary-background text-badge-primary-text">
              {row.original.initials}
            </AvatarFallback>
          </Avatar>
          <EditableMemberField
            value={row.original.name}
            label={`Chỉnh sửa tên ${row.original.name}`}
            onSave={(value) => onUpdate(row.original.id, "name", value)}
          />
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 30,
      cell: ({ row }) => (
        <EditableMemberField
          type="email"
          readOnly
          value={row.original.email}
          label={`Chỉnh sửa email ${row.original.name}`}
          onSave={(value) => onUpdate(row.original.id, "email", value)}
        />
      ),
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      size: 16,
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge size="sm" color={teamMemberRoleColor[row.original.role]}>
          {row.original.role === "SALE"
            ? "Sale"
            : row.original.role === "CTV_SALE"
              ? "CTV Sale"
              : "Lead Sale"}
        </Badge>
      ),
    },
    {
      id: "teamRole",
      header: "Vai trò trong nhóm",
      size: 19,
      cell: ({ row }) => (
        <Badge
          size="sm"
          color={smallTeam.leadId === row.original.id ? "warning" : "gray"}
        >
          {smallTeam.leadId === row.original.id ? "Trưởng nhóm" : "Thành viên"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      size: 10,
      cell: ({ row }) => (
        <Button
          type="button"
          iconOnly
          appearance="ghost"
          size="sm"
          onPress={() => onRemove(row.original.id)}
          aria-label={`Gỡ ${row.original.name} khỏi ${smallTeam.name}`}
          className="mx-auto size-9 text-text-tertiary hover:bg-badge-error-background hover:text-badge-error-text"
        >
          <Trash1 size={16} aria-hidden="true" />
        </Button>
      ),
    },
  ];
}
