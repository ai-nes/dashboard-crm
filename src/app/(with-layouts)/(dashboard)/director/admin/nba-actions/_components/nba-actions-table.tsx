"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { ActionTimeSlot, NbaAction, NbaActionType } from "@/services/api/nba-actions";

import NbaActionConfigDialog from "./nba-action-config-dialog";
import NbaActionsToolbar from "./nba-actions-toolbar";
import {
  ACTION_TIME_SLOT_LABELS,
  ACTION_TIME_SLOTS,
  getActionPurpose,
  getActionTimeWindowLabel,
  NBA_ACTION_PAGE_SIZE,
  type ChannelFilter,
  type EnabledFilter,
} from "./types";

interface NbaActionsTableProps {
  actions: NbaAction[];
  selectedActionName: string | null;
  isCreateOpen: boolean;
  onSelectAction: (name: string | null) => void;
  onCreateAction: () => void;
  onCloseCreate: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  actionType: string;
  onActionTypeChange: (value: string) => void;
  channel: ChannelFilter;
  onChannelChange: (value: ChannelFilter) => void;
  enabled: EnabledFilter;
  onEnabledChange: (value: EnabledFilter) => void;
  actionTypes: NbaActionType[];
  total: number;
  resultCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isFetching: boolean;
  onReset: () => void;
  availableTimeSlots: ActionTimeSlot[];
  canEdit: boolean;
  isTimeSlotsReady: boolean;
  timeSlotsError: boolean;
}

export default function NbaActionsTable({
  actions,
  selectedActionName,
  isCreateOpen,
  onSelectAction,
  onCreateAction,
  onCloseCreate,
  search,
  onSearchChange,
  actionType,
  onActionTypeChange,
  channel,
  onChannelChange,
  enabled,
  onEnabledChange,
  actionTypes,
  total,
  resultCount,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  isFetching,
  onReset,
  availableTimeSlots,
  canEdit,
  isTimeSlotsReady,
  timeSlotsError,
}: NbaActionsTableProps) {
  const selectedAction = actions.find((action) => action.name === selectedActionName) ?? null;

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-label="Danh sách hành động NBA">
      <NbaActionsToolbar
        search={search}
        onSearchChange={onSearchChange}
        actionType={actionType}
        onActionTypeChange={onActionTypeChange}
        channel={channel}
        onChannelChange={onChannelChange}
        enabled={enabled}
        onEnabledChange={onEnabledChange}
        actionTypes={actionTypes}
        total={total}
        resultCount={resultCount}
        isFetching={isFetching}
        onReset={onReset}
        canEdit={canEdit}
        onCreateAction={onCreateAction}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : actions.length > 0 ? (
        <TableRoot className="w-full min-w-[60rem] rounded-none border-none">
          <TableHeader>
            <TableRow className="bg-background-gray-secondary_alt [&>th]:px-5 [&>th]:py-3">
              <TableHead>Hành động</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead>Kênh</TableHead>
              <TableHead>Thời gian gợi ý</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => {
              const isSelected = action.name === selectedActionName;

              return (
                <ActionTableRows
                  key={action.name}
                  action={action}
                  isSelected={isSelected}
                  canEdit={canEdit}
                  onSelectAction={onSelectAction}
                />
              );
            })}
          </TableBody>
        </TableRoot>
      ) : (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-semibold text-text-primary">Không tìm thấy hành động phù hợp</p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Thử một từ khóa khác hoặc xóa bộ lọc để xem lại danh sách.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-card-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-tertiary">
          {actions.length > 0
            ? `Hiển thị ${(currentPage - 1) * NBA_ACTION_PAGE_SIZE + 1} đến ${(currentPage - 1) * NBA_ACTION_PAGE_SIZE + actions.length} trong ${total}`
            : "Không có hành động nào để hiển thị"}
        </p>
        <div className="sm:w-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isDisabled={isLoading || isFetching || actions.length === 0}
            variant="compact"
            sideLayout="icon"
          />
        </div>
      </div>
      </section>

      {(selectedAction || isCreateOpen) && (
        <NbaActionConfigDialog
          action={selectedAction}
          actionTypes={actionTypes}
          availableTimeSlots={availableTimeSlots}
          canEdit={canEdit}
          isTimeSlotsReady={isTimeSlotsReady}
          timeSlotsError={timeSlotsError}
          onClose={() => { onSelectAction(null); onCloseCreate(); }}
        />
      )}
    </>
  );
}

function ActionTableRows({
  action,
  isSelected,
  canEdit,
  onSelectAction,
}: {
  action: NbaAction;
  isSelected: boolean;
  canEdit: boolean;
  onSelectAction: (name: string) => void;
}) {
  return (
    <>
      <TableRow
        aria-selected={isSelected}
        className={isSelected ? "bg-badge-primary-background" : "transition-colors hover:bg-background-gray-primary"}
      >
        <TableCell className="min-w-64">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-semibold tracking-[0.04em] text-primary-500">
              {action.code}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-text-primary">
              {action.displayName}
            </p>
            <p className="mt-1 max-w-80 truncate text-xs text-text-tertiary" title={getActionPurpose(action)}>
              {getActionPurpose(action)}
            </p>
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm text-text-secondary">
          {action.actionType ?? "Chưa phân loại"}
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm text-text-secondary">
          {action.defaultChannel ?? "Chưa thiết lập"}
        </TableCell>
        <TableCell className="min-w-52">
          <TimeWindowCell action={action} />
        </TableCell>
        <TableCell>
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-text-secondary">
            <span
              className={action.enabled ? "size-1.5 rounded-full bg-success-500" : "size-1.5 rounded-full bg-text-tertiary"}
              aria-hidden="true"
            />
            {action.enabled ? "Đang bật" : "Đang tắt"}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <Button
            type="button"
            size="xs"
            variant="primary"
            appearance={isSelected ? "fill" : "outline"}
            onPress={() => onSelectAction(action.name)}
            aria-expanded={isSelected}
            aria-haspopup="dialog"
            aria-label={isSelected ? `Đóng cấu hình ${action.displayName}` : `${canEdit ? "Chỉnh sửa" : "Xem"} ${action.displayName}`}
            className="min-w-20"
          >
            {isSelected ? "Đóng" : canEdit ? "Sửa" : "Xem"}
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}

function TimeWindowCell({ action }: { action: NbaAction }) {
  const isUnlimited = action.allowedTimeSlots.length === 0;
  const label = getActionTimeWindowLabel(action);
  const summary = isUnlimited
    ? "Không giới hạn giờ"
    : `${action.allowedTimeSlots.length}/${ACTION_TIME_SLOTS.length} khung giờ`;
  const detail = isUnlimited ? "Cả ngày · 00:00–24:00" : label;

  return (
    <div className="min-w-0" title={detail}>
      <div
        className="flex gap-1"
        role="img"
        aria-label={`${summary}. ${detail}`}
      >
        {ACTION_TIME_SLOTS.map((slot) => (
          <span
            key={slot}
            title={ACTION_TIME_SLOT_LABELS[slot]}
            className={
              isUnlimited || action.allowedTimeSlots.includes(slot)
                ? "h-2 w-7 rounded-sm bg-primary-500"
                : "h-2 w-7 rounded-sm bg-border-secondary"
            }
          />
        ))}
      </div>
      <p className="mt-1 text-xs font-medium text-text-primary">{summary}</p>
      <p className="max-w-56 truncate text-[11px] text-text-tertiary">{detail}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <TableRoot className="w-full min-w-[60rem] rounded-none border-none" aria-label="Đang tải danh sách hành động">
      <TableHeader>
        <TableRow className="bg-background-gray-secondary_alt [&>th]:px-5 [&>th]:py-3">
          {Array.from({ length: 6 }, (_, index) => (
            <TableHead key={index}>
              <Skeleton className="h-3 w-20" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: NBA_ACTION_PAGE_SIZE }, (_, index) => (
          <TableRow key={index}>
            {Array.from({ length: 6 }, (_, cellIndex) => (
              <TableCell key={cellIndex} className="h-20">
                <Skeleton className={cellIndex === 0 ? "h-4 w-48" : "h-4 w-24"} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableRoot>
  );
}
