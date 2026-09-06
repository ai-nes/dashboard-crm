"use client";

import {
  BarChart2,
  Check,
  Funnel1,
  Layout6,
} from "@tailgrids/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import type { TaskLayout, TaskStatusFilter, TaskView } from "./types";

interface TaskManagementToolbarProps {
  view: TaskView;
  onViewChange: (value: TaskView) => void;
  statusFilter: TaskStatusFilter;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  layout: TaskLayout;
  onLayoutChange: (value: TaskLayout) => void;
  resultCount: number;
  totalCount: number;
}

const filters: { id: TaskView; label: string }[] = [
  { id: "all", label: "Tất cả task" },
  { id: "today", label: "Hôm nay" },
  { id: "overdue", label: "Quá hạn" },
  { id: "upcoming", label: "Sắp tới" },
];

const statusFilters: { id: TaskStatusFilter; label: string }[] = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "todo", label: "Cần làm" },
  { id: "in-progress", label: "Đang xử lý" },
  { id: "done", label: "Hoàn thành" },
  { id: "canceled", label: "Đã hủy" },
];

const toolbarActionClass =
  "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-text-secondary transition hover:bg-background-gray-secondary_alt hover:text-text-primary";

export default function TaskManagementToolbar({
  view,
  onViewChange,
  statusFilter,
  onStatusFilterChange,
  layout,
  onLayoutChange,
  resultCount,
  totalCount,
}: TaskManagementToolbarProps) {
  const activeFilter = filters.find((item) => item.id === view);
  const hasActiveFilter =
    (activeFilter && activeFilter.id !== "all") || statusFilter !== "all";

  return (
    <div className="border-b border-card-border bg-card-background/80 px-4 py-2.5 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Kiểu hiển thị task"
          role="tablist"
          className="flex items-center gap-1"
        >
          <span className="mr-2 text-sm font-semibold text-text-secondary">
            Task
          </span>
          <button
            type="button"
            role="tab"
            aria-selected={layout === "kanban"}
            aria-label="Hiển thị dạng Kanban"
            onClick={() => onLayoutChange("kanban")}
            className={
              layout === "kanban"
                ? "relative inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-primary-500 after:absolute after:right-2.5 after:bottom-[-11px] after:left-2.5 after:h-0.5 after:rounded-full after:bg-primary-500"
                : "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-text-secondary transition hover:bg-background-gray-secondary_alt hover:text-text-primary"
            }
          >
            <BarChart2 size={15} aria-hidden="true" />
            Kanban
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={layout === "table"}
            aria-label="Hiển thị dạng Table"
            onClick={() => onLayoutChange("table")}
            className={
              layout === "table"
                ? "relative inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-primary-500 after:absolute after:right-2.5 after:bottom-[-11px] after:left-2.5 after:h-0.5 after:rounded-full after:bg-primary-500"
                : "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-text-secondary transition hover:bg-background-gray-secondary_alt hover:text-text-primary"
            }
          >
            <Layout6 size={15} aria-hidden="true" />
            Table
          </button>
          <span className="ml-2 border-l border-card-border pl-3 text-xs text-text-tertiary">
            {resultCount !== totalCount
              ? `${resultCount}/${totalCount} task`
              : `${totalCount} task`}
          </span>
        </nav>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Lọc task"
              className={toolbarActionClass}
            >
              <Funnel1 size={16} aria-hidden="true" />
              Filter
              {hasActiveFilter && (
                <span
                  className="size-1.5 rounded-full bg-primary-500"
                  aria-hidden="true"
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              placement="bottom start"
              style={{ zIndex: 50 }}
              className="w-48 p-1"
            >
              <DropdownMenuHeader className="px-2.5 py-1.5 text-[11px] font-semibold text-text-tertiary">
                Khoảng thời gian
              </DropdownMenuHeader>
              <DropdownMenuSection className="p-1">
                {filters.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onAction={() => onViewChange(item.id)}
                    className="justify-between px-2.5 py-1.5 text-xs"
                  >
                    {item.label}
                    {view === item.id && <Check size={14} aria-hidden="true" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSection>
              <DropdownMenuHeader className="px-2.5 py-1.5 text-[11px] font-semibold text-text-tertiary">
                Trạng thái
              </DropdownMenuHeader>
              <DropdownMenuSection className="p-1">
                {statusFilters.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onAction={() => onStatusFilterChange(item.id)}
                    className="justify-between px-2.5 py-1.5 text-xs"
                  >
                    {item.label}
                    {statusFilter === item.id && (
                      <Check size={14} aria-hidden="true" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSection>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </div>
  );
}
