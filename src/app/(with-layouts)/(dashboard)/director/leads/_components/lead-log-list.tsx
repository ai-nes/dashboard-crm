"use client";

import { useMemo, useState } from "react";

import { formatDateTime } from "@/utils/format-date";

import StudentActivityCard from "../../students/_components/student-activity-card";
import StudentActivityGroup from "../../students/_components/student-activity-group";
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

interface LeadLogListProps {
  entries: LeadLogEntry[];
  groupIdPrefix: string;
  searchLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
}

export default function LeadLogList({
  entries,
  groupIdPrefix,
  searchLabel,
  searchPlaceholder,
  emptyMessage,
}: LeadLogListProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] = useState<ActivityExpansionMode>("collapse");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(entries.map((entry) => entry.id)),
  );

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesTime = matchesActivityTimeFilter(entry.date, timeFilter);
      const matchesSearch =
        !query ||
        entry.content.toLowerCase().includes(query) ||
        entry.author.toLowerCase().includes(query) ||
        entry.title.toLowerCase().includes(query);
      return matchesTime && matchesSearch;
    });
  }, [entries, search, timeFilter]);

  const groupedEntries = useMemo(
    () =>
      groupActivitiesByDate(filteredEntries, (entry) =>
        parseStudentActivityDate(entry.date),
      ),
    [filteredEntries],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedIds(new Set(mode === "expand" ? entries.map((entry) => entry.id) : []));
  };

  const handleEntryExpandedChange = (id: string, expanded: boolean) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <StudentActivityToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        searchLabel={searchLabel}
        expansionMode={expansionMode}
        onExpansionModeChange={handleExpansionModeChange}
      />

      <div className="w-full max-w-md">
        <ActivityFilterSelect
          ariaLabel="Lọc theo thời gian"
          triggerLabel="Tất cả thời gian"
          value={timeFilter}
          options={activityTimeFilterOptions}
          onChange={(value) => setTimeFilter(value as ActivityTimeFilter)}
        />
      </div>

      {filteredEntries.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">{emptyMessage}</p>
      ) : (
        <div className="space-y-6">
          {groupedEntries.map((group) => (
            <StudentActivityGroup key={group.id} id={`${groupIdPrefix}-${group.id}`} label={group.label} count={group.items.length}>
              {group.items.map((entry) => (
                <StudentActivityCard
                  key={entry.id}
                  title={
                    <>
                      <strong className="font-semibold text-text-primary">{entry.title}</strong> · {entry.author}
                    </>
                  }
                  timestamp={formatDateTime(entry.date)}
                  expanded={expandedIds.has(entry.id)}
                  onExpandedChange={(expanded) => handleEntryExpandedChange(entry.id, expanded)}
                >
                  <p className="text-sm leading-6 text-text-secondary">{entry.content}</p>
                </StudentActivityCard>
              ))}
            </StudentActivityGroup>
          ))}
        </div>
      )}
    </div>
  );
}
