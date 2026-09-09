'use client'

import {useState} from 'react'

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
      <header>
        <p className="text-sm font-medium text-text-tertiary">Quản trị hệ thống</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">
          Nhật ký hoạt động
        </h1>
      </header>

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
