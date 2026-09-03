"use client";

import { useMemo, useState } from "react";

import type { StudentNoteItem } from "@/services/api/students/types";
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
import StudentCreateNoteSheet from "./student-create-note-sheet";
import StudentInlineEditableRichText from "./student-inline-editable-rich-text";
import type { StudentNoteRecord } from "./types";

interface StudentNotesTabProps {
  studentName: string;
  notes: StudentNoteRecord[];
  onCreateNote: (note: StudentNoteItem) => void;
  onUpdateNote: (id: string, content: string) => void;
}

export default function StudentNotesTab({
  studentName,
  notes,
  onCreateNote,
  onUpdateNote,
}: StudentNotesTabProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] = useState<ActivityExpansionMode>("collapse");
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(
    () => new Set(notes.map((note) => note.id)),
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const visibleNotes = useMemo(
    () => notes.filter((note) => note.author !== "AI Student Insight"),
    [notes],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return visibleNotes.filter((note) => {
      const matchesTime = matchesActivityTimeFilter(note.date, timeFilter);
      const matchesSearch =
        !query ||
        note.content.toLowerCase().includes(query) ||
        note.author.toLowerCase().includes(query);
      return matchesTime && matchesSearch;
    });
  }, [visibleNotes, timeFilter, search]);

  const groupedNotes = useMemo(
    () => groupActivitiesByDate(filteredNotes, (note) => parseStudentActivityDate(note.date)),
    [filteredNotes],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedNoteIds(new Set(mode === "expand" ? notes.map((note) => note.id) : []));
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
        onCreate={() => setSheetOpen(true)}
        createLabel="Thêm ghi chú"
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

      {filteredNotes.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có ghi chú nào phù hợp.</p>
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
                <StudentActivityCard
                  key={note.id}
                  title={
                    <>
                      <strong className="font-semibold text-text-primary">Ghi chú</strong> bởi {note.author}
                    </>
                  }
                  timestamp={formatDateTime(note.date)}
                  preview={<StudentNotePreview content={note.content} />}
                  expanded={expandedNoteIds.has(note.id)}
                  onExpandedChange={(expanded) => handleNoteExpandedChange(note.id, expanded)}
                >
                  <StudentInlineEditableRichText
                    value={note.content}
                    onCommit={(content) => onUpdateNote(note.id, content)}
                    placeholder="Nhập nội dung ghi chú..."
                  />
                </StudentActivityCard>
              ))}
            </StudentActivityGroup>
          ))}
        </div>
      )}

      <StudentCreateNoteSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        studentName={studentName}
        onCreate={onCreateNote}
      />
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
