"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  TabContent,
  TabList,
  TabRoot,
  TabTrigger,
} from "@/components/tailgrids/core/tabs";
import { useAuth } from "@/components/common/auth/auth-provider";
import { useStudentAuditLogsQuery } from "@/hooks/use-student-audit-query";
import {
  useCreateCrmTaskMutation,
  useCrmTasksQuery,
  useDeleteCrmTaskMutation,
  useUpdateCrmTaskMutation,
} from "@/hooks/use-crm-tasks-queries";
import { useTaskAssigneesQuery } from "@/hooks/use-task-assignees-query";
import {
  useCreateCrmNoteMutation,
  useCrmNotesQuery,
  useDeleteCrmNoteMutation,
  useUpdateCrmNoteMutation,
} from "@/hooks/use-crm-notes-queries";
import type { StudentAuditLog } from "@/services/api/student-audit";
import type {
  StudentNoteItem,
  StudentTaskItem,
} from "@/services/api/students/types";

import StudentAllActivitiesFeed from "./student-all-activities-feed";
import StudentAuditCard from "./student-audit-card";
import StudentCallsTab from "./student-calls-tab";
import {
  calls as mockCalls,
  zaloMessages as mockZaloMessages,
} from "./student-tab-data";
import StudentNotesTab from "./student-notes-tab";
import StudentTasksTab from "./student-tasks-tab";
import {
  crmTaskToStudentTask,
  studentTaskToCreatePayload,
  studentTaskToUpdatePayload,
} from "./student-task-mappers";
import StudentZaloTab from "./student-zalo-tab";
import type {
  Student360SectionProps,
  StudentNoteCreationOptions,
  StudentNoteRecord,
} from "./types";

interface StudentActivitiesTabProps extends Student360SectionProps {
  studentId: string;
  initialTaskId?: string;
}

const EMPTY_AUDIT_LOGS: StudentAuditLog[] = [];

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
  studentId,
  initialTaskId,
}: StudentActivitiesTabProps) {
  const { user } = useAuth();
  const taskAssigneesQuery = useTaskAssigneesQuery();
  const [activeTab, setActiveTab] = useState(initialTaskId ? "tasks" : "all");
  const assignedTo = data.student.counselor || "Chưa phân công";
  const currentUserId = user?.user || user?.email;
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
  const currentUserIdentifiers = useMemo(
    () =>
      [user?.user, user?.email]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.trim().toLowerCase()),
    [user?.email, user?.user],
  );

  // Dùng ID canonical từ URL (e.g. ENR-2026-00005), không dùng mã hiển thị/nội bộ từ payload student.
  const studentDocname = studentId.trim();

  // Gọi Frappe RPC crm.api.note.list_notes
  const { data: crmNotesData } = useCrmNotesQuery({
    referenceDoctype: "CRM Student",
    referenceDocname: studentDocname,
  });
  const crmTasksQuery = useCrmTasksQuery({
    referenceDoctype: "CRM Student",
    referenceDocname: studentDocname,
  });
  const studentAuditQuery = useStudentAuditLogsQuery({
    student: studentDocname,
    pageLength: 100,
  });

  const createNoteMutation = useCreateCrmNoteMutation();
  const updateNoteMutation = useUpdateCrmNoteMutation();
  const deleteNoteMutation = useDeleteCrmNoteMutation();
  const createTaskMutation = useCreateCrmTaskMutation();
  const updateTaskMutation = useUpdateCrmTaskMutation();
  const deleteTaskMutation = useDeleteCrmTaskMutation();

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

  const serverTasks = useMemo(
    () =>
      (crmTasksQuery.data?.tasks ?? []).map((task) =>
        crmTaskToStudentTask(task, assignedTo, taskAssignees),
      ),
    [assignedTo, crmTasksQuery.data?.tasks, taskAssignees],
  );
  const [createdTasks, setCreatedTasks] = useState<StudentTaskItem[]>([]);
  const [taskOverrides, setTaskOverrides] = useState<
    Record<string, StudentTaskItem>
  >({});
  const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string>>(
    () => new Set(),
  );
  const tasks = useMemo(() => {
    const serverIds = new Set(serverTasks.map((task) => task.id));
    const visibleServerTasks = serverTasks
      .filter((task) => !deletedTaskIds.has(task.id))
      .map((task) => taskOverrides[task.id] ?? task);
    const pendingCreatedTasks = createdTasks.filter(
      (task) => !serverIds.has(task.id) && !deletedTaskIds.has(task.id),
    );

    return [...pendingCreatedTasks, ...visibleServerTasks];
  }, [createdTasks, deletedTaskIds, serverTasks, taskOverrides]);
  const zaloMessages = data.zaloMessages ?? mockZaloMessages;
  const calls = data.calls ?? mockCalls;
  const auditEvents = studentAuditQuery.data?.logs ?? EMPTY_AUDIT_LOGS;

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
        try {
          const createdTask = await createTaskMutation.mutateAsync({
            referenceDoctype: "CRM Student",
            referenceDocname: studentDocname,
            title: getFollowUpTaskTitle(note.content),
            description: note.content,
            priority: "Medium",
            status: "Todo",
            ...(options.followUpDueDate
              ? { dueDate: `${options.followUpDueDate} 23:59:00` }
              : {}),
            ...(currentUserId ? { assignedTo: currentUserId } : {}),
          });
          setCreatedTasks((prev) => [
            crmTaskToStudentTask(createdTask, assignedTo, taskAssignees),
            ...prev,
          ]);
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

  const handleCreateTask = async (task: StudentTaskItem) => {
    const optimisticId = generateId("task");
    const optimisticTask = {
      ...task,
      id: optimisticId,
      assignee: task.assignee || assignedTo,
    };
    setCreatedTasks((prev) => [optimisticTask, ...prev]);

    try {
      const createdTask = await createTaskMutation.mutateAsync(
        studentTaskToCreatePayload(task, studentDocname, task.assigneeId),
      );
      const serverTask = crmTaskToStudentTask(
        createdTask,
        assignedTo,
        taskAssignees,
      );
      setCreatedTasks((prev) =>
        prev.map((current) =>
          current.id === optimisticId ? serverTask : current,
        ),
      );
    } catch (error) {
      setCreatedTasks((prev) =>
        prev.filter((current) => current.id !== optimisticId),
      );
      throw error;
    }
  };

  const handleUpdateTask = async (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => {
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) return;

    const updatedTask = {
      ...currentTask,
      ...updates,
      assignee: updates.assignee ?? currentTask.assignee,
    };
    setTaskOverrides((prev) => ({ ...prev, [id]: updatedTask }));

    try {
      const updatedServerTask = await updateTaskMutation.mutateAsync(
        studentTaskToUpdatePayload(id, currentTask, updates),
      );
      setTaskOverrides((prev) => ({
        ...prev,
        [id]: crmTaskToStudentTask(
          updatedServerTask,
          assignedTo,
          taskAssignees,
        ),
      }));
    } catch (error) {
      setTaskOverrides((prev) => ({ ...prev, [id]: currentTask }));
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật task.",
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    const task = tasks.find((current) => current.id === id);
    if (!task || !window.confirm(`Xóa task “${task.title}”?`)) return;

    setDeletedTaskIds((prev) => new Set(prev).add(id));
    try {
      await deleteTaskMutation.mutateAsync(id);
      toast.success("Đã xóa task.");
    } catch (error) {
      setDeletedTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa task.",
      );
    }
  };

  return (
    <TabRoot
      defaultValue="all"
      value={activeTab}
      onValueChange={setActiveTab}
      variant="minimal"
      className="rounded-none border-0"
    >
      <TabList>
        <TabTrigger value="all">Tất cả hoạt động</TabTrigger>
        <TabTrigger value="notes">Ghi chú</TabTrigger>
        <TabTrigger value="tasks">Task</TabTrigger>
        <TabTrigger value="log">Nhật ký</TabTrigger>
        <TabTrigger value="zalo">Zalo</TabTrigger>
        <TabTrigger value="calls">Cuộc gọi</TabTrigger>
      </TabList>
      <TabContent value="all">
        <StudentAllActivitiesFeed
          notes={notes}
          tasks={tasks}
          zaloMessages={zaloMessages}
          calls={calls}
          auditEvents={auditEvents}
          onUpdateTask={handleUpdateTask}
          onOpenZalo={() => setActiveTab("zalo")}
        />
      </TabContent>
      <TabContent value="notes">
        <StudentNotesTab
          studentName={data.student.name}
          notes={notes}
          onCreateNote={handleCreateNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          isCreating={
            createNoteMutation.isPending || createTaskMutation.isPending
          }
        />
      </TabContent>
      <TabContent value="tasks">
        <StudentTasksTab
          studentName={data.student.name}
          assignee={assignedTo}
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          assignees={taskAssignees}
          currentUserId={currentUserId}
          isLoadingAssignees={taskAssigneesQuery.isPending}
          isCreating={createTaskMutation.isPending}
          isLoading={crmTasksQuery.isPending}
          initialTaskId={initialTaskId}
        />
      </TabContent>
      <TabContent value="log">
        <StudentAuditCard
          events={auditEvents}
          isLoading={studentAuditQuery.isPending}
          error={studentAuditQuery.error}
        />
      </TabContent>
      <TabContent value="zalo">
        <StudentZaloTab messages={zaloMessages} />
      </TabContent>
      <TabContent value="calls">
        <StudentCallsTab calls={calls} />
      </TabContent>
    </TabRoot>
  );
}
