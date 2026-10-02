"use client";

import { ArrowRight, ChevronDown, ChevronRight } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { StudentZaloMessage } from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
} from "./student-activity-toolbar";
import { StudentZaloSkeleton } from "./student-activity-skeleton";
import {
  activityTimeFilterOptions,
  getStudentZaloConversationTitle,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "./student-activity-utils";
import StudentZaloMessageDetails, {
  zaloMessageStatusConfig,
} from "./student-zalo-message-details";
import StudentZaloManualSummary from "./student-zalo-manual-summary";

import StudentZaloTimelineStep from "./student-zalo-timeline-step";

interface StudentZaloTabProps {
  messages: StudentZaloMessage[];
  isLoading?: boolean;
}

interface StudentZaloConversation {
  id: string;
  title: string;
  messages: StudentZaloMessage[];
  latestMessage: StudentZaloMessage;
}

export default function StudentZaloTab({
  messages,
  isLoading = false,
}: StudentZaloTabProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] =
    useState<ActivityExpansionMode>("collapse");
  const allConversations = useMemo(
    () => groupConversations(messages),
    [messages],
  );
  const [expandedConversationIds, setExpandedConversationIds] = useState<
    Set<string>
  >(() => new Set(allConversations.map((conversation) => conversation.id)));

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi-VN");

    return messages.filter((message) => {
      const matchesTime = matchesActivityTimeFilter(message.time, timeFilter);
      const matchesSearch =
        !query ||
        [
          message.content,
          message.summary,
          message.notes,
          message.recordedBy,
          message.outcome,
          message.senderName,
          message.senderRole,
          message.recipientName,
          message.recipientRole,
          message.conversationTitle,
          message.attachmentName,
          message.status
            ? zaloMessageStatusConfig[message.status].label
            : undefined,
        ]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("vi-VN").includes(query));

      return matchesTime && matchesSearch;
    });
  }, [messages, search, timeFilter]);

  const conversations = useMemo(
    () => groupConversations(filteredMessages),
    [filteredMessages],
  );

  const manualSummaries = useMemo(
    () =>
      filteredMessages
        .filter((message) => message.entryKind === "manual_summary")
        .sort(
          (a, b) =>
            parseStudentActivityDate(b.time).getTime() -
            parseStudentActivityDate(a.time).getTime(),
        ),
    [filteredMessages],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedConversationIds(
      new Set(
        mode === "expand"
          ? allConversations.map((conversation) => conversation.id)
          : [],
      ),
    );
  };

  const handleConversationExpandedChange = (id: string, expanded: boolean) => {
    setExpandedConversationIds((current) => {
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
        searchPlaceholder="Tìm trao đổi Zalo..."
        searchLabel="Tìm trao đổi Zalo"
        expansionMode={expansionMode}
        onExpansionModeChange={handleExpansionModeChange}
      />

      <div className="w-full max-w-md">
        <ActivityFilterSelect
          ariaLabel="Lọc trao đổi Zalo theo thời gian"
          triggerLabel="Tất cả thời gian"
          value={timeFilter}
          options={activityTimeFilterOptions}
          onChange={(value) => setTimeFilter(value as ActivityTimeFilter)}
        />
      </div>

      {isLoading ? (
        <StudentZaloSkeleton />
      ) : messages.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">
          Chưa có trao đổi Zalo.
        </p>
      ) : filteredMessages.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">
          Không tìm thấy trao đổi phù hợp.
        </p>
      ) : (
        <div className="space-y-8">
          {conversations.length > 0 ? (
            <h3 className="text-sm font-semibold text-text-primary">
              Tin nhắn Zalo
            </h3>
          ) : null}
          {conversations.map((conversation) => {
            const expanded = expandedConversationIds.has(conversation.id);
            return (
              <section
                key={conversation.id}
                aria-labelledby={`${conversation.id}-heading`}
              >
                <div className="flex flex-col gap-2 border-b border-card-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      handleConversationExpandedChange(
                        conversation.id,
                        !expanded,
                      )
                    }
                    aria-expanded={expanded}
                    aria-labelledby={`${conversation.id}-heading`}
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
                      id={`${conversation.id}-heading`}
                      className="truncate text-base font-semibold text-text-primary"
                    >
                      {conversation.title}
                    </span>
                    <Badge color="sky">
                      {conversation.messages.length} tin
                    </Badge>
                  </button>
                  <time className="pl-9 text-sm text-text-tertiary sm:pl-0">
                    {formatDateTime(conversation.latestMessage.time)}
                  </time>
                </div>

                {expanded ? (
                  <ol className="relative mt-5 ml-3 space-y-7 border-l border-card-border pl-6">
                    {conversation.messages.map((message) => (
                      <StudentZaloTimelineStep key={message.id}>
                        <StudentZaloMessageDetails message={message} />
                      </StudentZaloTimelineStep>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-3 pl-9">
                    <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
                      {conversation.latestMessage.content}
                    </p>
                  </div>
                )}
              </section>
            );
          })}
          {manualSummaries.length > 0 ? (
            <section aria-label="Ghi nhận thủ công">
              <div className="flex items-center gap-2 border-b border-card-border pb-3">
                <h3 className="text-base font-semibold text-text-primary">
                  Ghi nhận thủ công
                </h3>
                <Badge color="sky">{manualSummaries.length} ghi nhận</Badge>
              </div>
              <ol className="relative mt-5 ml-3 space-y-7 border-l border-card-border pl-6">
                {manualSummaries.map((message) => (
                  <StudentZaloTimelineStep key={message.id} isManual>
                    <StudentZaloManualSummary message={message} />
                  </StudentZaloTimelineStep>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function groupConversations(
  messages: StudentZaloMessage[],
): StudentZaloConversation[] {
  const conversations = new Map<string, StudentZaloMessage[]>();

  for (const message of messages) {
    if (message.entryKind === "manual_summary") continue;
    const title = getStudentZaloConversationTitle(message.conversationTitle);
    const current = conversations.get(title) ?? [];
    current.push(message);
    conversations.set(title, current);
  }

  return Array.from(conversations.entries())
    .map(([title, conversationMessages]) => {
      const sortedMessages = [...conversationMessages].sort(
        (a, b) =>
          parseStudentActivityDate(a.time).getTime() -
          parseStudentActivityDate(b.time).getTime(),
      );
      const latestMessage = sortedMessages[sortedMessages.length - 1];

      return {
        id: `zalo-conversation-${encodeURIComponent(title)}`,
        title,
        messages: sortedMessages,
        latestMessage,
      };
    })
    .sort(
      (a, b) =>
        parseStudentActivityDate(b.latestMessage.time).getTime() -
        parseStudentActivityDate(a.latestMessage.time).getTime(),
    );
}

export function StudentZaloSummary({
  messages,
  onOpen,
}: {
  messages: StudentZaloMessage[];
  onOpen: () => void;
}) {
  if (messages.length === 0) return null;

  const latestMessage = [...messages].sort(
    (a, b) =>
      parseStudentActivityDate(b.time).getTime() -
      parseStudentActivityDate(a.time).getTime(),
  )[0];
  const isManual = latestMessage.entryKind === "manual_summary";
  const actualMessages = messages.filter(
    (message) => message.entryKind !== "manual_summary",
  );
  const manualCount = messages.length - actualMessages.length;
  const status = zaloMessageStatusConfig[latestMessage.status ?? "sent"];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <Badge color="sky">Zalo</Badge>
          {actualMessages.length > 0 ? (
            <span>{actualMessages.length} tin nhắn</span>
          ) : null}
          {manualCount > 0 ? (
            <span>{manualCount} ghi nhận thủ công</span>
          ) : null}
          <span className="text-text-tertiary">
            · {isManual ? latestMessage.recordedBy : latestMessage.senderName}
          </span>
        </div>
        {isManual ? null : <Badge color={status.color}>{status.label}</Badge>}
      </div>
      {isManual ? (
        <StudentZaloManualSummary message={latestMessage} />
      ) : (
        <div className="rounded-lg bg-background-gray-secondary/60 px-4 py-3">
          <p className="text-xs text-text-tertiary">
            Tin nhắn gần nhất · {formatDateTime(latestMessage.time)}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-primary">
            {latestMessage.content}
          </p>
        </div>
      )}
      <Button
        type="button"
        variant="primary"
        appearance="ghost"
        size="sm"
        onPress={onOpen}
        className="px-0 hover:bg-transparent"
      >
        Xem chi tiết Zalo
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
