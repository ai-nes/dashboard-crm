"use client";

import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";
import { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SaleTask } from "@/services/api/sale";

import PriorityTaskList from "./priority-task-list";

interface PriorityTasksProps {
  tasks: SaleTask[];
  onOpenTask: (task: SaleTask) => void;
  dueTodayCount: number;
  overdueCount: number;
  timezone: string;
  referenceDate: string;
}

const priorityOrder: Record<SaleTask["priority"], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function isTaskDueOnDate(
  task: SaleTask,
  timezone: string,
  referenceDate: string,
): boolean {
  if (!task.dueAt) return false;
  const dueDate = new Date(task.dueAt);
  if (Number.isNaN(dueDate.getTime())) return false;

  const dueDateKey = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(dueDate);

  return dueDateKey === referenceDate;
}

export default function PriorityTasks({
  tasks,
  onOpenTask,
  dueTodayCount,
  overdueCount,
  timezone,
  referenceDate,
}: PriorityTasksProps) {
  const [selectedTab, setSelectedTab] = useState("today");
  const sortedTasks = tasks
    .filter((task) => task.status === "Todo" || task.status === "In Progress")
    .sort((left, right) => {
      if (left.isOverdue !== right.isOverdue) return left.isOverdue ? -1 : 1;
      const leftDue = left.dueAt
        ? Date.parse(left.dueAt)
        : Number.POSITIVE_INFINITY;
      const rightDue = right.dueAt
        ? Date.parse(right.dueAt)
        : Number.POSITIVE_INFINITY;
      if (left.isOverdue && leftDue !== rightDue) return leftDue - rightDue;
      if (priorityOrder[left.priority] !== priorityOrder[right.priority]) {
        return priorityOrder[left.priority] - priorityOrder[right.priority];
      }
      return leftDue - rightDue;
    });
  const overdueTodayCount = sortedTasks.filter(
    (task) => task.isOverdue && isTaskDueOnDate(task, timezone, referenceDate),
  ).length;
  const actionableTodayCount = Math.max(0, dueTodayCount - overdueTodayCount);
  const todayTasks = sortedTasks
    .filter(
      (task) =>
        !task.isOverdue && isTaskDueOnDate(task, timezone, referenceDate),
    )
    .slice(0, 4);
  const overdueTasks = sortedTasks.filter((task) => task.isOverdue).slice(0, 4);

  const tabClassName =
    "group inline-flex min-h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-text-secondary outline-none transition-colors hover:bg-card-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 data-[selected]:border-card-border data-[selected]:bg-card-background data-[selected]:text-text-primary data-[selected]:shadow-xs sm:flex-none";

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="items-start gap-4 border-b border-card-border px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <CardTitle>Việc cần xử lý</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Danh sách ưu tiên theo hạn xử lý và mức độ quan trọng.
          </p>
        </div>
        <Link
          href="/sale/tasks"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Tất cả công việc
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>
      <div className="px-5 py-3 sm:px-6">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(String(key))}
          className="w-full min-w-0"
        >
          <TabList
            aria-label="Lọc công việc cần ưu tiên"
            className="flex w-full max-w-full items-center gap-1 rounded-xl bg-background-soft-50 p-1 sm:w-fit"
          >
            <Tab id="today" className={tabClassName}>
              Cần xử lý
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-background-soft-100 px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary group-data-[selected]:bg-primary-50 group-data-[selected]:text-primary-700">
                {actionableTodayCount}
              </span>
            </Tab>
            <Tab id="overdue" className={tabClassName}>
              Quá hạn
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${overdueCount > 0 ? "bg-badge-error-background text-badge-error-text" : "bg-background-soft-100 text-text-secondary"}`}
              >
                {overdueCount}
              </span>
            </Tab>
          </TabList>
          <TabPanel id="today" className="w-full pt-3 outline-none">
            <PriorityTaskList
              tasks={todayTasks}
              onOpenTask={onOpenTask}
              timezone={timezone}
              referenceDate={referenceDate}
              emptyMessage="Hôm nay không có công việc cần xử lý."
            />
          </TabPanel>
          <TabPanel id="overdue" className="w-full pt-3 outline-none">
            <PriorityTaskList
              tasks={overdueTasks}
              onOpenTask={onOpenTask}
              timezone={timezone}
              referenceDate={referenceDate}
              emptyMessage="Không có công việc quá hạn."
            />
          </TabPanel>
        </Tabs>
      </div>
    </Card>
  );
}
