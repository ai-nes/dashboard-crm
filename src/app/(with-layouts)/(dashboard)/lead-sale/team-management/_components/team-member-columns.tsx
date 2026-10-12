"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { TableRowActions } from "@/components/common/table-row-actions";
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
  canManageMembers: boolean,
): ColumnDef<TeamMember>[] {
  const columns: ColumnDef<TeamMember>[] = [
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
            readOnly={!canManageMembers}
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
  ];

  if (canManageMembers) {
    columns.push({
      id: "actions",
      header: "Thao tác",
      size: 10,
      cell: ({ row }) => (
        <TableRowActions label={row.original.name} actions={[
          { id: "delete", label: "Gỡ khỏi nhóm", ariaLabel: `Gỡ ${row.original.name} khỏi ${smallTeam.name}`, onAction: () => onRemove(row.original.id), variant: "danger" },
        ]} />
      ),
    });
  }

  return columns;
}
