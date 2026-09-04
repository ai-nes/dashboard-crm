"use client";

import { ArrowRight, ChevronDown, ChevronRight, FileText } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type {
  StudentZaloMessage,
  StudentZaloMessageStatus,
} from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
} from "./student-activity-toolbar";
import {
  activityTimeFilterOptions,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "./student-activity-utils";

interface StudentZaloTabProps {
  messages: StudentZaloMessage[];
}

interface StudentZaloConversation {
  id: string;
  title: string;
  messages: StudentZaloMessage[];
  latestMessage: StudentZaloMessage;
}

const statusConfig: Record<
  StudentZaloMessageStatus,
  { label: string; color: "gray" | "primary" | "success" | "error" }
> = {
  sent: { label: "Đã gửi", color: "gray" },
  delivered: { label: "Đã nhận", color: "primary" },
  read: { label: "Đã xem", color: "success" },
  failed: { label: "Gửi lỗi", color: "error" },
};

export default function StudentZaloTab({ messages }: StudentZaloTabProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] = useState<ActivityExpansionMode>("collapse");
  const allConversations = useMemo(() => groupConversations(messages), [messages]);
  const [expandedConversationIds, setExpandedConversationIds] = useState<Set<string>>(
    () => new Set(allConversations.map((conversation) => conversation.id)),
  );

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi-VN");

    return messages.filter((message) => {
      const matchesTime = matchesActivityTimeFilter(message.time, timeFilter);
      const matchesSearch =
        !query ||
        [
          message.content,
          message.senderName,
          message.senderRole,
          message.recipientName,
          message.recipientRole,
          message.conversationTitle,
          message.attachmentName,
          message.status ? statusConfig[message.status].label : undefined,
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

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedConversationIds(
      new Set(mode === "expand" ? allConversations.map((conversation) => conversation.id) : []),
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
        searchPlaceholder="Tìm tin nhắn Zalo..."
        searchLabel="Tìm tin nhắn Zalo"
        expansionMode={expansionMode}
        onExpansionModeChange={handleExpansionModeChange}
      />

      <div className="w-full max-w-md">
        <ActivityFilterSelect
          ariaLabel="Lọc tin nhắn Zalo theo thời gian"
          triggerLabel="Tất cả thời gian"
          value={timeFilter}
          options={activityTimeFilterOptions}
          onChange={(value) => setTimeFilter(value as ActivityTimeFilter)}
        />
      </div>

      {messages.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có tin nhắn Zalo.</p>
      ) : filteredMessages.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Không tìm thấy tin nhắn phù hợp.</p>
      ) : (
        <div className="space-y-8">
          {conversations.map((conversation) => {
            const expanded = expandedConversationIds.has(conversation.id);
            return (
              <section key={conversation.id} aria-labelledby={`${conversation.id}-heading`}>
                <div className="flex flex-col gap-2 border-b border-card-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      handleConversationExpandedChange(conversation.id, !expanded)
                    }
                    aria-expanded={expanded}
                    aria-labelledby={`${conversation.id}-heading`}
                    className="flex min-w-0 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <span className="shrink-0 text-text-tertiary" aria-hidden="true">
                      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span id={`${conversation.id}-heading`} className="truncate text-base font-semibold text-text-primary">
                      {conversation.title}
                    </span>
                    <Badge color="sky">{conversation.messages.length} tin</Badge>
                  </button>
                  <time className="pl-9 text-sm text-text-tertiary sm:pl-0">
                    {formatDateTime(conversation.latestMessage.time)}
                  </time>
                </div>

                {expanded ? (
                  <ol className="relative mt-5 ml-3 space-y-7 border-l border-card-border pl-6">
                    {conversation.messages.map((message) => (
                      <ZaloMessageStep key={message.id} message={message} />
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
        </div>
      )}
    </div>
  );
}

function groupConversations(messages: StudentZaloMessage[]): StudentZaloConversation[] {
  const conversations = new Map<string, StudentZaloMessage[]>();

  for (const message of messages) {
    const title = message.conversationTitle || "Trao đổi Zalo";
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

function ZaloMessageStep({ message }: { message: StudentZaloMessage }) {
  const status = statusConfig[message.status ?? "sent"];
  const isOutbound = message.direction === "outbound";

  return (
    <li className="relative">
      <span
        className="absolute -left-[2.05rem] top-0 flex size-7 items-center justify-center rounded-full border-2 border-card-background bg-card-background text-badge-sky-text shadow-sm"
        aria-hidden="true"
      >
        <span className="size-2.5 rounded-full bg-badge-sky-text" />
      </span>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {message.senderName}
            {message.senderRole ? (
              <span className="ml-2 font-normal text-text-tertiary">{message.senderRole}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">Gửi đến {message.recipientName}</p>
        </div>
        <time className="shrink-0 text-xs text-text-tertiary">{formatDateTime(message.time)}</time>
      </div>

      <div
        className={
          isOutbound
            ? "mt-3 w-fit max-w-2xl rounded-2xl rounded-br-md bg-badge-sky-background px-4 py-3"
            : "mt-3 w-fit max-w-2xl rounded-2xl rounded-bl-md bg-background-gray-secondary px-4 py-3"
        }
      >
        <p className="whitespace-pre-line text-sm leading-6 text-text-primary">{message.content}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        <Badge color={isOutbound ? "sky" : "gray"}>
          {isOutbound ? "Tin nhắn gửi" : "Tin nhắn đến"}
        </Badge>
        <Badge color={status.color}>{status.label}</Badge>
        {message.attachmentName ? (
          <Badge color="primary" prefixIcon={<FileText size={12} />}>
            {message.attachmentName}
          </Badge>
        ) : null}
      </div>
    </li>
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
      parseStudentActivityDate(b.time).getTime() - parseStudentActivityDate(a.time).getTime(),
  )[0];
  const status = statusConfig[latestMessage.status ?? "sent"];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <Badge color="sky">Zalo</Badge>
          <span>{messages.length} tin nhắn</span>
          <span className="text-text-tertiary">· {latestMessage.senderName}</span>
        </div>
        <Badge color={status.color}>{status.label}</Badge>
      </div>
      <div className="rounded-lg bg-background-gray-secondary/60 px-4 py-3">
        <p className="text-xs text-text-tertiary">
          Tin nhắn gần nhất · {formatDateTime(latestMessage.time)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-primary">
          {latestMessage.content}
        </p>
      </div>
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
