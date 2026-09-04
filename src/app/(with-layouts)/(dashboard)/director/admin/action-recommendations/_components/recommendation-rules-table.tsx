"use client";

import { Eye, Pencil1, Plus } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@/components/tailgrids/core/table";
import { useNbaActionsQuery } from "@/hooks/use-nba-actions-queries";
import { useNbaRulesQuery } from "@/hooks/use-nba-admin-queries";
import type { NbaRecommendationRule } from "@/services/api/nba-admin";

import AdminTableToolbar from "./admin-table-toolbar";
import RuleEditorDialog from "./rule-editor-dialog";
import { PriorityBadge, RuleStatusBadge } from "./status-badges";
import type { SelectOption } from "./types";

interface RecommendationRulesTableProps {
  canEdit: boolean;
}

const statusOptions: SelectOption[] = [
  { id: "all", label: "Mọi trạng thái" },
  { id: "published", label: "Đã phát hành" },
  { id: "draft", label: "Bản nháp" },
  { id: "archived", label: "Đã lưu trữ" },
];

const priorityOptions: SelectOption[] = [
  { id: "all", label: "Mọi mức ưu tiên" },
  { id: "high", label: "Cao" },
  { id: "medium", label: "Trung bình" },
  { id: "low", label: "Thấp" },
];

export default function RecommendationRulesTable({ canEdit }: RecommendationRulesTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [selected, setSelected] = useState<NbaRecommendationRule | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const query = useNbaRulesQuery({ status: status === "all" ? undefined : status as NbaRecommendationRule["status"], search: search.trim() || undefined, pageLength: 100 });
  const actionsQuery = useNbaActionsQuery({ pageLength: 100 });
  const actionLabels = useMemo(() => new Map((actionsQuery.data?.actions ?? []).map((action) => [action.code, action.displayName])), [actionsQuery.data?.actions]);
  const rules = useMemo(() => (query.data?.rules ?? []).filter((rule) => priority === "all" || rule.priority === priority), [priority, query.data?.rules]);

  const openRule = (rule: NbaRecommendationRule | null) => {
    setSelected(rule);
    setIsCreateOpen(rule === null);
  };

  const closeRule = () => {
    setSelected(null);
    setIsCreateOpen(false);
  };

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-labelledby="recommendation-rules-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4">
          <div><h2 id="recommendation-rules-heading" className="text-base font-semibold text-text-primary">Quy tắc đề xuất</h2><p className="mt-1 max-w-2xl text-sm text-text-secondary">Xác định khi nào hệ thống nên gợi ý một việc phù hợp cho hồ sơ.</p></div>
          <div className="flex items-center gap-3"><span className="text-xs text-text-tertiary">{query.isFetching ? "Đang tải…" : `${rules.length} quy tắc`}</span>{canEdit && <Button size="sm" onPress={() => openRule(null)}><Plus size={16} aria-hidden="true" />Tạo quy tắc</Button>}</div>
        </div>
        <div className="flex items-start gap-2 border-y border-card-border bg-background-gray-secondary_alt px-4 py-3 text-xs leading-5 text-text-secondary"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />Quy tắc đã phát hành sẽ chuyển về bản nháp và tắt khi được chỉnh sửa.</div>
        <AdminTableToolbar search={search} onSearchChange={setSearch} searchLabel="Tìm quy tắc đề xuất" searchPlaceholder="Tìm theo mã, tên hoặc mô tả" filters={[{ label: "Lọc theo trạng thái quy tắc", value: status, options: statusOptions, onChange: setStatus }, { label: "Lọc theo mức ưu tiên", value: priority, options: priorityOptions, onChange: setPriority }]} />

        {query.error ? <div className="px-5 py-10 text-center" role="alert"><p className="text-sm font-medium text-alert-danger-title">Không tải được quy tắc đề xuất.</p><p className="mt-1 text-sm text-alert-danger-description">{query.error.message}</p><Button size="sm" appearance="outline" className="mt-4" onPress={() => void query.refetch()}>Thử lại</Button></div> : query.isPending ? <p className="px-5 py-12 text-center text-sm text-text-tertiary">Đang tải quy tắc đề xuất…</p> : <TableRoot fullBleed className="border-0"><TableHeader className="bg-background-gray-secondary"><TableRow><TableHead>Quy tắc</TableHead><TableHead>Hành động</TableHead><TableHead>Kích hoạt</TableHead><TableHead>Điều kiện</TableHead><TableHead>Ưu tiên</TableHead><TableHead>Thời gian</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{rules.map((rule) => <TableRow key={rule.name} className="hover:bg-background-gray-secondary_alt"><TableCell className="min-w-64"><span className="font-mono text-[11px] font-semibold tracking-[0.04em] text-primary-500">{rule.ruleKey}</span><p className="mt-1 font-semibold text-text-primary">{rule.displayName}</p><p className="mt-1 max-w-sm truncate text-xs leading-5 text-text-secondary">{rule.description || "Chưa có mô tả"}</p></TableCell><TableCell className="min-w-40"><p className="text-sm font-medium text-text-primary">{actionLabels.get(rule.actionCode) ?? rule.actionCode}</p><p className="mt-1 font-mono text-[11px] text-text-tertiary">{rule.actionCode || "Chưa chọn"}</p></TableCell><TableCell className="min-w-40"><p className="text-sm text-text-secondary">{rule.triggerType}</p><p className="mt-1 text-xs text-text-tertiary">{rule.triggerEvent || "Không gắn sự kiện"}</p></TableCell><TableCell className="whitespace-nowrap text-sm text-text-secondary">{rule.conditions.all.length + rule.conditions.any.length} điều kiện</TableCell><TableCell><PriorityBadge priority={rule.priority} /></TableCell><TableCell className="min-w-36"><p className="text-sm text-text-secondary">{rule.timingPolicy || "Không đặt"}</p><p className="mt-1 text-xs text-text-tertiary">Tối đa {rule.maxOccurrences} lần</p></TableCell><TableCell><div className="flex flex-col items-start gap-1"><RuleStatusBadge status={rule.status} /><span className="text-[11px] text-text-tertiary">v{rule.version}{rule.enabled ? " · Đang dùng" : " · Tạm dừng"}</span></div></TableCell><TableCell className="text-right"><Button size="sm" variant="primary" appearance="outline" onPress={() => openRule(rule)} aria-label={`${canEdit ? "Chỉnh sửa" : "Xem"} quy tắc ${rule.displayName}`} className="min-w-20">{canEdit ? <Pencil1 size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{canEdit ? "Sửa" : "Xem"}</Button></TableCell></TableRow>)}{rules.length === 0 && <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-text-tertiary">Không tìm thấy quy tắc đề xuất phù hợp.</TableCell></TableRow>}</TableBody></TableRoot>}
      </section>

      {(selected || isCreateOpen) && <RuleEditorDialog key={selected?.name ?? "new"} rule={selected} canEdit={canEdit} onClose={closeRule} />}
    </>
  );
}
