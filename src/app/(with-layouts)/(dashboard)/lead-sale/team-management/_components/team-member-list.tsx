"use client";

import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/tailgrids/core/table";
import {
  createTeamMemberColumns,
  type UpdateMember,
} from "./team-member-columns";
import TeamMemberToolbar from "./team-member-toolbar";
import type { SmallTeam, TeamMember } from "./types";

interface TeamMemberListProps {
  smallTeam: SmallTeam;
  members: TeamMember[];
  onRemove: (memberId: string) => void;
  onUpdate: UpdateMember;
  leadPicker: ReactNode;
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export default function TeamMemberList({
  smallTeam,
  members,
  onRemove,
  onUpdate,
  leadPicker,
}: TeamMemberListProps) {
  "use no memo"; // TanStack Table exposes mutable state through its table instance.
  const table = useReactTable({
    data: members,
    defaultColumn: { minSize: 0 },
    columns: createTeamMemberColumns(smallTeam, onUpdate, onRemove),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (member) => member.id,
    getColumnCanGlobalFilter: (column) =>
      column.id === "name" || column.id === "email",
    globalFilterFn: (row, columnId, value: string) =>
      normalize(String(row.getValue(columnId))).includes(
        normalize(value.trim()),
      ),
  });
  const rows = table.getRowModel().rows;
  return (
    <TeamMemberToolbar table={table} leadPicker={leadPicker}>
      <p className="px-6 py-3 text-xs text-text-tertiary sm:hidden">
        Vuốt ngang để xem đầy đủ thông tin và thao tác.
      </p>
      <TableRoot
        className="w-full min-w-[960px] table-fixed rounded-none border-0"
        aria-label={`Thành viên ${smallTeam.name}`}
      >
        <colgroup>
          {table.getAllLeafColumns().map((column) => (
            <col key={column.id} style={{ width: `${column.getSize()}%` }} />
          ))}
        </colgroup>
        <TableHeader className="bg-background-gray-secondary/70 text-text-secondary [&_th]:border-0">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  scope="col"
                  className={`px-4 py-3.5 ${header.id === "actions" ? "text-center" : ""}`}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="transition-colors even:bg-background-gray-secondary/25 hover:bg-background-gray-secondary/60 not-last:[&>td]:border-0"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4 py-4 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="px-6 py-12 text-center">
                <p className="font-medium text-text-primary">
                  {members.length
                    ? "Không tìm thấy thành viên phù hợp"
                    : "Nhóm chưa có thành viên"}
                </p>
                <p className="mt-2 text-sm font-normal text-text-secondary">
                  {members.length
                    ? "Thử từ khóa khác hoặc chọn tab Tất cả."
                    : "Chọn “Thêm thành viên” để thêm nhân sự vào nhóm."}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableRoot>
      <p role="status" className="px-6 py-4 text-xs text-text-secondary">
        Hiển thị {rows.length} / {members.length} thành viên
      </p>
    </TeamMemberToolbar>
  );
}
