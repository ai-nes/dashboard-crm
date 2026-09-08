"use client";

import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type PaginationState,
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
import { Pagination } from "@/components/tailgrids/core/pagination";
import TeamMemberToolbar from "./team-member-toolbar";
import type { SmallTeam, TeamMember } from "./types";

interface TeamMemberListProps {
  smallTeam: SmallTeam;
  members: TeamMember[];
  onRemove: (memberId: string) => void;
  onUpdate: UpdateMember;
  leadPicker: ReactNode;
  canManageMembers: boolean;
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const TEAM_MEMBER_PAGE_SIZE = 5;

export default function TeamMemberList({
  smallTeam,
  members,
  onRemove,
  onUpdate,
  leadPicker,
  canManageMembers,
}: TeamMemberListProps) {
  "use no memo"; // TanStack Table exposes mutable state through its table instance.
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TEAM_MEMBER_PAGE_SIZE,
  });
  const table = useReactTable({
    data: members,
    state: { pagination },
    onPaginationChange: setPagination,
    defaultColumn: { minSize: 0 },
    columns: createTeamMemberColumns(
      smallTeam,
      onUpdate,
      onRemove,
      canManageMembers,
    ),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (member) => member.id,
    getColumnCanGlobalFilter: (column) =>
      column.id === "name" || column.id === "email",
    globalFilterFn: (row, columnId, value: string) =>
      normalize(String(row.getValue(columnId))).includes(
        normalize(value.trim()),
      ),
  });
  const rows = table.getRowModel().rows;
  const filteredMemberCount = table.getFilteredRowModel().rows.length;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMemberCount / TEAM_MEMBER_PAGE_SIZE),
  );
  const currentPage = Math.min(pagination.pageIndex + 1, totalPages);
  const firstVisibleMember =
    filteredMemberCount === 0
      ? 0
      : (currentPage - 1) * TEAM_MEMBER_PAGE_SIZE + 1;
  const lastVisibleMember = Math.min(
    currentPage * TEAM_MEMBER_PAGE_SIZE,
    filteredMemberCount,
  );
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
              <TableCell
                colSpan={table.getAllLeafColumns().length}
                className="px-6 py-12 text-center"
              >
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
      <div className="flex flex-col gap-3 border-t border-card-border px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p
          role="status"
          className="shrink-0 whitespace-nowrap text-xs text-text-secondary"
        >
          Hiển thị {firstVisibleMember}–{lastVisibleMember} trong tổng số{" "}
          {filteredMemberCount} thành viên
        </p>
        {totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-end max-sm:w-full">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => table.setPageIndex(page - 1)}
              variant="compact"
            />
          </div>
        )}
      </div>
    </TeamMemberToolbar>
  );
}
