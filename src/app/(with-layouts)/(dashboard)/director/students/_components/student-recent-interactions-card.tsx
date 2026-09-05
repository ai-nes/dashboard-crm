"use client";

import { Card } from "@/components/tailgrids/core/card";
import { AnalysisRecentChangesList } from "@/components/analysis-runs/analysis-report-signal-lists";
import type { AnalysisRecentChange } from "@/services/api/analysis-runs";
import type {
  Student360Data,
  StudentNoteItem,
  StudentTaskItem,
} from "@/services/api/students/types";
import StudentAICardHeader from "./student-ai-card-header";
import StudentCardEmptyState from "./student-card-empty-state";

interface StudentRecentInteractionsCardProps {
  data: Student360Data;
  recentChanges?: AnalysisRecentChange[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function StudentRecentInteractionsCard({
  data,
  recentChanges = [],
  isRefreshing,
  onRefresh,
}: StudentRecentInteractionsCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Nhật ký tương tác gần đây"
        timestamp={data.classification.updatedAt ? `Cập nhật lúc ${data.classification.updatedAt}` : undefined}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">Kênh tiếp cận tuyển sinh (Inbound)</h4>
          </div>
          {recentChanges.length > 0 ? (
            <div className="mt-3">
              <AnalysisRecentChangesList items={recentChanges} variant="plain" />
            </div>
          ) : (
            <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
          )}
        </div>

        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">3 hoạt động gần nhất (Outbound)</h4>
          </div>
          <StudentActivityList data={data} />
        </div>
      </div>
    </Card>
  );
}

interface StudentActivitySummary {
  id: string;
  title: string;
  detail?: string;
  date: string;
  channel?: string;
}

function StudentActivityList({ data }: { data: Student360Data }) {
  const items = buildStudentActivitySummary(data)
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const rightTime = parseActivityTimestamp(right.item.date);
      const leftTime = parseActivityTimestamp(left.item.date);
      return rightTime - leftTime || left.index - right.index;
    })
    .slice(0, 3)
    .map(({ item }) => item);

  if (items.length === 0) {
    return <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />;
  }

  return (
    <ul className="mt-3 divide-y divide-card-border">
      {items.map((item) => (
        <li key={item.id} className="min-w-0 py-3 first:pt-3 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-sm font-semibold text-text-primary text-pretty">
              {item.title}
            </p>
            <span className="shrink-0 text-xs text-text-tertiary">{item.date}</span>
          </div>
          {item.detail && (
            <p className="mt-1 text-sm leading-5 text-text-secondary text-pretty">
              {item.detail}
            </p>
          )}
          {item.channel && (
            <p className="mt-1 text-xs text-text-tertiary">{item.channel}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function buildStudentActivitySummary(data: Student360Data): StudentActivitySummary[] {
  const journeyItems = data.journey.map((event) => ({
    id: `journey-${event.id}`,
    title: event.title,
    detail: event.description,
    date: event.date,
    channel: event.channel,
  }));
  const callItems = (data.calls ?? []).map((call) => ({
    id: `call-${call.id}`,
    title: call.topic || "Cuộc gọi",
    detail: call.summary,
    date: call.time,
    channel: call.direction === "inbound" ? "Cuộc gọi đến" : "Cuộc gọi đi",
  }));
  const noteItems = (data.notes ?? []).map((note, index) =>
    toNoteActivity(note, index),
  );
  const taskItems = (data.tasks ?? []).map((task) => toTaskActivity(task));
  const zaloItems = (data.zaloMessages ?? []).map((message) => ({
    id: `zalo-${message.id}`,
    title: "Zalo",
    detail: message.content,
    date: message.time,
    channel: message.direction === "inbound" ? "Zalo đến" : "Zalo đi",
  }));
  const auditItems = (data.auditEvents ?? []).map((event, index) => ({
    id: `audit-${event.time}-${index}`,
    title: event.action,
    detail: event.actor,
    date: event.time,
    channel: "Lịch sử hồ sơ",
  }));

  return [
    ...journeyItems,
    ...callItems,
    ...noteItems,
    ...taskItems,
    ...zaloItems,
    ...auditItems,
  ];
}

function toNoteActivity(note: StudentNoteItem, index: number): StudentActivitySummary {
  return {
    id: `note-${note.name ?? index}`,
    title: `Ghi chú · ${note.author}`,
    detail: stripHtml(note.content),
    date: note.date,
    channel: "Ghi chú CRM",
  };
}

function toTaskActivity(task: StudentTaskItem): StudentActivitySummary {
  return {
    id: `task-${task.id}`,
    title: task.title,
    detail: task.notes,
    date: task.dueDate,
    channel: `Task · ${task.status}`,
  };
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseActivityTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}
