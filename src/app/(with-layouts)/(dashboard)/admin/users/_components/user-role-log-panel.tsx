"use client";

import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import {
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTablePagination,
  AdminTableRoot,
  AdminTableRow,
  AdminTableFrame,
} from "@/components/common/admin/admin-table";
import { TableBody } from "@/components/tailgrids/core/table";
import { useUserRoleLogsQuery } from "@/hooks/use-user-management-queries";

const PAGE_LENGTH = 8;

function formatDate(date: string): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
}

export default function UserRoleLogPanel() {
  const [start, setStart] = useState(0);
  const logsQuery = useUserRoleLogsQuery({ start, pageLength: PAGE_LENGTH });
  const logs = logsQuery.data?.logs ?? [];
  const total = logsQuery.data?.total ?? 0;
  const currentPage = Math.floor(start / PAGE_LENGTH) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LENGTH));

  return (
    <AdminTableFrame>
      <AdminTableRoot aria-label="Lịch sử thay đổi vai trò">
        <AdminTableHeader>
          <AdminTableRow>
            <AdminTableHead scope="col">Người dùng</AdminTableHead>
            <AdminTableHead scope="col">Hành động</AdminTableHead>
            <AdminTableHead scope="col">Vai trò trước</AdminTableHead>
            <AdminTableHead scope="col">Vai trò mới</AdminTableHead>
            <AdminTableHead scope="col">Thực hiện bởi</AdminTableHead>
            <AdminTableHead scope="col">Thời gian</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <TableBody>
          {logsQuery.isPending
            ? Array.from({ length: 4 }).map((_, index) => (
                <AdminTableRow key={index}>
                  <AdminTableCell colSpan={6} className="py-5">
                    <div className="h-4 animate-pulse rounded bg-background-gray-secondary" />
                  </AdminTableCell>
                </AdminTableRow>
              ))
            : null}
          {!logsQuery.isPending && logs.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell
                colSpan={6}
                className="py-16 text-center text-sm text-text-tertiary"
              >
                Chưa có lịch sử thay đổi vai trò nào.
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
          {!logsQuery.isPending
            ? logs.map((log) => (
                <AdminTableRow key={log.name}>
                  <AdminTableCell className="py-3.5 font-medium">
                    {log.user}
                  </AdminTableCell>
                  <AdminTableCell className="py-3.5">
                    <Badge
                      color={log.action === "removed" ? "error" : "primary"}
                    >
                      {log.action === "removed" ? "Gỡ khỏi CRM" : "Đổi vai trò"}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell className="py-3.5 text-text-secondary">
                    {log.previousRole ?? "—"}
                  </AdminTableCell>
                  <AdminTableCell className="py-3.5 text-text-secondary">
                    {log.newRole ?? "—"}
                  </AdminTableCell>
                  <AdminTableCell className="py-3.5 text-text-secondary">
                    {log.owner}
                  </AdminTableCell>
                  <AdminTableCell className="py-3.5 text-text-tertiary">
                    {formatDate(log.creation)}
                  </AdminTableCell>
                </AdminTableRow>
              ))
            : null}
        </TableBody>
      </AdminTableRoot>
      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={(page) => setStart((page - 1) * PAGE_LENGTH)}
        isDisabled={logsQuery.isFetching}
      />
    </AdminTableFrame>
  );
}
