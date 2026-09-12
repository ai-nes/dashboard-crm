"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Button } from "@/components/tailgrids/core/button";
import {
  useCreateCrmNoteMutation,
  useCrmNotesQuery,
  useDeleteCrmNoteMutation,
  useUpdateCrmNoteMutation,
} from "@/hooks/use-crm-notes-queries";
import type { CRMNote } from "@/services/api/crm-notes";
import { formatDateTime } from "@/utils/format-date";

import StudentActivityCard from "../../students/_components/student-activity-card";
import StudentActivityGroup from "../../students/_components/student-activity-group";
import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
} from "../../students/_components/student-activity-toolbar";
import {
  activityTimeFilterOptions,
  groupActivitiesByDate,
  matchesActivityTimeFilter,
  parseStudentActivityDate,
  type ActivityTimeFilter,
} from "../../students/_components/student-activity-utils";
import StudentInlineEditableRichText from "../../students/_components/student-inline-editable-rich-text";
import { StudentNotesSkeleton } from "../../students/_components/student-activity-skeleton";
import LeadCreateNoteDialog from "./lead-create-note-dialog";

interface LeadNotesTabProps {
  leadId: string;
  leadName: string;
  enabled?: boolean;
  canManageNotes?: boolean;
}

interface LeadNoteRecord {
  id: string;
  author: string;
  date: string;
  content: string;
}

function toLeadNoteRecord(note: CRMNote): LeadNoteRecord {
  return {
    id: note.name,
    author: note.ownerFullName || note.owner || "Hệ thống",
    date: note.modified || note.creation || "",
    content: note.content,
  };
}

function isContentEmpty(value: string): boolean {
  return value.replace(/<[^>]*>/g, "").trim().length === 0;
}

export default function LeadNotesTab({
  leadId,
  leadName,
  enabled = true,
  canManageNotes = false,
}: LeadNotesTabProps) {
  const notesQuery = useCrmNotesQuery(
    {
      referenceDoctype: "CRM Lead",
      referenceDocname: leadId,
      pageLength: 100,
    },
    { enabled },
  );
  const createMutation = useCreateCrmNoteMutation();
  const updateMutation = useUpdateCrmNoteMutation();
  const deleteMutation = useDeleteCrmNoteMutation();
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<ActivityTimeFilter>("all");
  const [expansionMode, setExpansionMode] =
    useState<ActivityExpansionMode>("collapse");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<LeadNoteRecord | null>(null);

  const notes = useMemo(
    () => (notesQuery.data?.notes ?? []).map(toLeadNoteRecord),
    [notesQuery.data?.notes],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi-VN");
    return notes.filter((note) => {
      const matchesTime = matchesActivityTimeFilter(note.date, timeFilter);
      const matchesSearch =
        !query ||
        note.content.toLocaleLowerCase("vi-VN").includes(query) ||
        note.author.toLocaleLowerCase("vi-VN").includes(query);
      return matchesTime && matchesSearch;
    });
  }, [notes, search, timeFilter]);

  const groupedNotes = useMemo(
    () =>
      groupActivitiesByDate(filteredNotes, (note) =>
        parseStudentActivityDate(note.date),
      ),
    [filteredNotes],
  );

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedIds(
      new Set(mode === "expand" ? notes.map((note) => note.id) : []),
    );
  };

  const handleCreate = async (content: string) => {
    try {
      await createMutation.mutateAsync({
        referenceDoctype: "CRM Lead",
        referenceDocname: leadId,
        content,
      });
      toast.success("Đã tạo ghi chú.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo ghi chú.",
      );
      throw error;
    }
  };

  const handleUpdate = async (id: string, content: string) => {
    if (isContentEmpty(content)) {
      toast.error("Nội dung ghi chú không được để trống.");
      return;
    }

    try {
      await updateMutation.mutateAsync({ name: id, content });
      toast.success("Đã cập nhật ghi chú.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật ghi chú.",
      );
    }
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;

    try {
      await deleteMutation.mutateAsync(noteToDelete.id);
      setNoteToDelete(null);
      toast.success("Đã xóa ghi chú.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa ghi chú.",
      );
    }
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
        onCreate={canManageNotes ? () => setIsCreateOpen(true) : undefined}
        createLabel="Thêm ghi chú"
      />

      <div className="w-full max-w-md">
        <ActivityFilterSelect
          ariaLabel="Lọc ghi chú theo thời gian"
          triggerLabel="Tất cả thời gian"
          value={timeFilter}
          options={activityTimeFilterOptions}
          onChange={(value) => setTimeFilter(value as ActivityTimeFilter)}
        />
      </div>

      {notesQuery.isPending ? (
        <StudentNotesSkeleton />
      ) : notesQuery.isError ? (
        <div className="space-y-3 py-2">
          <p className="text-xs text-error-600">
            Không thể tải ghi chú: {notesQuery.error.message}
          </p>
          <Button
            size="sm"
            appearance="outline"
            onPress={() => void notesQuery.refetch()}
          >
            Thử lại
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">
          Chưa có ghi chú nào phù hợp.
        </p>
      ) : (
        <div className="space-y-6">
          {groupedNotes.map((group) => (
            <StudentActivityGroup
              key={group.id}
              id={`lead-notes-${group.id}`}
              label={group.label}
              count={group.items.length}
            >
              {group.items.map((note) => (
                <StudentActivityCard
                  key={note.id}
                  title={
                    <>
                      <strong className="font-semibold text-text-primary">
                        Ghi chú
                      </strong>{" "}
                      của {note.author}
                    </>
                  }
                  timestamp={formatDateTime(note.date)}
                  preview={<LeadNotePreview content={note.content} />}
                  expanded={expandedIds.has(note.id)}
                  onExpandedChange={(expanded) =>
                    setExpandedIds((current) => {
                      const next = new Set(current);
                      if (expanded) next.add(note.id);
                      else next.delete(note.id);
                      return next;
                    })
                  }
                >
                  {canManageNotes ? (
                    <StudentInlineEditableRichText
                      value={note.content}
                      onCommit={(content) =>
                        void handleUpdate(note.id, content)
                      }
                      placeholder="Nhập nội dung ghi chú..."
                    />
                  ) : (
                    <LeadNotePreview content={note.content} />
                  )}
                  {canManageNotes ? (
                    <div className="mt-3 flex justify-end border-t border-card-border/40 pt-2">
                      <Button
                        appearance="ghost"
                        size="xs"
                        className="font-medium text-error-500 hover:bg-error-500/10"
                        isDisabled={deleteMutation.isPending}
                        onPress={() => setNoteToDelete(note)}
                      >
                        Xóa ghi chú
                      </Button>
                    </div>
                  ) : null}
                </StudentActivityCard>
              ))}
            </StudentActivityGroup>
          ))}
        </div>
      )}

      <LeadCreateNoteDialog
        isOpen={isCreateOpen}
        leadName={leadName}
        isSubmitting={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
      />
      <DeleteRecordDialog
        isDeleting={deleteMutation.isPending}
        isOpen={noteToDelete !== null}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setNoteToDelete(null);
        }}
        recordName={
          noteToDelete ? `Ghi chú của ${noteToDelete.author}` : "Ghi chú"
        }
        recordType="ghi chú"
      />
    </div>
  );
}

function LeadNotePreview({ content }: { content: string }) {
  return (
    <div
      className="text-sm leading-6 text-text-secondary [&_a]:text-primary-500 [&_a]:underline [&_p]:my-1"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
