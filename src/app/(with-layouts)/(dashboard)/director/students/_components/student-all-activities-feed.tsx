"use client";

import { CheckCircle1, ClockThree } from "@tailgrids/icons";
import type { ReactNode } from "react";
import { useMemo } from "react";

import type {
  StudentCallRecord,
  StudentNoteItem,
  StudentTaskItem,
  StudentZaloMessage,
} from "@/services/api/students/types";
import type { StudentAuditLog } from "@/services/api/student-audit";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityCard from "./student-activity-card";
import StudentActivityGroup from "./student-activity-group";
import {
  getStudentAuditActor,
  getStudentAuditTone,
  StudentAuditEventDetails,
} from "./student-audit-event";
import { StudentCallDetails } from "./student-calls-tab";
import {
  groupActivitiesWithOverdue,
  parseStudentActivityDate,
} from "./student-activity-utils";
import StudentTaskCard, { isTaskOverdue } from "./student-task-card";
import { StudentZaloSummary } from "./student-zalo-tab";

interface ActivityFeedItem {
  id: string;
  date: Date;
  task?: StudentTaskItem;
  icon?: ReactNode;
  iconClassName?: string;
  title?: ReactNode;
  timestamp?: string;
  preview?: ReactNode;
  body?: ReactNode;
  zaloMessages?: StudentZaloMessage[];
}

interface StudentAllActivitiesFeedProps {
  notes: StudentNoteItem[];
  tasks: StudentTaskItem[];
  zaloMessages: StudentZaloMessage[];
  calls: StudentCallRecord[];
  auditEvents: StudentAuditLog[];
  onUpdateTask: (id: string, updates: Partial<StudentTaskItem>) => void;
  onOpenZalo: () => void;
}

const richTextClassName =
  "text-sm leading-6 text-text-secondary [&_a]:text-primary-500 [&_a]:underline [&_p]:my-1";

export default function StudentAllActivitiesFeed({
  notes,
  tasks,
  zaloMessages,
  calls,
  auditEvents,
  onUpdateTask,
  onOpenZalo,
}: StudentAllActivitiesFeedProps) {
  const items = useMemo<ActivityFeedItem[]>(() => {
    const noteItems: ActivityFeedItem[] = notes
      .filter((note) => note.author !== "AI Student Insight")
      .map((note) => ({
        id: `note-${note.author}-${note.date}`,
        date: parseStudentActivityDate(note.date),
        title: (
          <>
            <strong className="font-semibold text-text-primary">Ghi chú</strong>{" "}
            của {note.author}
          </>
        ),
        timestamp: formatDateTime(note.date),
        body: (
          <div
            className={richTextClassName}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        ),
      }));

    const taskItems: ActivityFeedItem[] = tasks.map((task) => ({
      id: `task-${task.id}`,
      date: parseStudentActivityDate(task.dueDate),
      task,
    }));

    const zaloThreads = new Map<string, StudentZaloMessage[]>();
    for (const message of zaloMessages) {
      const threadKey = message.conversationTitle || "Trao đổi Zalo";
      const thread = zaloThreads.get(threadKey) ?? [];
      thread.push(message);
      zaloThreads.set(threadKey, thread);
    }

    const zaloItems: ActivityFeedItem[] = Array.from(zaloThreads.entries()).map(
      ([threadKey, threadMessages]) => {
        const latestMessage = [...threadMessages].sort(
          (a, b) =>
            parseStudentActivityDate(b.time).getTime() -
            parseStudentActivityDate(a.time).getTime(),
        )[0];

        return {
          id: `zalo-thread-${threadKey}`,
          date: parseStudentActivityDate(latestMessage.time),
          title: (
            <>
              <strong className="font-semibold text-text-primary">Zalo</strong>{" "}
              · {threadKey}
            </>
          ),
          timestamp: formatDateTime(latestMessage.time),
          zaloMessages: threadMessages,
        };
      },
    );

    const callItems: ActivityFeedItem[] = calls.map((call) => ({
      id: `call-${call.id}`,
      date: parseStudentActivityDate(call.time),
      title: (
        <>
          <strong className="font-semibold text-text-primary">Cuộc gọi</strong>{" "}
          · {call.topic || "Liên hệ"}
        </>
      ),
      timestamp: formatDateTime(call.time),
      preview: <StudentCallDetails call={call} compact />,
      body: <StudentCallDetails call={call} />,
    }));

    const logItems: ActivityFeedItem[] = auditEvents.map((event) => ({
      id: `log-${event.eventId}`,
      date: parseStudentActivityDate(event.occurredAt),
      icon:
        getStudentAuditTone(event) === "success" ? (
          <CheckCircle1 size={14} />
        ) : (
          <ClockThree size={14} />
        ),
      iconClassName:
        getStudentAuditTone(event) === "success"
          ? "bg-badge-success-background text-success-500"
          : "bg-badge-primary-background text-badge-primary-text",
      title: (
        <>
          <strong className="font-semibold text-text-primary">Nhật ký</strong> ·{" "}
          {getStudentAuditActor(event)}
        </>
      ),
      timestamp: formatDateTime(event.occurredAt),
      body: <StudentAuditEventDetails event={event} />,
    }));

    return [
      ...noteItems,
      ...taskItems,
      ...zaloItems,
      ...callItems,
      ...logItems,
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [notes, tasks, zaloMessages, calls, auditEvents]);

  const groupedItems = useMemo(
    () =>
      groupActivitiesWithOverdue(
        items,
        (item) => item.date,
        (item) => Boolean(item.task && isTaskOverdue(item.task)),
      ),
    [items],
  );

  if (items.length === 0) {
    return (
      <p className="py-2 text-xs text-text-tertiary">
        Chưa có hoạt động nào cho học sinh này.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groupedItems.map((group) => (
        <StudentActivityGroup
          key={group.id}
          id={`all-activities-group-${group.id}`}
          label={group.label}
          count={group.items.length}
          tone={group.id === "overdue" ? "danger" : "default"}
        >
          {group.items.map((item) =>
            item.zaloMessages ? (
              <StudentActivityCard
                key={item.id}
                icon={item.icon ?? null}
                iconClassName={item.iconClassName}
                title={item.title ?? null}
                timestamp={item.timestamp ?? ""}
                defaultExpanded={false}
                onExpandedChange={onOpenZalo}
              >
                <StudentZaloSummary
                  messages={item.zaloMessages}
                  onOpen={onOpenZalo}
                />
              </StudentActivityCard>
            ) : item.task ? (
              <StudentTaskCard
                key={item.id}
                task={item.task}
                onUpdateTask={onUpdateTask}
                defaultExpanded={false}
              />
            ) : (
              <StudentActivityCard
                key={item.id}
                icon={item.icon ?? null}
                iconClassName={item.iconClassName}
                title={item.title ?? null}
                timestamp={item.timestamp ?? ""}
                preview={item.preview}
                defaultExpanded={false}
              >
                {item.body}
              </StudentActivityCard>
            ),
          )}
        </StudentActivityGroup>
      ))}
    </div>
  );
}
