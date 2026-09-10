'use client'

import {useState} from 'react'

import {useAuth} from '@/components/common/auth/auth-provider'
import {hasFrappeTechnicalRole} from '@/components/common/auth/rbac'
import {Badge} from '@/components/tailgrids/core/badge'
import {TabContent, TabList, TabRoot, TabTrigger} from '@/components/tailgrids/core/tabs'
import {ClassificationGroupManagement} from '@/components/segments/classification-group-management'

export function StudentConfigurationPage() {
  const [activeTab, setActiveTab] = useState('needs')
  const {user} = useAuth()
  const canManage = Boolean(
    hasFrappeTechnicalRole(user?.roles, 'System Manager') || user?.roles.includes('Administrator')
  )

  return (
    <main id="main-content" className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6">
      <header className="relative isolate shrink-0 overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-xs sm:px-6 lg:px-7 lg:py-6">
        <div className="pointer-events-none absolute -top-24 -right-8 -z-10 size-72 rounded-full bg-primary-50/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-60 rounded-full bg-badge-sky-background/50 blur-3xl" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge color="primary">CẤU HÌNH HỌC SINH</Badge>
            <span className="text-xs text-text-tertiary">Danh mục dùng chung cho hồ sơ học sinh</span>
          </div>
          <h1 className="mt-4 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
            Cấu hình học sinh
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Quản lý các danh mục và quy tắc được sử dụng trong quá trình chăm sóc, phân loại và xét tuyển học sinh.
          </p>
        </div>
      </header>

      <TabRoot
        defaultValue="needs"
        value={activeTab}
        onValueChange={setActiveTab}
        variant="minimal"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 bg-transparent"
      >
        <TabList className="px-1 sm:px-2">
          <TabTrigger value="needs">Nhu cầu</TabTrigger>
          <TabTrigger value="tags">Tag</TabTrigger>
        </TabList>
        <TabContent value="needs" className="min-h-0 flex-1 overflow-hidden px-0 pt-5">
          <ClassificationGroupManagement kind="need" canManage={canManage} />
        </TabContent>
        <TabContent value="tags" className="min-h-0 flex-1 overflow-hidden px-0 pt-5">
          <ClassificationGroupManagement kind="tag" canManage={canManage} />
        </TabContent>
      </TabRoot>
    </main>
  )
}
