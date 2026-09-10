'use client'

import {useSearchParams} from 'next/navigation'
import {useState} from 'react'

import {useAuth} from '@/components/common/auth/auth-provider'
import {TabContent, TabList, TabRoot, TabTrigger} from '@/components/tailgrids/core/tabs'
import {ClassificationGroupManagement} from '@/components/segments/classification-group-management'
import {AdmissionProfileTemplateManagement} from '@/components/segments/admission-profile-template-management'
import {canManageStudentConfiguration} from '@/components/segments/student-configuration-permissions'

export function StudentConfigurationPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'needs')
  const {user} = useAuth()
  const canManage = canManageStudentConfiguration(user?.roles)

  return (
    <main id="main-content" className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6">
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
          <TabTrigger value="profile-types">Loại hồ sơ</TabTrigger>
        </TabList>
        <TabContent value="needs" className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-5">
          <ClassificationGroupManagement kind="need" canManage={canManage} />
        </TabContent>
        <TabContent value="tags" className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-5">
          <ClassificationGroupManagement kind="tag" canManage={canManage} />
        </TabContent>
        <TabContent value="profile-types" className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-5">
          <AdmissionProfileTemplateManagement canManage={canManage} />
        </TabContent>
      </TabRoot>
    </main>
  )
}
