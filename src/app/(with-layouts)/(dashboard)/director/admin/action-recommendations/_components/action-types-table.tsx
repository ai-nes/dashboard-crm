"use client";

import { Eye, Pencil1, Plus } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useNbaAdminActionTypesQuery } from "@/hooks/use-nba-admin-queries";
import type { NbaAdminActionType } from "@/services/api/nba-admin";

import ActionTypeDetailDialog from "../../nba-actions/_components/action-type-detail-dialog";
import AdminTableToolbar from "./admin-table-toolbar";
import { RecordStatusBadge } from "./status-badges";
import type { SelectOption } from "./types";

interface ActionTypesTableProps {
  canEdit: boolean;
}

const statusOptions: SelectOption[] = [
  { id: "all", label: "Mọi trạng thái" },
  { id: "enabled", label: "Đang dùng" },
  { id: "disabled", label: "Tạm dừng" },
];

export default function ActionTypesTable({ canEdit }: ActionTypesTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<NbaAdminActionType | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const query = useNbaAdminActionTypesQuery({
    search: search.trim() || undefined,
    enabled: status === "all" ? undefined : status === "enabled",
    pageLength: 100,
  });
  const actionTypes = query.data?.actionTypes ?? [];

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-labelledby="action-types-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4">
          <div>
            <h2 id="action-types-heading" className="text-base font-semibold text-text-primary">Nhóm hành động</h2>
            <p className="mt-1 text-sm text-text-secondary">Phân loại các việc cần làm trong quy trình tuyển sinh.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">{query.isFetching ? "Đang tải…" : `${query.data?.total ?? 0} nhóm`}</span>
            {canEdit && <Button size="sm" onPress={() => { setSelected(null); setIsCreateOpen(true); }}><Plus size={16} aria-hidden="true" />Tạo nhóm</Button>}
          </div>
        </div>

        <AdminTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchLabel="Tìm nhóm hành động"
          searchPlaceholder="Tìm theo mã hoặc tên nhóm"
          filters={[{ label: "Lọc theo trạng thái nhóm", value: status, options: statusOptions, onChange: setStatus }]}
        />

        {query.error ? (
          <div className="px-5 py-10 text-center" role="alert">
            <p className="text-sm font-medium text-alert-danger-title">Không tải được nhóm hành động.</p>
            <p className="mt-1 text-sm text-alert-danger-description">{query.error.message}</p>
            <Button size="sm" appearance="outline" className="mt-4" onPress={() => void query.refetch()}>Thử lại</Button>
          </div>
        ) : query.isPending ? (
          <p className="px-5 py-12 text-center text-sm text-text-tertiary">Đang tải danh sách nhóm hành động…</p>
        ) : (
          <TableRoot fullBleed className="border-0">
            <TableHeader className="bg-background-gray-secondary">
              <TableRow>
                <TableHead>Mã nhóm</TableHead>
                <TableHead>Tên nhóm</TableHead>
                <TableHead>Thứ tự</TableHead>
                <TableHead>Cập nhật gần nhất</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionTypes.map((actionType) => (
                <TableRow key={actionType.name} className="hover:bg-background-gray-secondary_alt">
                  <TableCell className="font-mono text-xs font-semibold tracking-[0.04em] text-primary-500">{actionType.actionType}</TableCell>
                  <TableCell className="font-semibold text-text-primary">{actionType.displayName}</TableCell>
                  <TableCell className="text-sm text-text-secondary">{actionType.sortOrder}</TableCell>
                  <TableCell className="text-sm text-text-secondary">{actionType.modified ?? "—"}</TableCell>
                  <TableCell><RecordStatusBadge status={actionType.enabled ? "active" : "inactive"} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="primary" appearance="outline" onPress={() => { setIsCreateOpen(false); setSelected(actionType); }} aria-label={`${canEdit ? "Chỉnh sửa" : "Xem"} nhóm ${actionType.displayName}`} className="min-w-20">
                      {canEdit ? <Pencil1 size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                      {canEdit ? "Sửa" : "Xem"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {actionTypes.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-text-tertiary">Không tìm thấy nhóm hành động phù hợp.</TableCell></TableRow>
              )}
            </TableBody>
          </TableRoot>
        )}
      </section>

      {(selected || isCreateOpen) && <ActionTypeDetailDialog key={selected?.name ?? "new"} actionType={selected} canEdit={canEdit} onClose={() => { setSelected(null); setIsCreateOpen(false); }} />}
    </>
  );
}
