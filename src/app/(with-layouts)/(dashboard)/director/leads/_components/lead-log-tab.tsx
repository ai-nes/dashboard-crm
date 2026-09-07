"use client";

import { ChevronDown, ChevronRight } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
} from "../../students/_components/student-activity-toolbar";
import {
  activityTimeFilterOptions,
  groupActivitiesByDate,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "../../students/_components/student-activity-utils";
import type { LeadLogEntry } from "./types";

export default function LeadLogTab({ entries: allEntries }: { entries: LeadLogEntry[] }) {
  const entries = useMemo(
    () => allEntries.filter((entry) => entry.type === "activity"),
    [allEntries],
  );
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] = useState<ActivityExpansionMode>("collapse");

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries
      .filter((entry) => {
        const matchesTime = matchesActivityTimeFilter(entry.date, timeFilter);
        const matchesSearch =
          !query ||
          entry.content.toLowerCase().includes(query) ||
          entry.author.toLowerCase().includes(query) ||
          entry.title.toLowerCase().includes(query);
        return matchesTime && matchesSearch;
      })
      .sort(
        (first, second) =>
          parseStudentActivityDate(second.date).getTime() -
          parseStudentActivityDate(first.date).getTime(),
      );
  }, [entries, search, timeFilter]);

  const groupedEntries = useMemo(
    () => groupActivitiesByDate(filteredEntries, (entry) => parseStudentActivityDate(entry.date)),
    [filteredEntries],
  );

  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(
    () => new Set(groupedEntries.map((group) => group.id)),
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedGroupIds(new Set(mode === "expand" ? groupedEntries.map((group) => group.id) : []));
  };

  const handleGroupExpandedChange = (groupId: string, expanded: boolean) => {
    setExpandedGroupIds((current) => {
      const next = new Set(current);
      if (expanded) next.add(groupId);
      else next.delete(groupId);
      return next;
    });
  };

  const hasActiveFilters = search.trim() !== "" || timeFilter !== "all";
  const resetFilters = () => {
    setSearch("");
    setTimeFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <StudentActivityToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo người thực hiện, nội dung..."
          searchLabel="Tìm kiếm nhật ký"
          expansionMode={expansionMode}
          onExpansionModeChange={handleExpansionModeChange}
        />
        <div className="min-w-36">
          <ActivityFilterSelect
            ariaLabel="Lọc theo thời gian"
            triggerLabel="Tất cả thời gian"
            value={timeFilter}
            options={activityTimeFilterOptions}
            onChange={(value) => setTimeFilter(value as ActivityTimeFilter)}
          />
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có bản ghi nhật ký nào.</p>
      ) : filteredEntries.length === 0 ? (
        <div className="space-y-3 py-2">
          <p className="text-xs text-text-tertiary">Không tìm thấy nhật ký phù hợp với bộ lọc.</p>
          {hasActiveFilters && (
            <Button size="sm" variant="primary" appearance="outline" onPress={resetFilters}>
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEntries.map((group) => {
            const expanded = expandedGroupIds.has(group.id);
            const latestEntry = group.items[0];

            return (
              <section key={group.id} aria-labelledby={`lead-log-group-${group.id}-heading`}>
                <div className="flex flex-col gap-2 border-b border-card-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => handleGroupExpandedChange(group.id, !expanded)}
                    aria-expanded={expanded}
                    aria-labelledby={`lead-log-group-${group.id}-heading`}
                    className="flex min-w-0 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <span className="shrink-0 text-text-tertiary" aria-hidden="true">
                      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span id={`lead-log-group-${group.id}-heading`} className="truncate text-base font-semibold text-text-primary">
                      {group.label}
                    </span>
                    <Badge color="sky">{group.items.length} bản ghi</Badge>
                  </button>
                  <time className="pl-9 text-sm text-text-tertiary sm:pl-0">{formatDateTime(latestEntry.date)}</time>
                </div>

                {expanded ? (
                  <ol className="relative mt-5 ml-3 space-y-7 border-l border-card-border pl-6">
                    {group.items.map((entry) => (
                      <LeadLogItem key={entry.id} entry={entry} />
                    ))}
                  </ol>
                ) : (
                  <div className="mt-3 pl-9">
                    <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
                      {latestEntry.author} {latestEntry.title.toLowerCase()}
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeadLogItem({ entry }: { entry: LeadLogEntry }) {
  const isSystem = entry.author === "Hệ thống";
  const role = isSystem ? "Hệ thống" : "Tư vấn viên";
  const dotColorClass = isSystem ? "bg-badge-sky-text" : "bg-success-500";

  return (
    <li className="relative">
      <span
        className="absolute -left-[2.05rem] top-0 flex size-7 items-center justify-center rounded-full border-2 border-card-background bg-card-background shadow-sm"
        aria-hidden="true"
      >
        <span className={`size-2.5 rounded-full ${dotColorClass}`} />
      </span>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {entry.author}
            <span className="ml-2 font-normal text-text-tertiary">{role}</span>
          </p>
        </div>
        <time className="shrink-0 text-xs text-text-tertiary" dateTime={entry.date}>
          {formatDateTime(entry.date)}
        </time>
      </div>

      <div className="mt-3 w-fit max-w-2xl rounded-2xl rounded-bl-md bg-background-gray-secondary px-4 py-3">
        <p className="text-sm leading-6 text-text-primary">{entry.content}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        <Badge color={isSystem ? "sky" : "success"} size="sm">
          {entry.title}
        </Badge>
      </div>
    </li>
  );
}
