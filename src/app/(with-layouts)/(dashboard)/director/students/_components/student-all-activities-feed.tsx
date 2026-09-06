"use client";

import { CheckCircle1, ClockThree } from "@tailgrids/icons";
import { useMemo } from "react";

import type { InteractionSummary } from "@/services/api/interaction-intelligence";
import {
  useInteractionCatalogQuery,
  useInteractionFeedQuery,
} from "@/hooks/use-interaction-intelligence-queries";
import type { StudentAuditLog } from "@/services/api/student-audit";
import type {
  StudentTaskItem,
  StudentZaloMessage,
} from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityAiInsight from "./student-activity-ai-insight";
import StudentActivityCard from "./student-activity-card";
import StudentActivityGroup from "./student-activity-group";
import {
  getStudentAuditActor,
  getStudentAuditTone,
  StudentAuditEventDetails,
} from "./student-audit-event";
import {
  getStudentZaloActivityTitle,
  groupActivitiesWithOverdue,
  parseStudentActivityDate,
} from "./student-activity-utils";
import StudentInteractionActivityDetails from "./student-interaction-activity-details";
import {
  createZaloMessageIndex,
  findZaloMessageForInteraction,
} from "./student-interaction-source-matching";
import { getInteractionActivityTitle } from "./student-interaction-utils";
import StudentTaskCard, { isTaskOverdue } from "./student-task-card";
import StudentZaloMessageDetails from "./student-zalo-message-details";

interface ActivityFeedItem {
  id: string;
  date: Date;
  interaction?: InteractionSummary;
  zaloMessage?: StudentZaloMessage | null;
  task?: StudentTaskItem;
  auditEvent?: StudentAuditLog;
}

interface StudentAllActivitiesFeedProps {
  studentId: string;
  tasks: StudentTaskItem[];
  zaloMessages: StudentZaloMessage[];
  auditEvents: StudentAuditLog[];
  onUpdateTask: (id: string, updates: Partial<StudentTaskItem>) => void;
}

export default function StudentAllActivitiesFeed({
  studentId,
  tasks,
  zaloMessages,
  auditEvents,
  onUpdateTask,
}: StudentAllActivitiesFeedProps) {
  const interactionQuery = useInteractionFeedQuery(
    studentId,
    { limit: 100 },
    true,
  );
  const interactionCatalogQuery = useInteractionCatalogQuery();
  const interactions = useMemo(
    () => interactionQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [interactionQuery.data?.pages],
  );
  const interactionCatalog = useMemo(
    () =>
      new Map(
        (interactionCatalogQuery.data?.interactionTypes ?? []).map((item) => [
          item.code,
          item,
        ]),
      ),
    [interactionCatalogQuery.data?.interactionTypes],
  );
  const zaloMessageIndex = useMemo(
    () => createZaloMessageIndex(zaloMessages),
    [zaloMessages],
  );

  const items = useMemo<ActivityFeedItem[]>(
    () =>
      [
        ...interactions.map((interaction) => ({
          id: `interaction-${interaction.id}`,
          date: parseStudentActivityDate(interaction.occurred_at ?? undefined),
          interaction,
          zaloMessage: findZaloMessageForInteraction(
            interaction,
            zaloMessageIndex,
          ),
        })),
        ...tasks.map((task) => ({
          id: `task-${task.id}`,
          date: parseStudentActivityDate(task.activityDate ?? task.dueDate),
          task,
        })),
        ...auditEvents.map((event) => ({
          id: `audit-${event.eventId}`,
          date: parseStudentActivityDate(event.occurredAt),
          auditEvent: event,
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [auditEvents, interactions, tasks, zaloMessageIndex],
  );

  const groupedItems = useMemo(
    () =>
      groupActivitiesWithOverdue(
        items,
        (item) => item.date,
        (item) => Boolean(item.task && isTaskOverdue(item.task)),
      ),
    [items],
  );

  if (interactionQuery.isPending && items.length === 0) {
    return (
      <p className="py-2 text-xs text-text-tertiary">Đang tải hoạt động...</p>
    );
  }

  if (interactionQuery.isError && items.length === 0) {
    return (
      <p className="py-2 text-xs text-error-600">
        Không thể tải danh sách hoạt động.
      </p>
    );
  }

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
            item.task ? (
              <StudentTaskCard
                key={item.id}
                task={item.task}
                onUpdateTask={onUpdateTask}
                defaultExpanded={false}
              />
            ) : item.auditEvent ? (
              <StudentActivityCard
                key={item.id}
                icon={
                  getStudentAuditTone(item.auditEvent) === "success" ? (
                    <CheckCircle1 size={14} />
                  ) : (
                    <ClockThree size={14} />
                  )
                }
                iconClassName={
                  getStudentAuditTone(item.auditEvent) === "success"
                    ? "bg-badge-success-background text-success-500"
                    : "bg-badge-primary-background text-badge-primary-text"
                }
                title={
                  <>
                    <strong className="font-semibold text-text-primary">
                      Cập nhật hồ sơ
                    </strong>{" "}
                    · {getStudentAuditActor(item.auditEvent)}
                  </>
                }
                timestamp={formatDateTime(item.auditEvent.occurredAt)}
                defaultExpanded={false}
              >
                <StudentAuditEventDetails event={item.auditEvent} />
              </StudentActivityCard>
            ) : item.interaction ? (
              <StudentActivityCard
                key={item.id}
                title={
                  item.zaloMessage
                    ? getStudentZaloActivityTitle(item.zaloMessage)
                    : getInteractionActivityTitle(
                        item.interaction,
                        interactionCatalog,
                      )
                }
                timestamp={formatDateTime(item.interaction.occurred_at)}
                defaultExpanded={false}
                aiInsight={
                  <StudentActivityAiInsight
                    interactionIds={[item.interaction.id]}
                  />
                }
              >
                {item.zaloMessage ? (
                  <StudentZaloMessageDetails message={item.zaloMessage} />
                ) : (
                  <StudentInteractionActivityDetails
                    interaction={item.interaction}
                  />
                )}
              </StudentActivityCard>
            ) : null,
          )}
        </StudentActivityGroup>
      ))}
    </div>
  );
}
