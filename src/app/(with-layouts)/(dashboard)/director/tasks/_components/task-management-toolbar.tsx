"use client";

import { Search1 } from "@tailgrids/icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import type { TaskView } from "./types";

interface TaskManagementToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: TaskView;
  onViewChange: (value: TaskView) => void;
  resultCount: number;
  totalCount: number;
}

const views: { id: TaskView; label: string }[] = [
  { id: "all", label: "Tất cả task" },
  { id: "today", label: "Hôm nay" },
  { id: "overdue", label: "Quá hạn" },
  { id: "upcoming", label: "Sắp tới" },
];

export default function TaskManagementToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  resultCount,
  totalCount,
}: TaskManagementToolbarProps) {
  return (
    <div className="overflow-x-auto p-4 lg:p-5">
      <div className="flex min-w-[760px] items-center gap-2">
        <InputGroup className="w-64 shrink-0">
          <InputGroupInput
            aria-label="Tìm task"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm task, học sinh, người phụ trách..."
          />
          <InputGroupAddon align="inline-end">
            <Search1 size={18} aria-hidden="true" />
          </InputGroupAddon>
        </InputGroup>

        <div className="flex shrink-0 items-center gap-3">
          <p className="text-xs text-text-tertiary">
            <span className="font-semibold text-text-primary">
              {resultCount}
            </span>{" "}
            task
            {resultCount !== totalCount && <span> · {totalCount} tổng</span>}
          </p>
        </div>

        <nav
          aria-label="Nhóm task"
          className="ml-auto flex shrink-0 items-center gap-0.5"
        >
          {views.map((item) => {
            const selected = item.id === view;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onViewChange(item.id)}
                className={
                  selected
                    ? "shrink-0 rounded-md bg-background-gray-secondary_alt px-2.5 py-2 text-sm font-semibold text-text-primary"
                    : "shrink-0 rounded-md px-2.5 py-2 text-sm font-medium text-text-secondary transition hover:bg-background-soft-50 hover:text-text-primary"
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
