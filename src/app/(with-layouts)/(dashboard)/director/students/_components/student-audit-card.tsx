"use client";

import { ChevronDown, ChevronRight } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { StudentAuditLog } from "@/services/api/student-audit";
import { formatDateTime } from "@/utils/format-date";

import {
  getStudentAuditActor,
  getStudentAuditActivityDescription,
} from "./student-audit-event";
import StudentAuditFilters, {
  type AuditActionFilter,
} from "./student-audit-filters";
import StudentAuditItem from "./student-audit-item";
import {
  groupActivitiesByDate,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "./student-activity-utils";
import type { ActivityExpansionMode } from "./student-activity-toolbar";

interface StudentAuditCardProps {
  events: StudentAuditLog[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function StudentAuditCard({
  events,
  isLoading = false,
  error,
}: StudentAuditCardProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [actionFilter, setActionFilter] = useState<AuditActionFilter>("all");
  const [expansionMode, setExpansionMode] =
    useState<ActivityExpansionMode>("collapse");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchesTime = matchesActivityTimeFilter(
          event.occurredAt,
          timeFilter,
        );

        const matchesAction =
          actionFilter === "all" ||
          (actionFilter === "created" && event.action === "created") ||
          (actionFilter === "updated" && event.action === "updated") ||
          (actionFilter === "deleted" && event.action === "deleted");

        const matchesSearch =
          !query ||
          [
            event.action,
            event.changeType,
            event.fieldLabel,
            event.fieldname,
            event.owner,
            event.ownerFullName,
            event.source,
            event.sourceName,
            getStudentAuditActivityDescription(event),
          ].some((value) => value?.toLowerCase().includes(query));

        return matchesTime && matchesAction && matchesSearch;
      })
      .sort(
        (first, second) =>
          parseStudentActivityDate(second.occurredAt).getTime() -
          parseStudentActivityDate(first.occurredAt).getTime(),
      );
  }, [actionFilter, events, search, timeFilter]);

  const groupedEvents = useMemo(
    () =>
      groupActivitiesByDate(filteredEvents, (event) =>
        parseStudentActivityDate(event.occurredAt),
      ),
    [filteredEvents],
  );

  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(
    () => new Set(groupedEvents.map((g) => g.id)),
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedGroupIds(
      new Set(mode === "expand" ? groupedEvents.map((g) => g.id) : []),
    );
  };

  const handleGroupExpandedChange = (groupId: string, expanded: boolean) => {
    setExpandedGroupIds((current) => {
      const next = new Set(current);
      if (expanded) next.add(groupId);
      else next.delete(groupId);
      return next;
    });
  };

  const hasActiveFilters =
    search.trim() !== "" || timeFilter !== "all" || actionFilter !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setTimeFilter("all");
    setActionFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search Toolbar */}
      <StudentAuditFilters
        search={search}
        onSearchChange={setSearch}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        expansionMode={expansionMode}
        onExpansionModeChange={handleExpansionModeChange}
      />

      {/* Loading / Error / Empty States */}
      {isLoading ? (
        <p className="py-2 text-xs text-text-tertiary">Đang tải nhật ký...</p>
      ) : error ? (
        <p className="py-2 text-xs text-error-600">
          Không thể tải nhật ký: {error.message}
        </p>
      ) : events.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">
          Chưa có bản ghi nhật ký nào.
        </p>
      ) : filteredEvents.length === 0 ? (
        <div className="space-y-3 py-2">
          <p className="text-xs text-text-tertiary">
            Không tìm thấy nhật ký phù hợp với bộ lọc.
          </p>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="primary"
              appearance="outline"
              onPress={handleResetFilters}
            >
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      ) : (
        /* Timeline Conversations / Groups */
        <div className="space-y-8">
          {groupedEvents.map((group) => {
            const expanded = expandedGroupIds.has(group.id);
            const latestEvent = group.items[0];

            return (
              <section
                key={group.id}
                aria-labelledby={`audit-group-${group.id}-heading`}
              >
                {/* Collapsible Section Header */}
                <div className="flex flex-col gap-2 border-b border-card-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      handleGroupExpandedChange(group.id, !expanded)
                    }
                    aria-expanded={expanded}
                    aria-labelledby={`audit-group-${group.id}-heading`}
                    className="flex min-w-0 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <span
                      className="shrink-0 text-text-tertiary"
                      aria-hidden="true"
                    >
                      {expanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                    <span
                      id={`audit-group-${group.id}-heading`}
                      className="truncate text-base font-semibold text-text-primary"
                    >
                      {group.label}
                    </span>
                    <Badge color="sky">{group.items.length} bản ghi</Badge>
                  </button>
                  <time className="pl-9 text-sm text-text-tertiary sm:pl-0">
                    {formatDateTime(latestEvent.occurredAt)}
                  </time>
                </div>

                {/* Timeline Items List */}
                {expanded ? (
                  <ol className="relative mt-5 ml-3 space-y-7 border-l border-card-border pl-6">
                    {group.items.map((event) => (
                      <StudentAuditItem key={event.eventId} event={event} />
                    ))}
                  </ol>
                ) : (
                  <div className="mt-3 pl-9">
                    <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
                      {getStudentAuditActor(latestEvent)}{" "}
                      {getStudentAuditActivityDescription(latestEvent)}
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
