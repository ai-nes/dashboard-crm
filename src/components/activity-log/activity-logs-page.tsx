'use client'

import {useState} from 'react'

import AdminPageHeader from '@/components/common/admin/admin-page-header'
import {TabContent, TabList, TabRoot, TabTrigger} from '@/components/tailgrids/core/tabs'
import {useActivityLogsQuery} from '@/hooks/use-activity-logs-query'
import type {ActivityLogModule} from '@/services/api/activity-log'

import ActivityLogFilters, {type ActivityLogFilterState} from './activity-log-filters'
import ActivityLogList from './activity-log-list'
import {ACTIVITY_LOG_MODULES} from './activity-log-module-config'

const EMPTY_FILTERS: ActivityLogFilterState = {}

export default function ActivityLogsPage() {
  const [activeModule, setActiveModule] = useState<ActivityLogModule>('all')
  const [filters, setFilters] = useState<ActivityLogFilterState>(EMPTY_FILTERS)
  const query = useActivityLogsQuery({module: activeModule, ...filters})
  const logs = query.data?.logs ?? []

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <AdminPageHeader
        section="Nhật ký"
        title="Nhật ký hoạt động"
        description="Lịch sử hoạt động hệ thống."
        metaLabel="Đồng bộ từ Frappe CRM"
        metaValue={
          <>
            <span className="font-semibold text-text-primary">{query.data?.total ?? logs.length}</span>{" "}
            bản ghi
          </>
        }
      />

      <ActivityLogFilters value={filters} onChange={setFilters} />
      <TabRoot
        value={activeModule}
        onValueChange={(value) => setActiveModule(value as ActivityLogModule)}
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
            />
          </TabContent>
        ))}
      </TabRoot>
    </main>
  )
}
