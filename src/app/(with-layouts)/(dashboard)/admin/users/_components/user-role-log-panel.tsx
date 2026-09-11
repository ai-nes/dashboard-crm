"use client";

import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useUserRoleLogsQuery } from "@/hooks/use-user-management-queries";

const PAGE_LENGTH = 20;

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
  const hasNextPage = start + PAGE_LENGTH < total;

  return (
    <section className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs">
      <TableRoot fullBleed className="border-0" aria-label="Lịch sử thay đổi vai trò">
        <TableHeader className="bg-background-gray-secondary">
          <TableRow>
            <TableHead scope="col" className="whitespace-nowrap">
              Người dùng
            </TableHead>
            <TableHead scope="col" className="whitespace-nowrap">
              Hành động
            </TableHead>
            <TableHead scope="col" className="whitespace-nowrap">
              Vai trò trước
            </TableHead>
            <TableHead scope="col" className="whitespace-nowrap">
              Vai trò mới
            </TableHead>
            <TableHead scope="col" className="whitespace-nowrap">
              Thực hiện bởi
            </TableHead>
            <TableHead scope="col" className="whitespace-nowrap">
              Thời gian
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logsQuery.isPending
            ? Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6} className="py-5">
                    <div className="h-4 animate-pulse rounded bg-background-gray-secondary" />
                  </TableCell>
                </TableRow>
              ))
            : null}
          {!logsQuery.isPending && logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center text-sm text-text-tertiary">
                Chưa có lịch sử thay đổi vai trò nào.
              </TableCell>
            </TableRow>
          ) : null}
          {!logsQuery.isPending
            ? logs.map((log) => (
                <TableRow key={log.name}>
                  <TableCell className="py-3.5 text-sm font-medium text-text-primary">{log.user}</TableCell>
                  <TableCell className="py-3.5 text-sm">
                    <Badge color={log.action === "removed" ? "error" : "primary"}>
                      {log.action === "removed" ? "Gỡ khỏi CRM" : "Đổi vai trò"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-text-secondary">
                    {log.previousRole ?? "—"}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-text-secondary">{log.newRole ?? "—"}</TableCell>
                  <TableCell className="py-3.5 text-sm text-text-secondary">{log.owner}</TableCell>
                  <TableCell className="py-3.5 text-sm text-text-tertiary">{formatDate(log.creation)}</TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </TableRoot>
      {total > PAGE_LENGTH ? (
        <div className="flex items-center justify-between border-t border-card-border px-4 py-3">
          <span className="text-xs text-text-tertiary">
            {Math.min(start + 1, total)}–{Math.min(start + PAGE_LENGTH, total)} / {total}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              appearance="outline"
              isDisabled={start === 0}
              onPress={() => setStart(Math.max(0, start - PAGE_LENGTH))}
            >
              Trước
            </Button>
            <Button size="sm" appearance="outline" isDisabled={!hasNextPage} onPress={() => setStart(start + PAGE_LENGTH)}>
              Sau
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
