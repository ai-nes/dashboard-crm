"use client";

import { useState } from "react";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import {
  TabContent,
  TabList,
  TabRoot,
  TabTrigger,
} from "@/components/tailgrids/core/tabs";
import { useActivityLogsQuery } from "@/hooks/use-activity-logs-query";
import type { ActivityLogModule } from "@/services/api/activity-log";

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
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <AdminPageHeader
        section="Nhật ký"
        title="Nhật ký hoạt động"
        description="Lịch sử hoạt động hệ thống."
        metaLabel="Đồng bộ từ Frappe CRM"
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
      <TabRoot
        value={activeModule}
        onValueChange={(value) => {
          setActiveModule(value as ActivityLogModule);
          setPage(1);
        }}
        defaultValue="all"
        variant="minimal"
      >
        <TabList>
          {ACTIVITY_LOG_MODULES.map((module) => (
            <TabTrigger key={module.value} value={module.value}>
              {module.label}
            </TabTrigger>
          ))}
        </TabList>
        {ACTIVITY_LOG_MODULES.map((module) => (
          <TabContent key={module.value} value={module.value}>
            <ActivityLogList
              logs={logs}
              isLoading={query.isPending}
              error={query.error}
              tracked={query.data?.tracked ?? true}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isDisabled={query.isFetching}
            />
          </TabContent>
        ))}
      </TabRoot>
    </main>
  );
}
