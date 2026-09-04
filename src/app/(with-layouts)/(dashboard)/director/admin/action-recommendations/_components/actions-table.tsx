"use client";

import { Eye } from "@tailgrids/icons";
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

import AdminTableToolbar from "./admin-table-toolbar";
import { MOCK_ACTIONS, MOCK_ACTION_TYPES } from "./mock-data";
import { ChannelLabel, RecordStatusBadge } from "./status-badges";
import type { MockAction, SelectOption } from "./types";

interface ActionsTableProps {
  onInspect: (action: MockAction) => void;
}

const actionTypeOptions: SelectOption[] = [
  { id: "all", label: "Tất cả nhóm hành động" },
  ...MOCK_ACTION_TYPES.map((item) => ({ id: item.code, label: item.displayName })),
];

const channelOptions: SelectOption[] = [
  { id: "all", label: "Tất cả kênh" },
  { id: "CALL", label: "Cuộc gọi" },
  { id: "EMAIL", label: "Email" },
  { id: "MESSAGE", label: "Tin nhắn" },
  { id: "NONE", label: "Không có kênh" },
];

const enabledOptions: SelectOption[] = [
  { id: "all", label: "Mọi trạng thái" },
  { id: "enabled", label: "Đang dùng" },
  { id: "disabled", label: "Tạm dừng" },
];

export default function ActionsTable({ onInspect }: ActionsTableProps) {
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("all");
  const [channel, setChannel] = useState("all");
  const [enabled, setEnabled] = useState("all");

  const actions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_ACTIONS.filter((item) => {
      const matchesSearch = [item.code, item.displayName, item.description].some((value) => value.toLowerCase().includes(query));
      const matchesType = actionType === "all" || item.actionType === actionType;
      const matchesChannel = channel === "all" || item.channel === channel;
      const matchesEnabled = enabled === "all" || (enabled === "enabled" ? item.enabled : !item.enabled);
      return matchesSearch && matchesType && matchesChannel && matchesEnabled;
    });
  }, [actionType, channel, enabled, search]);

  return (
    <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-labelledby="actions-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4">
        <div>
          <h2 id="actions-heading" className="text-base font-semibold text-text-primary">Danh sách hành động</h2>
          <p className="mt-1 text-sm text-text-secondary">Hành động là việc cụ thể mà đội ngũ tuyển sinh có thể thực hiện.</p>
        </div>
        <span className="text-xs text-text-tertiary">{actions.length}/{MOCK_ACTIONS.length} hành động</span>
      </div>

      <AdminTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Tìm hành động"
        searchPlaceholder="Tìm theo mã hoặc tên hành động"
        filters={[
          { label: "Lọc theo nhóm hành động", value: actionType, options: actionTypeOptions, onChange: setActionType },
          { label: "Lọc theo kênh", value: channel, options: channelOptions, onChange: setChannel },
          { label: "Lọc theo trạng thái", value: enabled, options: enabledOptions, onChange: setEnabled },
        ]}
      />

      <TableRoot fullBleed className="border-0">
        <TableHeader className="bg-background-gray-secondary">
          <TableRow>
            <TableHead>Hành động</TableHead>
            <TableHead>Nhóm</TableHead>
            <TableHead>Kênh / hình thức thực hiện</TableHead>
            <TableHead>Vai trò được phép</TableHead>
            <TableHead>Khung giờ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => (
            <TableRow key={action.code} className="hover:bg-background-gray-secondary_alt">
              <TableCell className="min-w-60">
                <span className="font-mono text-[11px] font-semibold tracking-[0.04em] text-primary-500">{action.code}</span>
                <p className="mt-1 font-semibold text-text-primary">{action.displayName}</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-text-secondary">{action.description}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-text-secondary">{action.actionType}</TableCell>
              <TableCell className="min-w-36">
                <ChannelLabel channel={action.channel} />
                <p className="mt-1 text-xs text-text-tertiary">{action.executionType === "AI_ASSISTED" ? "Có AI hỗ trợ" : "Thực hiện thủ công"}</p>
              </TableCell>
              <TableCell className="min-w-48 text-xs leading-5 text-text-secondary">{action.allowedActors.join(" · ")}</TableCell>
              <TableCell className="min-w-36">
                {action.allowedTimeSlots.length === 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary"><span className="size-1.5 rounded-full bg-primary-500" />Cả ngày</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {action.allowedTimeSlots.map((slot) => <span key={slot} className="rounded-md bg-badge-orange-background px-1.5 py-0.5 text-[11px] font-medium text-badge-orange-text">{slot}</span>)}
                  </div>
                )}
              </TableCell>
              <TableCell><RecordStatusBadge status={action.enabled ? "active" : "inactive"} /></TableCell>
              <TableCell className="text-right">
                <Button size="sm" appearance="ghost" onPress={() => onInspect(action)} aria-label={`Xem cấu hình ${action.displayName}`} className="text-primary-500 hover:bg-badge-primary-background">
                  <Eye size={16} aria-hidden="true" />
                  Xem cấu hình
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {actions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-sm text-text-tertiary">Không tìm thấy hành động phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableRoot>
    </section>
  );
}
