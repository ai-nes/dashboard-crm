"use client";

import {
  BarChart2,
  Check,
  ChevronDown,
  Layout6,
  Search1,
} from "@tailgrids/icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { taskStatusLabel } from "../../students/_components/student-task-badges";
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
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

const filters: { id: TaskView; label: string }[] = [
  { id: "all", label: "Tất cả task" },
  { id: "today", label: "Hôm nay" },
  { id: "overdue", label: "Quá hạn" },
  { id: "upcoming", label: "Sắp tới" },
];

const statusFilters: { id: TaskStatusFilter; label: string }[] = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "todo", label: taskStatusLabel.todo },
  { id: "in-progress", label: taskStatusLabel["in-progress"] },
  { id: "done", label: taskStatusLabel.done },
  { id: "canceled", label: taskStatusLabel.canceled },
];

const toolbarActionClass =
  "inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-text-secondary transition hover:bg-background-gray-secondary_alt hover:text-text-primary";

export default function TaskManagementToolbar({
  view,
  onViewChange,
  statusFilter,
  onStatusFilterChange,
  layout,
  onLayoutChange,
  resultCount,
  totalCount,
  searchQuery,
  onSearchQueryChange,
}: TaskManagementToolbarProps) {
  const activeFilter = filters.find((item) => item.id === view);

  return (
    <div className="shrink-0 bg-transparent px-0 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <nav
          aria-label="Kiểu hiển thị task"
          role="tablist"
          className="flex items-center gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={layout === "kanban"}
            aria-label="Hiển thị dạng Kanban"
            onClick={() => onLayoutChange("kanban")}
            className={
              layout === "kanban"
                ? "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-primary-500"
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
                ? "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-primary-500"
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
      </div>

      {layout === "table" && (
        <div className="mt-2 flex w-full flex-wrap items-center justify-start gap-2">
          <InputGroup className="h-10 w-full sm:w-[360px]">
            <InputGroupAddon className="pr-0 text-text-tertiary">
              <Search1 size={16} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              className="py-2"
              aria-label="Tìm task"
              placeholder="Tìm theo tên task, học sinh hoặc người phụ trách"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />
          </InputGroup>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Lọc theo khoảng thời gian: ${activeFilter?.label ?? "Tất cả task"}`}
              className={`${toolbarActionClass} w-full justify-between border border-card-border sm:w-44 sm:min-w-44`}
            >
              <span className="min-w-0 truncate">{activeFilter?.label}</span>
              <ChevronDown size={14} aria-hidden="true" />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {layout === "table" && (
        <nav
          aria-label="Lọc theo trạng thái task"
          role="tablist"
          className="mt-2 flex min-w-0 gap-1 overflow-x-auto pt-2"
        >
          {statusFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === item.id}
              onClick={() => onStatusFilterChange(item.id)}
              className={
                statusFilter === item.id
                  ? "shrink-0 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-500"
                  : "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-background-gray-secondary_alt hover:text-text-primary"
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
