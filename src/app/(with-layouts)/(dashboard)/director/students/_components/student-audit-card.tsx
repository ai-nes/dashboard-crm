"use client";

import { CheckCircle1, ClockThree } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import type { Student360Data } from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityCard from "./student-activity-card";
import StudentActivityGroup from "./student-activity-group";
import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
} from "./student-activity-toolbar";
import {
  activityTimeFilterOptions,
  groupActivitiesByDate,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "./student-activity-utils";

type StudentAuditEvent = NonNullable<Student360Data["auditEvents"]>[number];

const EMPTY_AUDIT_EVENTS: StudentAuditEvent[] = [];

interface StudentAuditCardProps {
  data?: Student360Data;
}

export default function StudentAuditCard({ data }: StudentAuditCardProps) {
  const events = data?.auditEvents ?? EMPTY_AUDIT_EVENTS;
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] = useState<ActivityExpansionMode>("collapse");
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(
    () => new Set(events.map((event) => getAuditEventId(event))),
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesTime = matchesActivityTimeFilter(event.time, timeFilter);
      const matchesSearch =
        !query ||
        [event.action, event.actor, event.status].some((value) =>
          value.toLowerCase().includes(query),
        );
      return matchesTime && matchesSearch;
    });
  }, [events, timeFilter, search]);

  const groupedEvents = useMemo(
    () => groupActivitiesByDate(filteredEvents, (event) => parseStudentActivityDate(event.time)),
    [filteredEvents],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedEventIds(new Set(mode === "expand" ? events.map(getAuditEventId) : []));
  };

  const handleEventExpandedChange = (id: string, expanded: boolean) => {
    setExpandedEventIds((current) => {
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
        searchPlaceholder="Tìm nhật ký..."
        searchLabel="Tìm nhật ký"
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

      {events.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có bản ghi nhật ký mới.</p>
      ) : filteredEvents.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Không tìm thấy nhật ký phù hợp.</p>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map((group) => (
            <StudentActivityGroup
              key={group.id}
              id={`audit-group-${group.id}`}
              label={group.label}
              count={group.items.length}
            >
              {group.items.map((event) => {
                const eventId = getAuditEventId(event);
                return (
                  <StudentActivityCard
                    key={eventId}
                    icon={event.tone === "success" ? <CheckCircle1 size={14} /> : <ClockThree size={14} />}
                    iconClassName={
                      event.tone === "success"
                        ? "bg-badge-success-background text-success-500"
                        : "bg-badge-primary-background text-badge-primary-text"
                    }
                    title={
                      <>
                        <strong className="font-semibold text-text-primary">Nhật ký</strong> · {event.actor || "-"}
                      </>
                    }
                    timestamp={formatDateTime(event.time)}
                    preview={<AuditEventPreview event={event} />}
                    expanded={expandedEventIds.has(eventId)}
                    onExpandedChange={(expanded) => handleEventExpandedChange(eventId, expanded)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-text-secondary">{event.action}</p>
                      <Badge color={event.tone}>{event.status}</Badge>
                    </div>
                  </StudentActivityCard>
                );
              })}
            </StudentActivityGroup>
          ))}
        </div>
      )}
    </div>
  );
}

function getAuditEventId(event: StudentAuditEvent): string {
  return `${event.actor}-${event.time}-${event.action}`;
}

function AuditEventPreview({ event }: { event: StudentAuditEvent }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-text-secondary">{event.action}</p>
      <Badge color={event.tone}>{event.status}</Badge>
    </div>
  );
}
