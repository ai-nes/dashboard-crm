"use client";

import { useState } from "react";

import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";
import type { StudentNoteItem, StudentTaskItem } from "@/services/api/students/types";
import { getTaskManagementTasksForStudent } from "@/services/api/tasks/data";

import StudentAllActivitiesFeed from "./student-all-activities-feed";
import StudentAuditCard from "./student-audit-card";
import StudentCallsTab from "./student-calls-tab";
import {
  calls as mockCalls,
  notes as mockNotes,
  tasks as mockTasks,
  zaloMessages as mockZaloMessages,
} from "./student-tab-data";
import StudentNotesTab from "./student-notes-tab";
import StudentTasksTab from "./student-tasks-tab";
import StudentZaloTab from "./student-zalo-tab";
import type { Student360SectionProps, StudentNoteRecord } from "./types";

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function StudentActivitiesTab({ data, initialTaskId }: Student360SectionProps & { initialTaskId?: string }) {
  const [activeTab, setActiveTab] = useState(initialTaskId ? "tasks" : "all");
  const assignedTo = data.student.counselor || "Chưa phân công";
  const [notes, setNotes] = useState<StudentNoteRecord[]>(() =>
    (data.notes ?? mockNotes).map((note, index) => ({ ...note, id: `note-seed-${index}` })),
  );
  const [tasks, setTasks] = useState<StudentTaskItem[]>(() => {
    const managementTasks = getTaskManagementTasksForStudent(data.student.code);
    const seedTasks = data.tasks ?? (managementTasks.length > 0 ? managementTasks : mockTasks);
    return seedTasks.map((task) => ({ ...task, assignee: assignedTo }));
  });
  const zaloMessages = data.zaloMessages ?? mockZaloMessages;
  const calls = data.calls ?? mockCalls;
  const auditEvents = data.auditEvents ?? [];

  const handleCreateNote = (note: StudentNoteItem) =>
    setNotes((prev) => [{ ...note, id: generateId("note") }, ...prev]);

  const handleUpdateNote = (id: string, content: string) =>
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, content } : note)));

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
