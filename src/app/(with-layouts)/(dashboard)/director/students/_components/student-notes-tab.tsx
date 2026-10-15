"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import type { StudentNoteItem } from "@/services/api/students/types";
import { formatDate, formatDateTime } from "@/utils/format-date";
import { Badge } from "@/components/tailgrids/core/badge";
import type { AiMemoryItem } from "@/services/api/student-ai";

import StudentActivityCard from "./student-activity-card";
import StudentActivityGroup from "./student-activity-group";
import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
} from "./student-activity-toolbar";
import { StudentNotesSkeleton } from "./student-activity-skeleton";
import {
  activityTimeFilterOptions,
  groupActivitiesByDate,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "./student-activity-utils";
import StudentCreateNoteDialog from "./student-create-note-dialog";
import StudentInlineEditableRichText from "./student-inline-editable-rich-text";
import type { StudentNoteCreationOptions, StudentNoteRecord } from "./types";
import StudentMemoryNoteEditor from "./student-memory-note-editor";
import StudentMemoryNoteSource, {
  memoryStatusLabels,
  memorySourceLabel,
} from "./student-memory-note-source";

interface StudentNotesTabProps {
  studentName: string;
  notes: StudentNoteRecord[];
  memoryItems?: AiMemoryItem[];
  memoryError?: string;
  studentId?: string;
  canEditMemory?: boolean;
  onCreateNote: (
    note: StudentNoteItem,
    options: StudentNoteCreationOptions,
  ) => Promise<void>;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote?: (id: string) => void;
  isCreating?: boolean;
  isLoading?: boolean;
  canCreateFollowUpTask: boolean;
  followUpTaskDisabledReason?: string;
}

export default function StudentNotesTab({
  studentName,
  notes,
  memoryItems = [],
  memoryError,
  studentId,
  canEditMemory = false,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  isCreating = false,
  isLoading = false,
  canCreateFollowUpTask,
  followUpTaskDisabledReason,
}: StudentNotesTabProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] =
    useState<ActivityExpansionMode>("collapse");
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(
    () => new Set(notes.map((note) => note.id)),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");
  const [sourceTarget, setSourceTarget] = useState<{ id: string } | null>(null);
  useEffect(() => {
    if (!sourceTarget) return;
    const element = document.getElementById(
      `student-note-${encodeURIComponent(sourceTarget.id)}`,
    );
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.focus({ preventScroll: true });
  }, [sourceTarget]);
  const openSource = (id: string) => {
    setSearch("");
    setTimeFilter("all");
    setStatusFilter("active");
    setExpandedNoteIds((current) => new Set([...current, id]));
    setSourceTarget({ id });
  };

  const visibleNotes = useMemo(
    (): (StudentNoteRecord & { memory?: AiMemoryItem })[] =>
      [
        ...notes.filter((note) => note.author !== "AI Student Insight"),
        ...memoryItems.map((item) => ({
          id: `memory:${item.id}`,
          author: item.source === "ai" ? "AI" : "Tư vấn viên",
          date: item.valid_from,
          content: item.text,
          memory: item,
        })),
      ].sort(
        (a, b) =>
          parseStudentActivityDate(b.date).getTime() -
          parseStudentActivityDate(a.date).getTime(),
      ),
    [notes, memoryItems],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return visibleNotes.filter((note) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? !note.memory || note.memory.status === "open"
          : note.memory?.status === statusFilter);
      const matchesTime = matchesActivityTimeFilter(note.date, timeFilter);
      const matchesSearch =
        !query ||
        note.content.toLowerCase().includes(query) ||
        note.author.toLowerCase().includes(query);
      return matchesTime && matchesSearch && matchesStatus;
    });
  }, [visibleNotes, timeFilter, search, statusFilter]);

  const groupedNotes = useMemo(
    () =>
      groupActivitiesByDate(filteredNotes, (note) =>
        parseStudentActivityDate(note.date),
      ),
    [filteredNotes],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedNoteIds(
      new Set(mode === "expand" ? visibleNotes.map((note) => note.id) : []),
    );
  };

  const handleNoteExpandedChange = (id: string, expanded: boolean) => {
    setExpandedNoteIds((current) => {
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
        searchPlaceholder="Tìm ghi chú..."
        searchLabel="Tìm ghi chú"
        expansionMode={expansionMode}
        onExpansionModeChange={handleExpansionModeChange}
        onCreate={() => setDialogOpen(true)}
        createLabel="Thêm ghi chú"
      />

      {memoryError && (
        <p role="alert" className="text-sm text-text-secondary">
          {memoryError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="w-fit">
          <ActivityFilterSelect
            ariaLabel="Lọc theo thời gian"
            triggerLabel="Tất cả thời gian"
            value={timeFilter}
            options={activityTimeFilterOptions}
            onChange={(value) => setTimeFilter(value as ActivityTimeFilter)}
          />
        </div>
        <div className="w-fit">
          <ActivityFilterSelect
            ariaLabel="Lọc trạng thái ghi chú"
            triggerLabel="Tất cả ghi chú"
            value={statusFilter}
            options={[
              { id: "active", label: "Đang sử dụng" },
              { id: "all", label: "Tất cả ghi chú" },
              { id: "done", label: "Đã hoàn tất" },
              { id: "contradicted", label: "Đã loại bỏ" },
              { id: "superseded", label: "Đã thay thế" },
            ]}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {isLoading ? (
        <StudentNotesSkeleton />
      ) : filteredNotes.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">
          Chưa có ghi chú nào phù hợp.
        </p>
      ) : (
        <div className="space-y-6">
          {groupedNotes.map((group) => (
            <StudentActivityGroup
              key={group.id}
              id={`notes-group-${group.id}`}
              label={group.label}
              count={group.items.length}
            >
              {group.items.map((note) => (
                <div
                  key={note.id}
                  id={`student-note-${encodeURIComponent(note.id)}`}
                  tabIndex={-1}
                  className="scroll-mt-6 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <StudentActivityCard
                    title={
                      <>
                        <strong className="font-semibold text-text-primary">
                          Ghi chú
                        </strong>{" "}
                        {note.memory ? (
                          <Badge size="sm" color="gray">
                            {memorySourceLabel(note.memory)}
                          </Badge>
                        ) : (
                          <>của {note.author}</>
                        )}
                      </>
                    }
                    timestamp={formatDateTime(note.date)}
                    preview={
                      note.memory ? (
                        <TrackedNote item={note.memory} />
                      ) : (
                        <StudentNotePreview content={note.content} />
                      )
                    }
                    expanded={expandedNoteIds.has(note.id)}
                    onExpandedChange={(expanded) =>
                      handleNoteExpandedChange(note.id, expanded)
                    }
                    footer={
                      note.memory ? (
                        <footer className="space-y-3 border-t border-border-primary px-4 py-3 sm:px-5">
                          <StudentMemoryNoteSource
                            item={note.memory}
                            availableNoteIds={notes.map((item) => item.id)}
                            onOpenSource={openSource}
                          />
                          {studentId && canEditMemory && (
                            <StudentMemoryNoteEditor
                              studentId={studentId}
                              item={note.memory}
                              canEdit={canEditMemory}
                            />
                          )}
                        </footer>
                      ) : undefined
                    }
                  >
                    {note.memory ? (
                      <>
                        <TrackedNote item={note.memory} />
                      </>
                    ) : (
                      <StudentInlineEditableRichText
                        value={note.content}
                        onCommit={(content) => onUpdateNote(note.id, content)}
                        placeholder="Nhập nội dung ghi chú..."
                      />
                    )}
                    {!note.memory && onDeleteNote && (
                      <div className="mt-3 flex justify-end border-t border-card-border/40 pt-2">
                        <Button
                          appearance="ghost"
                          size="xs"
                          className="font-medium text-error-500 hover:bg-error-500/10"
                          onPress={() => onDeleteNote(note.id)}
                        >
                          Xóa ghi chú
                        </Button>
                      </div>
                    )}
                  </StudentActivityCard>
                </div>
              ))}
            </StudentActivityGroup>
          ))}
        </div>
      )}

      <StudentCreateNoteDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        studentName={studentName}
        onCreate={onCreateNote}
        isSubmitting={isCreating}
        canCreateFollowUpTask={canCreateFollowUpTask}
        followUpTaskDisabledReason={followUpTaskDisabledReason}
      />
    </div>
  );
}

function TrackedNote({ item }: { item: AiMemoryItem }) {
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-line text-sm leading-6 text-text-secondary">
        {item.text}
      </p>
      <p className="text-xs text-text-tertiary">
        {
          { student: "Học sinh", parent: "Phụ huynh", sale: "Tư vấn viên" }[
            item.subject
          ]
        }
        {item.due ? ` · Hạn: ${formatDate(item.due)}` : ""}
        {item.status !== "open" ? ` · ${memoryStatusLabels[item.status]}` : ""}
      </p>
    </div>
  );
}

function StudentNotePreview({ content }: { content: string }) {
  return (
    <div
      className="text-sm leading-6 text-text-secondary [&_a]:text-primary-500 [&_a]:underline [&_p]:my-1"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
