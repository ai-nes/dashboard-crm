"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { NbaAction } from "@/services/api/nba-actions";

import NbaActionsToolbar from "./nba-actions-toolbar";
import { getActionPurpose, getActionTimeWindowLabel, type EnabledFilter } from "./types";
import type { NbaActionType } from "@/services/api/nba-actions";

interface NbaActionListPanelProps {
  actions: NbaAction[];
  selectedActionName: string | null;
  onSelectAction: (name: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  actionType: string;
  onActionTypeChange: (value: string) => void;
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
}

export default function NbaActionListPanel({
  actions,
  selectedActionName,
  onSelectAction,
  search,
  onSearchChange,
  actionType,
  onActionTypeChange,
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
}: NbaActionListPanelProps) {
  return (
    <Card className="min-w-0 p-0 xl:sticky xl:top-4">
      <NbaActionsToolbar
        search={search}
        onSearchChange={onSearchChange}
        actionType={actionType}
        onActionTypeChange={onActionTypeChange}
        enabled={enabled}
        onEnabledChange={onEnabledChange}
        actionTypes={actionTypes}
        total={total}
        resultCount={resultCount}
        isFetching={isFetching}
        onReset={onReset}
      />

      <div className="max-h-[38rem] overflow-y-auto p-2 [scrollbar-width:thin]">
        {isLoading ? (
          <ActionListSkeleton />
        ) : actions.length > 0 ? (
          <ul aria-label="Danh sách Action NBA" className="space-y-1">
            {actions.map((action) => (
              <ActionListItem
                key={action.name}
                action={action}
                isSelected={action.name === selectedActionName}
                onSelect={() => onSelectAction(action.name)}
              />
            ))}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-text-primary">
              Không tìm thấy Action phù hợp
            </p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Thử đổi từ khóa hoặc xóa bộ lọc để xem lại danh mục.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-card-border px-4 py-4 lg:px-5">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isDisabled={isLoading || isFetching || actions.length === 0}
          variant="compact"
          sideLayout="icon"
        />
      </div>
    </Card>
  );
}

function ActionListItem({
  action,
  isSelected,
  onSelect,
}: {
  action: NbaAction;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={isSelected ? "true" : undefined}
        onClick={onSelect}
        className={
          isSelected
            ? "w-full rounded-lg border border-primary-500/60 bg-badge-primary-background px-3 py-3 text-left outline-none ring-2 ring-primary-500/10"
            : "w-full rounded-lg border border-transparent px-3 py-3 text-left outline-none transition hover:border-card-border hover:bg-background-gray-primary focus-visible:border-primary-500/60 focus-visible:ring-2 focus-visible:ring-primary-500/20"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {action.code}
            </p>
            <p className="mt-1 truncate text-sm text-text-secondary">
              {action.displayName}
            </p>
          </div>
          <Badge color={isSelected ? "primary" : "gray"} className="shrink-0">
            {action.actionType ?? "Chưa phân loại"}
          </Badge>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-text-tertiary">
            {getActionTimeWindowLabel(action)}
          </span>
          <span
            className={
              action.enabled ? "shrink-0 text-success-500" : "shrink-0 text-text-tertiary"
            }
          >
            {action.enabled ? "Đang bật" : "Đang tắt"}
          </span>
        </div>
        <span className="sr-only">{getActionPurpose(action)}</span>
      </button>
    </li>
  );
}

function ActionListSkeleton() {
  return (
    <div className="space-y-2" aria-label="Đang tải danh sách Action">
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className="space-y-2 rounded-lg border border-card-border px-3 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
