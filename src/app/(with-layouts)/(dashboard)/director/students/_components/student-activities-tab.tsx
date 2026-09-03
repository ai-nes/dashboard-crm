"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  useCreateCrmNoteMutation,
  useCrmNotesQuery,
  useDeleteCrmNoteMutation,
  useUpdateCrmNoteMutation,
} from "@/hooks/use-crm-notes-queries";
import type { StudentNoteItem, StudentTaskItem } from "@/services/api/students/types";
import { getTaskManagementTasksForStudent } from "@/services/api/tasks/data";

import StudentAllActivitiesFeed from "./student-all-activities-feed";
import StudentAuditCard from "./student-audit-card";
import StudentCallsTab from "./student-calls-tab";
import {
  calls as mockCalls,
  tasks as mockTasks,
  zaloMessages as mockZaloMessages,
} from "./student-tab-data";
import StudentNotesTab from "./student-notes-tab";
import StudentTasksTab from "./student-tasks-tab";
import StudentZaloTab from "./student-zalo-tab";
import type { Student360SectionProps, StudentNoteRecord } from "./types";

interface StudentActivitiesTabProps extends Student360SectionProps {
  studentId: string;
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

export default function StudentActivitiesTab({
  data,
  studentId,
  initialTaskId,
}: StudentActivitiesTabProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTaskId ? "tasks" : "all");
  const assignedTo = data.student.counselor || "Chưa phân công";
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

  const createNoteMutation = useCreateCrmNoteMutation();
  const updateNoteMutation = useUpdateCrmNoteMutation();
  const deleteNoteMutation = useDeleteCrmNoteMutation();

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

  const [tasks, setTasks] = useState<StudentTaskItem[]>(() => {
    const managementTasks = getTaskManagementTasksForStudent(data.student.code);
    const seedTasks = data.tasks ?? (managementTasks.length > 0 ? managementTasks : mockTasks);
    return seedTasks.map((task) => ({ ...task, assignee: assignedTo }));
  });
  const zaloMessages = data.zaloMessages ?? mockZaloMessages;
  const calls = data.calls ?? mockCalls;
  const auditEvents = data.auditEvents ?? [];

  // Tạo ghi chú qua crm.api.note.create_note
  const handleCreateNote = async (note: StudentNoteItem) => {
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
          createdNote.modified ||
          createdNote.creation ||
          optimisticRecord.date,
        content: createdNote.content || note.content,
      };

      // Thay bản optimistic bằng bản server để query refetch không render trùng note.
      setLocalNotes((prev) =>
        prev.map((localNote) =>
          localNote.id === optimisticId ? createdRecord : localNote,
        ),
      );
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

  const handleCreateTask = (task: StudentTaskItem) =>
    setTasks((prev) => [{ ...task, assignee: assignedTo }, ...prev]);

  const handleUpdateTask = (id: string, updates: Partial<StudentTaskItem>) =>
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates, assignee: assignedTo } : task,
      ),
    );

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
          isCreating={createNoteMutation.isPending}
        />
      </TabContent>
      <TabContent value="tasks">
        <StudentTasksTab
          studentName={data.student.name}
          assignee={assignedTo}
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          initialTaskId={initialTaskId}
        />
      </TabContent>
      <TabContent value="log">
        <StudentAuditCard data={data} />
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
