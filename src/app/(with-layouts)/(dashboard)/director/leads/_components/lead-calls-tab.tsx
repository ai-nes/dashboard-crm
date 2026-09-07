"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import StudentActivityCard from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-activity-card";
import StudentActivityGroup from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-activity-group";
import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
} from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-activity-toolbar";
import {
  activityTimeFilterOptions,
  groupActivitiesByDate,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-activity-utils";
import { formatDateTime } from "@/utils/format-date";

import type { LeadCallDirection, LeadCallOutcome, LeadCallRecord } from "./lead-calls-mock";
import LeadCallRecording from "./lead-call-recording";

interface LeadCallsTabProps {
  calls: LeadCallRecord[];
}

const outcomeConfig: Record<LeadCallOutcome, { label: string; color: "success" | "error" | "warning" | "primary" }> = {
  connected: { label: "Đã kết nối", color: "success" },
  missed: { label: "Cuộc gọi nhỡ", color: "error" },
  "no-answer": { label: "Không nghe máy", color: "warning" },
  callback: { label: "Hẹn gọi lại", color: "primary" },
};

const directionLabel: Record<LeadCallDirection, string> = {
  inbound: "Cuộc gọi đến",
  outbound: "Cuộc gọi đi",
  missed: "Cuộc gọi nhỡ",
};

const directionBadgeColor: Record<LeadCallDirection, "primary" | "warning" | "error"> = {
  inbound: "primary",
  outbound: "warning",
  missed: "error",
};

export default function LeadCallsTab({ calls }: LeadCallsTabProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] = useState<ActivityExpansionMode>("collapse");
  const [expandedCallIds, setExpandedCallIds] = useState<Set<string>>(
    () => new Set(calls.map((call) => call.id)),
  );

  const filteredCalls = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi-VN");

    return calls.filter((call) => {
      const matchesTime = matchesActivityTimeFilter(call.time, timeFilter);
      const matchesSearch =
        !query ||
        [
          call.topic,
          call.summary,
          call.callerName,
          call.callerRole,
          call.receiverName,
          call.receiverRole,
          call.phoneNumber,
          directionLabel[call.direction],
          outcomeConfig[call.outcome].label,
        ]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("vi-VN").includes(query));

      return matchesTime && matchesSearch;
    });
  }, [calls, search, timeFilter]);

  const groupedCalls = useMemo(
    () => groupActivitiesByDate(filteredCalls, (call) => parseStudentActivityDate(call.time)),
    [filteredCalls],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedCallIds(new Set(mode === "expand" ? calls.map((call) => call.id) : []));
  };

  const handleCallExpandedChange = (id: string, expanded: boolean) => {
    setExpandedCallIds((current) => {
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
        searchPlaceholder="Tìm cuộc gọi..."
        searchLabel="Tìm cuộc gọi"
        expansionMode={expansionMode}
        onExpansionModeChange={handleExpansionModeChange}
      />

      <div className="w-full max-w-md">
        <ActivityFilterSelect
          ariaLabel="Lọc cuộc gọi theo thời gian"
          triggerLabel="Tất cả thời gian"
          value={timeFilter}
          options={activityTimeFilterOptions}
          onChange={(value) => setTimeFilter(value as ActivityTimeFilter)}
        />
      </div>

      {calls.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có lịch sử cuộc gọi.</p>
      ) : filteredCalls.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Không tìm thấy cuộc gọi phù hợp.</p>
      ) : (
        <div className="space-y-6">
          {groupedCalls.map((group) => (
            <StudentActivityGroup key={group.id} id={`calls-group-${group.id}`} label={group.label} count={group.items.length}>
              {group.items.map((call) => (
                <StudentActivityCard
                  key={call.id}
                  title={<LeadCallActivityTitle call={call} />}
                  timestamp={formatDateTime(call.time)}
                  preview={<LeadCallDetails call={call} compact />}
                  expanded={expandedCallIds.has(call.id)}
                  onExpandedChange={(expanded) => handleCallExpandedChange(call.id, expanded)}
                >
                  <LeadCallDetails call={call} />
                </StudentActivityCard>
              ))}
            </StudentActivityGroup>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeadCallDetails({ call, compact = false }: { call: LeadCallRecord; compact?: boolean }) {
  const outcome = outcomeConfig[call.outcome];

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
            <span>
              {call.callerName} → {call.receiverName}
            </span>
            <span className="text-text-tertiary">{formatDuration(call.durationSeconds)}</span>
          </div>
          <Badge color={outcome.color}>{outcome.label}</Badge>
        </div>
        <LeadCallRecording recordingUrl={call.recordingUrl} durationSeconds={call.durationSeconds} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CallMeta label="Người gọi" value={call.callerName} detail={call.callerRole} />
        <CallMeta label="Người nhận" value={call.receiverName} detail={call.receiverRole} />
        <CallMeta label="Số điện thoại" value={call.phoneNumber || "-"} />
        <div className="min-w-0">
          <p className="text-xs text-text-tertiary">Kết quả</p>
          <Badge color={outcome.color} className="mt-1">
            {outcome.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-card-border pt-4 text-sm text-text-secondary">
        <Badge color={directionBadgeColor[call.direction]}>{directionLabel[call.direction]}</Badge>
        <span>Thời gian: {formatDateTime(call.time)}</span>
        <span>Thời lượng: {formatDuration(call.durationSeconds)}</span>
      </div>

      {call.summary ? (
        <div className="rounded-lg bg-background-gray-secondary/60 px-4 py-3">
          <p className="text-xs font-medium text-text-tertiary">Tóm tắt cuộc gọi</p>
          <p className="mt-1 text-sm leading-6 text-text-primary">{call.summary}</p>
        </div>
      ) : null}

      <LeadCallRecording recordingUrl={call.recordingUrl} durationSeconds={call.durationSeconds} />
    </div>
  );
}

export function LeadCallActivityTitle({ call }: { call: LeadCallRecord }) {
  return (
    <>
      <strong className="font-semibold text-text-primary">Cuộc gọi</strong>
      <span className="hidden text-sm font-medium text-text-secondary sm:inline">
        {` · ${call.topic || directionLabel[call.direction]}`}
      </span>
    </>
  );
}

function CallMeta({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-text-primary" title={value}>
        {value || "-"}
      </p>
      {detail ? <p className="mt-0.5 truncate text-xs text-text-tertiary">{detail}</p> : null}
    </div>
  );
}

function formatDuration(value?: number): string {
  if (!value || value <= 0) return "Không kết nối";
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes} phút ${String(seconds).padStart(2, "0")} giây`;
}
