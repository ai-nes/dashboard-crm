"use client";

import { useEffect, useMemo, useState } from "react";

import type { SessionUser } from "@/services/api/auth";
import type { StudentTaskItem } from "@/services/api/students/types";

import StudentCreateTaskDialog from "./student-create-task-dialog";
import StudentTaskFilters, {
  type TaskExpansionMode,
  type TaskPriorityFilter,
  type TaskTimeFilter,
} from "./student-task-filters";
import StudentTaskCard, { isTaskOverdue } from "./student-task-card";
import {
  matchesActivityTimeFilter,
  parseStudentActivityDate,
} from "./student-activity-utils";

interface StudentTasksTabProps {
  studentName: string;
  assignee: string;
  tasks: StudentTaskItem[];
  onCreateTask: (task: StudentTaskItem) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<StudentTaskItem>) => void;
  onDeleteTask: (id: string) => void;
  assignees: SessionUser[];
  currentUserId?: string;
  isLoadingAssignees?: boolean;
  isCreating?: boolean;
  isLoading?: boolean;
  initialTaskId?: string;
}

interface StudentTaskGroup {
  id: string;
  label: string;
  tasks: StudentTaskItem[];
  sortTime: number;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTaskGroup(task: StudentTaskItem): Omit<StudentTaskGroup, "tasks"> {
  if (isTaskOverdue(task)) {
    return { id: "overdue", label: "Quá hạn", sortTime: Number.MIN_SAFE_INTEGER };
  }

  const taskDate = parseStudentActivityDate(task.dueDate);
  if (taskDate.getTime() === 0) {
    return { id: "unscheduled", label: "Chưa đặt hạn", sortTime: Number.MAX_SAFE_INTEGER };
  }

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (taskDate.getTime() === today.getTime()) {
    return { id: "today", label: "Hôm nay", sortTime: taskDate.getTime() };
  }

  if (taskDate.getTime() === tomorrow.getTime()) {
    return { id: "tomorrow", label: "Ngày mai", sortTime: taskDate.getTime() };
  }

  return {
    id: `date-${taskDate.getFullYear()}-${taskDate.getMonth()}-${taskDate.getDate()}`,
    label: taskDate.toLocaleDateString("vi-VN"),
    sortTime: taskDate.getTime(),
  };
}

function groupTasks(tasks: StudentTaskItem[]): StudentTaskGroup[] {
  const groups = new Map<string, StudentTaskGroup>();

  for (const task of tasks) {
    const group = getTaskGroup(task);
    const existing = groups.get(group.id);
    if (existing) {
      existing.tasks.push(task);
    } else {
      groups.set(group.id, { ...group, tasks: [task] });
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.sortTime - b.sortTime);
}

export default function StudentTasksTab({
  studentName,
  assignee,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  assignees,
  currentUserId,
  isLoadingAssignees = false,
  isCreating = false,
  isLoading = false,
  initialTaskId,
}: StudentTasksTabProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TaskTimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentTaskItem["status"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>("all");
  const [expansionMode, setExpansionMode] = useState<TaskExpansionMode>("collapse");
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    () => new Set(tasks.map((task) => task.id)),
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!initialTaskId) return;
    document.getElementById(`student-task-${initialTaskId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [initialTaskId]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesTime = matchesActivityTimeFilter(task.dueDate, timeFilter);
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query);
      return matchesTime && matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, timeFilter, statusFilter, priorityFilter, search]);

  const taskGroups = useMemo(() => groupTasks(filteredTasks), [filteredTasks]);

  const handleExpansionModeChange = (mode: TaskExpansionMode) => {
    setExpansionMode(mode);
    setExpandedTaskIds(new Set(mode === "expand" ? tasks.map((task) => task.id) : []));
  };

  const handleTaskExpandedChange = (id: string, expanded: boolean) => {
    setExpandedTaskIds((current) => {
      const next = new Set(current);
      if (expanded) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleCreateTask = async (task: StudentTaskItem) => {
    await onCreateTask(task);
    setExpandedTaskIds((current) => new Set(current).add(task.id));
  };

  return (
    <div className="space-y-4">
      <StudentTaskFilters
        search={search}
        onSearchChange={setSearch}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        expansionMode={expansionMode}
        onExpansionModeChange={handleExpansionModeChange}
        onCreateTask={() => setDialogOpen(true)}
      />

      {isLoading ? (
        <p className="py-2 text-xs text-text-tertiary">Đang tải task...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có task nào phù hợp.</p>
      ) : (
        <div className="space-y-6">
          {taskGroups.map((group) => (
            <section key={group.id} className="space-y-3" aria-labelledby={`task-group-${group.id}`}>
              <div className="flex items-center gap-2">
                <h3
                  id={`task-group-${group.id}`}
                  className={
                    group.id === "overdue"
                      ? "text-sm font-semibold text-error-500"
                      : "text-sm font-semibold text-text-secondary"
                  }
                >
                  {group.label}
                </h3>
                <span className="rounded-full bg-background-gray-secondary_alt px-2 py-0.5 text-xs font-medium text-text-tertiary">
                  {group.tasks.length}
                </span>
                <span className="h-px flex-1 bg-card-border" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                {group.tasks.map((task) => (
                  <StudentTaskCard
                    key={task.id}
                    task={task}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    expanded={expandedTaskIds.has(task.id)}
                    onExpandedChange={(expanded) => handleTaskExpandedChange(task.id, expanded)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <StudentCreateTaskDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        studentName={studentName}
        assignee={assignee}
        assignees={assignees}
        currentUserId={currentUserId}
        isLoadingAssignees={isLoadingAssignees}
        onCreate={handleCreateTask}
        isSubmitting={isCreating}
      />
    </div>
  );
}
