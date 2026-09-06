"use client";

import { CheckCircle1, ClockThree } from "@tailgrids/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  InteractionCatalogItem,
  InteractionFeedFilters,
  InteractionSummary,
} from "@/services/api/interaction-intelligence";
import {
  useInteractionCatalogQuery,
  useInteractionFeedQuery,
} from "@/hooks/use-interaction-intelligence-queries";
import type { StudentAuditLog } from "@/services/api/student-audit";
import type {
  StudentCallRecord,
  StudentTaskItem,
  StudentZaloMessage,
} from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityAiInsight from "./student-activity-ai-insight";
import StudentActivityCard from "./student-activity-card";
import StudentActivityGroup from "./student-activity-group";
import StudentInteractionFilterBar from "./student-interaction-filter-bar";
import type { ActivityExpansionMode } from "./student-activity-toolbar";
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
import {
  StudentCallActivityTitle,
  StudentCallDetails,
} from "./student-calls-tab";
import StudentInteractionActivityDetails from "./student-interaction-activity-details";
import {
  createZaloMessageIndex,
  findZaloMessageForInteraction,
} from "./student-interaction-source-matching";
import {
  getInteractionActivityTitle,
  isCallInteraction,
} from "./student-interaction-utils";
import StudentTaskCard, { isTaskOverdue } from "./student-task-card";
import StudentZaloMessageDetails from "./student-zalo-message-details";

interface ActivityFeedItem {
  id: string;
  date: Date;
  call?: StudentCallRecord;
  interaction?: InteractionSummary;
  zaloMessage?: StudentZaloMessage | null;
  task?: StudentTaskItem;
  auditEvent?: StudentAuditLog;
}

interface StudentAllActivitiesFeedProps {
  studentId: string;
  calls: StudentCallRecord[];
  tasks: StudentTaskItem[];
  zaloMessages: StudentZaloMessage[];
  auditEvents: StudentAuditLog[];
  onUpdateTask: (id: string, updates: Partial<StudentTaskItem>) => void;
}

function getActivitySearchText(
  item: ActivityFeedItem,
  interactionCatalog: Map<string, InteractionCatalogItem>,
): string {
  const values = [
    item.call
      ? [
          "cuộc gọi",
          item.call.topic,
          item.call.summary,
          item.call.callerName,
          item.call.callerRole,
          item.call.receiverName,
          item.call.receiverRole,
          item.call.phoneNumber,
          item.call.direction,
          item.call.outcome,
        ]
      : [],
    item.interaction
      ? [
          getInteractionActivityTitle(item.interaction, interactionCatalog),
          item.interaction.interaction_label,
          item.interaction.summary,
          item.interaction.outcome,
          item.interaction.channel,
          item.interaction.direction,
          item.interaction.semantic?.purpose,
          item.interaction.semantic?.disposition,
          item.interaction.source_type,
          item.interaction.source_id,
        ]
      : [],
    item.zaloMessage
      ? [
          "zalo",
          item.zaloMessage.conversationTitle,
          item.zaloMessage.senderName,
          item.zaloMessage.senderRole,
          item.zaloMessage.recipientName,
          item.zaloMessage.recipientRole,
          item.zaloMessage.content,
          item.zaloMessage.status,
          item.zaloMessage.attachmentName,
        ]
      : [],
    item.task
      ? [
          "task",
          item.task.title,
          item.task.assignee,
          item.task.status,
          item.task.priority,
          item.task.taskType,
          item.task.notes,
        ]
      : [],
    item.auditEvent
      ? [
          "cập nhật hồ sơ",
          item.auditEvent.action,
          item.auditEvent.changeType,
          item.auditEvent.doctype,
          item.auditEvent.docname,
          item.auditEvent.fieldname,
          item.auditEvent.fieldLabel,
          item.auditEvent.ownerFullName,
          item.auditEvent.source,
          item.auditEvent.sourceName,
        ]
      : [],
  ]
    .flat()
    .filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    .join(" ")
    .toLocaleLowerCase("vi-VN");

  return values;
}

export default function StudentAllActivitiesFeed({
  studentId,
  calls,
  tasks,
  zaloMessages,
  auditEvents,
  onUpdateTask,
}: StudentAllActivitiesFeedProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const [interactionFilters, setInteractionFilters] =
    useState<InteractionFeedFilters>({});
  const [expansionMode, setExpansionMode] =
    useState<ActivityExpansionMode>("collapse");
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedItemIds, setCollapsedItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const interactionQueryFilters = useMemo(
    () => ({ ...interactionFilters, limit: 100 }),
    [interactionFilters],
  );
  const interactionQuery = useInteractionFeedQuery(
    studentId,
    interactionQueryFilters,
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

  const handleSearchChange = (value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const normalizedValue = value.trim();

    if (normalizedValue) nextSearchParams.set("q", value);
    else nextSearchParams.delete("q");

    const query = nextSearchParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const items = useMemo<ActivityFeedItem[]>(
    () =>
      [
        ...calls.map((call) => ({
          id: `call-${call.id}`,
          date: parseStudentActivityDate(call.time),
          call,
        })),
        ...interactions
          .filter((interaction) => !isCallInteraction(interaction))
          .map((interaction) => ({
            id: `interaction-${interaction.id}`,
            date: parseStudentActivityDate(
              interaction.occurred_at ?? undefined,
            ),
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
    [auditEvents, calls, interactions, tasks, zaloMessageIndex],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi-VN");
    if (!query) return items;

    return items.filter((item) =>
      getActivitySearchText(item, interactionCatalog).includes(query),
    );
  }, [interactionCatalog, items, search]);

  const groupedItems = useMemo(
    () =>
      groupActivitiesWithOverdue(
        filteredItems,
        (item) => item.date,
        (item) => Boolean(item.task && isTaskOverdue(item.task)),
      ),
    [filteredItems],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedItemIds(
      new Set(mode === "expand" ? items.map((item) => item.id) : []),
    );
    setCollapsedItemIds(new Set());
  };

  const handleItemExpandedChange = (id: string, expanded: boolean) => {
    if (expansionMode === "expand") {
      setCollapsedItemIds((current) => {
        const next = new Set(current);
        if (expanded) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }

    setExpandedItemIds((current) => {
      const next = new Set(current);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const isItemExpanded = (id: string) =>
    expansionMode === "expand"
      ? !collapsedItemIds.has(id)
      : expandedItemIds.has(id);

  const filterBar = (
    <StudentInteractionFilterBar
      filters={interactionFilters}
      expansionMode={expansionMode}
      search={search}
      onChange={setInteractionFilters}
      onSearchChange={handleSearchChange}
      onExpansionModeChange={handleExpansionModeChange}
    />
  );

  if (interactionQuery.isPending && items.length === 0) {
    return (
      <div className="space-y-4">
        {filterBar}
        <p className="py-2 text-xs text-text-tertiary">Đang tải hoạt động...</p>
      </div>
    );
  }

  if (interactionQuery.isError && items.length === 0) {
    return (
      <div className="space-y-4">
        {filterBar}
        <p className="py-2 text-xs text-error-600">
          Không thể tải danh sách hoạt động.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {filterBar}
        <p className="py-2 text-xs text-text-tertiary">
          Chưa có hoạt động nào cho học sinh này.
        </p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="space-y-4">
        {filterBar}
        <p className="py-2 text-xs text-text-tertiary">
          Không tìm thấy hoạt động phù hợp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filterBar}
      {groupedItems.map((group) => (
        <StudentActivityGroup
          key={group.id}
          id={`all-activities-group-${group.id}`}
          label={group.label}
          count={group.items.length}
          tone={group.id === "overdue" ? "danger" : "default"}
        >
          {group.items.map((item) =>
            item.call ? (
              <StudentActivityCard
                key={item.id}
                title={<StudentCallActivityTitle call={item.call} />}
                timestamp={formatDateTime(item.call.time)}
                expanded={isItemExpanded(item.id)}
                onExpandedChange={(expanded) =>
                  handleItemExpandedChange(item.id, expanded)
                }
              >
                <StudentCallDetails call={item.call} />
              </StudentActivityCard>
            ) : item.task ? (
              <StudentTaskCard
                key={item.id}
                task={item.task}
                onUpdateTask={onUpdateTask}
                expanded={isItemExpanded(item.id)}
                onExpandedChange={(expanded) =>
                  handleItemExpandedChange(item.id, expanded)
                }
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
                expanded={isItemExpanded(item.id)}
                onExpandedChange={(expanded) =>
                  handleItemExpandedChange(item.id, expanded)
                }
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
                expanded={isItemExpanded(item.id)}
                onExpandedChange={(expanded) =>
                  handleItemExpandedChange(item.id, expanded)
                }
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
