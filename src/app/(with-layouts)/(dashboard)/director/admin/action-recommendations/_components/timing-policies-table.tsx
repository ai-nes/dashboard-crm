"use client";

import { Eye, Pencil1, Plus } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useNbaTimingPoliciesQuery } from "@/hooks/use-nba-admin-queries";
import type { NbaTimingPolicy } from "@/services/api/nba-admin";

import AdminTableToolbar from "./admin-table-toolbar";
import TimingPolicyEditorDialog from "../../nba-actions/_components/timing-policy-editor-dialog";
import type { SelectOption } from "./types";

interface TimingPoliciesTableProps {
  canEdit: boolean;
}

const triggerOptions: SelectOption[] = [
  { id: "all", label: "Mọi loại kích hoạt" },
  { id: "event", label: "Theo sự kiện" },
  { id: "relative", label: "Theo thời gian" },
  { id: "deadline", label: "Trước hạn" },
  { id: "schedule", label: "Theo lịch" },
];

const triggerLabels: Record<NbaTimingPolicy["triggerType"], string> = {
  event: "Theo sự kiện",
  relative: "Sau một khoảng thời gian",
  deadline: "Trước hạn",
  schedule: "Theo lịch",
};

function timingLabel(policy: NbaTimingPolicy): string {
  if (policy.triggerType === "event") return policy.triggerEvent || "Chưa có sự kiện";
  if (policy.triggerType === "deadline") return `${policy.deadlineOffset} đơn vị trước hạn`;
  if (policy.triggerType === "schedule") return policy.recurrenceType === "none" ? "Theo lịch" : `Lặp ${policy.recurrenceInterval} lần`;
  return `Sau ${policy.delayValue} ${policy.delayUnit}`;
}

function recurrenceLabel(policy: NbaTimingPolicy): string {
  if (policy.recurrenceType === "none") return "Không lặp";
  return `${policy.recurrenceInterval} · ${policy.recurrenceType === "daily" ? "ngày" : policy.recurrenceType === "weekly" ? "tuần" : "tháng"}`;
}

export default function TimingPoliciesTable({ canEdit }: TimingPoliciesTableProps) {
  const [search, setSearch] = useState("");
  const [triggerType, setTriggerType] = useState("all");
  const [selected, setSelected] = useState<NbaTimingPolicy | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const query = useNbaTimingPoliciesQuery({ pageLength: 100 });
  const policies = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (query.data?.policies ?? []).filter((policy) => {
      const matchesSearch = !needle || [policy.policyKey, policy.triggerEvent ?? "", timingLabel(policy)].some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (triggerType === "all" || policy.triggerType === triggerType);
    });
  }, [query.data?.policies, search, triggerType]);

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-labelledby="timing-policies-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4">
          <div>
            <h2 id="timing-policies-heading" className="text-base font-semibold text-text-primary">Chính sách thời gian</h2>
            <p className="mt-1 text-sm text-text-secondary">Đặt thời điểm, hạn xử lý và lịch lặp cho đề xuất tuyển sinh.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">{query.isFetching ? "Đang tải…" : `${policies.length} chính sách`}</span>
            {canEdit && <Button size="sm" onPress={() => { setSelected(null); setIsCreateOpen(true); }}><Plus size={16} aria-hidden="true" />Tạo chính sách</Button>}
          </div>
        </div>

        <AdminTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchLabel="Tìm chính sách thời gian"
          searchPlaceholder="Tìm theo mã hoặc sự kiện"
          filters={[{ label: "Lọc theo loại kích hoạt", value: triggerType, options: triggerOptions, onChange: setTriggerType }]}
        />

        {query.error ? (
          <div className="px-5 py-10 text-center" role="alert">
            <p className="text-sm font-medium text-alert-danger-title">Không tải được chính sách thời gian.</p>
            <p className="mt-1 text-sm text-alert-danger-description">{query.error.message}</p>
            <Button size="sm" appearance="outline" className="mt-4" onPress={() => void query.refetch()}>Thử lại</Button>
          </div>
        ) : query.isPending ? (
          <p className="px-5 py-12 text-center text-sm text-text-tertiary">Đang tải chính sách thời gian…</p>
        ) : (
          <TableRoot fullBleed className="border-0">
            <TableHeader className="bg-background-gray-secondary">
              <TableRow>
                <TableHead>Chính sách</TableHead>
                <TableHead>Kích hoạt</TableHead>
                <TableHead>Thời điểm áp dụng</TableHead>
                <TableHead>Khung giờ</TableHead>
                <TableHead>Lặp lại</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.name} className="hover:bg-background-gray-secondary_alt">
                  <TableCell className="min-w-52"><span className="font-mono text-[11px] font-semibold tracking-[0.04em] text-primary-500">{policy.policyKey}</span><p className="mt-1 text-sm font-semibold text-text-primary">{policy.triggerType === "event" ? "Theo sự kiện" : "Chính sách thời gian"}</p></TableCell>
                  <TableCell className="min-w-44"><p className="text-sm font-medium text-text-primary">{triggerLabels[policy.triggerType]}</p><p className="mt-1 text-xs text-text-tertiary">{policy.triggerEvent || "Không gắn sự kiện"}</p></TableCell>
                  <TableCell className="min-w-48 text-sm text-text-secondary">{timingLabel(policy)}</TableCell>
                  <TableCell className="text-sm text-text-secondary">{policy.timeSlot ?? (policy.allowedStartTime && policy.allowedEndTime ? `${policy.allowedStartTime}–${policy.allowedEndTime}` : "Không cố định")}</TableCell>
                  <TableCell className="text-sm text-text-secondary">{recurrenceLabel(policy)}</TableCell>
                  <TableCell className="text-sm text-text-secondary">{policy.modified ?? "—"}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="primary" appearance="outline" onPress={() => { setIsCreateOpen(false); setSelected(policy); }} aria-label={`${canEdit ? "Chỉnh sửa" : "Xem"} ${policy.policyKey}`} className="min-w-20">{canEdit ? <Pencil1 size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{canEdit ? "Sửa" : "Xem"}</Button></TableCell>
                </TableRow>
              ))}
              {policies.length === 0 && <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-text-tertiary">Không tìm thấy chính sách thời gian phù hợp.</TableCell></TableRow>}
            </TableBody>
          </TableRoot>
        )}
      </section>

      {(selected || isCreateOpen) && <TimingPolicyEditorDialog key={selected?.name ?? "new"} policy={selected} canEdit={canEdit} onClose={() => { setSelected(null); setIsCreateOpen(false); }} />}
    </>
  );
}
