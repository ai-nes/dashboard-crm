"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmPermissions } from "@/components/common/auth/permissions";
import DetailTabs, {
  type DetailTabItem,
} from "@/components/common/detail-tabs";
import {
  useStudentChatwootInteractionsQuery,
  useStudentInteractionsQuery,
} from "@/hooks/use-students-queries";
import { useCreateCrmTaskMutation } from "@/hooks/use-crm-tasks-queries";
import { useTaskAssigneesQuery } from "@/hooks/use-task-assignees-query";
import {
  useCreateCrmNoteMutation,
  useCrmNotesQuery,
  useDeleteCrmNoteMutation,
  useUpdateCrmNoteMutation,
} from "@/hooks/use-crm-notes-queries";
import {
  useCompleteActionMutation,
  useStartActionMutation,
  useStudentWorklistActionsQuery,
} from "@/hooks/use-student-worklist-queries";
import {
  generateIdempotencyKey,
  type StudentWorklistItem,
} from "@/services/api/student-worklist";
import type {
  StudentChatwootInteractionsResponse,
  StudentInteractionsResponse,
  StudentNoteItem,
} from "@/services/api/students/types";

import StudentCallsTab from "./student-calls-tab";
import StudentNotesTab from "./student-notes-tab";
import StudentTasksTab from "./student-tasks-tab";
import {
  getTaskAssignmentMessage,
  resolveStudentTaskAssignee,
} from "./student-task-assignee-policy";
import StudentZaloTab from "./student-zalo-tab";
import type {
  Student360SectionProps,
  StudentNoteCreationOptions,
  StudentNoteRecord,
} from "./types";

interface StudentActivitiesTabProps extends Student360SectionProps {
  defaultSelectedKey: string;
  detailTabs: DetailTabItem[];
  studentId: string;
  initialChatwootInteractions?: StudentChatwootInteractionsResponse | null;
  initialStudentInteractions?: StudentInteractionsResponse | null;
  initialTaskId?: string;
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function resolveNoteAuthor(
  owner: string | undefined,
  ownerFullName: string | undefined,
  modifiedBy: string | undefined,
  currentUserIdentifiers: string[],
  fallback: string,
) {
  const normalizedOwner = owner?.trim().toLowerCase();
  const isCurrentUser = Boolean(
    normalizedOwner && currentUserIdentifiers.includes(normalizedOwner),
  );

  if (isCurrentUser) return "Bạn";
  return ownerFullName || owner || modifiedBy || fallback;
}

function getFollowUpTaskTitle(content: string): string {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const preview = plainText.slice(0, 80);
  return `Theo dõi: ${preview}${plainText.length > 80 ? "…" : ""}`;
}

export default function StudentActivitiesTab({
  data,
  defaultSelectedKey,
  detailTabs,
  studentId,
  initialChatwootInteractions,
  initialStudentInteractions,
  initialTaskId,
}: StudentActivitiesTabProps) {
  const { user } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const taskAssigneesQuery = useTaskAssigneesQuery();
  const assignedTo = data.student.counselor || "Chưa phân công";
  const taskAssignees = useMemo(() => {
    const currentSessionUser = user
      ? {
          name: user.user,
          email: user.email,
          full_name: user.full_name,
          roles: user.roles,
          crm_profile: user.crm_profile,
        }
      : null;
    const users = currentSessionUser
      ? [currentSessionUser, ...(taskAssigneesQuery.data ?? [])]
      : (taskAssigneesQuery.data ?? []);

    return users.filter(
      (candidate, index, allUsers) =>
        allUsers.findIndex((item) => item.name === candidate.name) === index,
    );
  }, [taskAssigneesQuery.data, user]);
  const studentTaskAssignee = resolveStudentTaskAssignee(
    assignedTo,
    taskAssignees,
  );
  const taskAssignmentMessage = getTaskAssignmentMessage(
    assignedTo,
    studentTaskAssignee,
    {
      isLoading: taskAssigneesQuery.isPending,
      hasError: taskAssigneesQuery.isError,
    },
  );
  const canCreateTask = Boolean(
    permissions.task.canCreate &&
    studentTaskAssignee &&
    !taskAssigneesQuery.isPending &&
    !taskAssigneesQuery.isError,
  );
  const taskCreationDisabledReason = permissions.task.canCreate
    ? taskAssignmentMessage || undefined
    : "CTV Sale không có quyền tạo task.";
  const currentUserIdentifiers = useMemo(
    () =>
      [user?.user, user?.email]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.trim().toLowerCase()),
    [user?.email, user?.user],
  );

  // Task/Action APIs use CRM Student; the backend resolves a legacy Lead route ID
  // to its canonical Student during the migration window.
  const studentDocname = studentId.trim();
  const chatwootInteractionsQuery = useStudentChatwootInteractionsQuery(
    studentDocname,
    {
      initialData: initialChatwootInteractions ?? undefined,
    },
  );
  const studentInteractionsQuery = useStudentInteractionsQuery(studentDocname, {
    initialData: initialStudentInteractions ?? undefined,
  });

  // Student Detail stores activity references on the canonical CRM Student.
  const { data: crmNotesData } = useCrmNotesQuery({
    referenceDoctype: "CRM Student",
    referenceDocname: studentDocname,
  });
  const worklistQuery = useStudentWorklistActionsQuery(studentDocname);

  const createNoteMutation = useCreateCrmNoteMutation();
  const updateNoteMutation = useUpdateCrmNoteMutation();
  const deleteNoteMutation = useDeleteCrmNoteMutation();
  const createTaskMutation = useCreateCrmTaskMutation();
  const startActionMutation = useStartActionMutation(studentDocname);
  const completeActionMutation = useCompleteActionMutation(studentDocname);
  const [startingActionName, setStartingActionName] = useState<string | null>(
    null,
  );

  // State cục bộ phục vụ optimistic updates và offline fallback
  const [localNotes, setLocalNotes] = useState<StudentNoteRecord[]>([]);

  // Kết hợp dữ liệu từ crm.api.note.list_notes và local optimistic state
  const crmNotes = crmNotesData?.notes;
  const notes = useMemo<StudentNoteRecord[]>(() => {
    if (!crmNotes || crmNotes.length === 0) {
      return localNotes;
    }

    const serverNotes: StudentNoteRecord[] = crmNotes.map((n) => ({
      id: n.name,
      name: n.name,
      author: resolveNoteAuthor(
        n.owner,
        n.ownerFullName,
        n.modifiedBy,
        currentUserIdentifiers,
        assignedTo,
      ),
      date: n.modified || n.creation || new Date().toISOString(),
      content: n.content,
    }));

    const serverIds = new Set(serverNotes.map((n) => n.id));
    const pendingLocal = localNotes.filter(
      (n) => !serverIds.has(n.id) && !serverIds.has(n.name || ""),
    );

    return [...pendingLocal, ...serverNotes];
  }, [crmNotes, localNotes, assignedTo, currentUserIdentifiers]);

  const zaloMessages =
    chatwootInteractionsQuery.data?.zalo_messages ?? data.zaloMessages ?? [];
  const calls = studentInteractionsQuery.data?.calls ?? [];

  // Tạo ghi chú qua crm.api.note.create_note
  const handleCreateNote = async (
    note: StudentNoteItem,
    options: StudentNoteCreationOptions,
  ) => {
    const optimisticId = generateId("note");
    const optimisticRecord: StudentNoteRecord = {
      ...note,
      id: optimisticId,
    };
    setLocalNotes((prev) => [optimisticRecord, ...prev]);

    try {
      const createdNote = await createNoteMutation.mutateAsync({
        referenceDoctype: "CRM Student",
        referenceDocname: studentDocname,
        content: note.content,
      });

      const createdId = createdNote.name || optimisticId;
      const createdRecord: StudentNoteRecord = {
        id: createdId,
        name: createdId,
        author: resolveNoteAuthor(
          createdNote.owner,
          createdNote.ownerFullName,
          createdNote.modifiedBy,
          currentUserIdentifiers,
          currentUserIdentifiers.length > 0 ? "Bạn" : assignedTo,
        ),
        date:
          createdNote.modified || createdNote.creation || optimisticRecord.date,
        content: createdNote.content || note.content,
      };

      // Thay bản optimistic bằng bản server để query refetch không render trùng note.
      setLocalNotes((prev) =>
        prev.map((localNote) =>
          localNote.id === optimisticId ? createdRecord : localNote,
        ),
      );

      if (options.createFollowUpTask) {
        if (!canCreateTask || !studentTaskAssignee) {
          toast.error(
            `Ghi chú đã tạo nhưng ${
              taskAssignmentMessage ||
              "student chưa được giao cho Sale/CTV nên chưa thể tạo task."
            }`,
          );
          return;
        }

        try {
          await createTaskMutation.mutateAsync({
            referenceDoctype: "CRM Student",
            referenceDocname: studentDocname,
            title: getFollowUpTaskTitle(note.content),
            description: note.content,
            priority: "Medium",
            status: "Todo",
            ...(options.followUpDueDate
              ? { dueDate: `${options.followUpDueDate} 23:59:00` }
              : {}),
            assignedTo: studentTaskAssignee.name,
          });
          toast.success("Đã tạo task follow-up từ ghi chú.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? `Ghi chú đã tạo nhưng ${error.message.toLowerCase()}`
              : "Ghi chú đã tạo nhưng không thể tạo task follow-up.",
          );
        }
      }
    } catch {
      // Khi offline hoặc backend dev chưa khởi chạy, giữ optimistic state để đảm bảo trải nghiệm
    }
  };

  // Cập nhật ghi chú qua crm.api.note.update_note
  const handleUpdateNote = async (id: string, content: string) => {
    setLocalNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content } : note)),
    );

    try {
      await updateNoteMutation.mutateAsync({
        name: id,
        content,
      });
      toast.success("Đã cập nhật nội dung ghi chú.");
    } catch {
      // Giữ nguyên cập nhật trong giao diện
    }
  };

  // Xóa ghi chú qua crm.api.note.delete_note
  const handleDeleteNote = async (id: string) => {
    setLocalNotes((prev) => prev.filter((note) => note.id !== id));

    try {
      await deleteNoteMutation.mutateAsync(id);
      toast.success("Đã xóa ghi chú.");
    } catch {
      // Giữ nguyên xóa trong giao diện
    }
  };

  const handleStartAction = async (action: StudentWorklistItem) => {
    setStartingActionName(action.name);
    try {
      await startActionMutation.mutateAsync({
        action: action.name,
        expectedActionRevision: action.revision,
        idempotencyKey: generateIdempotencyKey(`start-${action.name}`),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể bắt đầu công việc.",
      );
    } finally {
      setStartingActionName(null);
    }
  };

  const handleCompleteAction = async (
    action: StudentWorklistItem,
    input: { outcomeCode: string; outcomeNotes?: string },
  ) => {
    await completeActionMutation.mutateAsync({
      action: action.name,
      expectedActionRevision: action.revision,
      expectedPackageRevision: action.packageRevision,
      idempotencyKey: generateIdempotencyKey(`complete-${action.name}`),
      outcomeCode: input.outcomeCode,
      outcomeNotes: input.outcomeNotes,
    });
  };

  return (
    <>
      <DetailTabs
        ariaLabel="Các phần trong hồ sơ học sinh"
        defaultSelectedKey={defaultSelectedKey}
        tabs={[
          ...detailTabs.slice(0, 1),
          ...detailTabs.filter(
            (tab) => tab.id === "profile" || tab.id === "records",
          ),
          {
            id: "tasks",
            label: "Task",
            content: (
              <StudentTasksTab
                actions={worklistQuery.data?.items ?? []}
                isLoading={worklistQuery.isPending}
                startingActionName={startingActionName}
                isCompleting={completeActionMutation.isPending}
                initialTaskId={initialTaskId}
                onStart={handleStartAction}
                onComplete={handleCompleteAction}
              />
            ),
          },
          {
            id: "notes",
            label: "Ghi chú",
            content: (
              <StudentNotesTab
                studentName={data.student.name}
                notes={notes}
                onCreateNote={handleCreateNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                isCreating={
                  createNoteMutation.isPending || createTaskMutation.isPending
                }
                canCreateFollowUpTask={canCreateTask}
                followUpTaskDisabledReason={taskCreationDisabledReason}
              />
            ),
          },
          {
            id: "zalo",
            label: "Zalo",
            content: <StudentZaloTab messages={zaloMessages} />,
          },
          {
            id: "calls",
            label: "Cuộc gọi",
            content: <StudentCallsTab calls={calls} />,
          },
          ...detailTabs.filter((tab) => tab.id === "audit"),
        ]}
      />
    </>
  );
}
