"use client";

import { useState } from "react";

import {
  AdminTabContent,
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { TabTrigger } from "@/components/tailgrids/core/tabs";
import { useActivityLogsQuery } from "@/hooks/use-activity-logs-query";
import type {
  ActivityLogEntry,
  ActivityLogModule,
} from "@/services/api/activity-log";

import ActivityLogDetailSheet from "./activity-log-detail-sheet";
import ActivityLogFilters, {
  type ActivityLogFilterState,
} from "./activity-log-filters";
import ActivityLogList from "./activity-log-list";
import { ACTIVITY_LOG_MODULES } from "./activity-log-module-config";

const EMPTY_FILTERS: ActivityLogFilterState = {};
const PAGE_SIZE = 8;

export default function ActivityLogsPage() {
  const [activeModule, setActiveModule] = useState<ActivityLogModule>("all");
  const [filters, setFilters] = useState<ActivityLogFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);
  const query = useActivityLogsQuery({
    module: activeModule,
    ...filters,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const logs = query.data?.logs ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main
      id="main-content"
      className="min-h-0 min-w-0 space-y-4 overflow-y-auto px-2 py-4 pb-8 lg:px-6"
    >
      <AdminPageHeader
        section="Nhật ký"
        title="Nhật ký hoạt động"
        description="Lịch sử hoạt động hệ thống."
        metaLabel="Dữ liệu từ Frappe CRM"
        metaValue={
          <>
            <span className="font-semibold text-text-primary">
              {query.data?.total ?? logs.length}
            </span>{" "}
            bản ghi
          </>
        }
      />

      <ActivityLogFilters
        value={filters}
        onChange={(value) => {
          setFilters(value);
          setPage(1);
        }}
      />
      <AdminTabRoot
        value={activeModule}
        onValueChange={(value) => {
          setActiveModule(value as ActivityLogModule);
          setPage(1);
          setSelectedLog(null);
        }}
        defaultValue="all"
        className="min-w-0"
      >
        <AdminTabList>
          {ACTIVITY_LOG_MODULES.map((module) => (
            <TabTrigger key={module.value} value={module.value}>
              {module.label}
            </TabTrigger>
          ))}
        </AdminTabList>
        {ACTIVITY_LOG_MODULES.map((module) => (
          <AdminTabContent key={module.value} value={module.value}>
            <ActivityLogList
              logs={logs}
              isLoading={query.isPending}
              error={query.error}
              tracked={query.data?.tracked ?? true}
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              onPageChange={setPage}
              isDisabled={query.isFetching}
              onSelectLog={setSelectedLog}
            />
          </AdminTabContent>
        ))}
      </AdminTabRoot>

      <ActivityLogDetailSheet
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      />
    </main>
  );
}
