'use client'

import {useSearchParams} from 'next/navigation'
import {useState} from 'react'

import {useAuth} from '@/components/common/auth/auth-provider'
import {TabContent, TabList, TabRoot, TabTrigger} from '@/components/tailgrids/core/tabs'
import {AdmissionDocumentTypeManagement} from '@/components/segments/admission-document-type-management'
import {AdmissionMethodManagement} from '@/components/segments/admission-method-management'
import {ClassificationGroupManagement} from '@/components/segments/classification-group-management'
import {AdmissionProfileTemplateManagement} from '@/components/segments/admission-profile-template-management'
import {
  canDeleteAdmissionDocumentTypes,
  canDeleteAdmissionMethods,
  canManageAdmissionDocumentTypes,
  canManageAdmissionMethods,
  canManageStudentConfiguration,
} from '@/components/segments/student-configuration-permissions'

const CONFIGURATION_TAB_VALUES = new Set([
  'needs',
  'tags',
  'profile-types',
  'document-types',
  'admission-methods',
])

export function StudentConfigurationPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = searchParams.get('tab')
    return requestedTab && CONFIGURATION_TAB_VALUES.has(requestedTab) ? requestedTab : 'needs'
  })
  const {user} = useAuth()
  const canManage = canManageStudentConfiguration(user?.roles)
  const canManageDocumentTypes = canManageAdmissionDocumentTypes(user?.roles)
  const canDeleteDocumentTypes = canDeleteAdmissionDocumentTypes(user?.roles)
  const canManageMethods = canManageAdmissionMethods(user?.roles)
  const canDeleteMethods = canDeleteAdmissionMethods(user?.roles)

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
          <TabTrigger value="document-types">Loại tài liệu</TabTrigger>
          <TabTrigger value="admission-methods">Phương thức xét tuyển</TabTrigger>
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
        <TabContent value="document-types" className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-5">
          <AdmissionDocumentTypeManagement canManage={canManageDocumentTypes} canDelete={canDeleteDocumentTypes} />
        </TabContent>
        <TabContent value="admission-methods" className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-5">
          <AdmissionMethodManagement canManage={canManageMethods} canDelete={canDeleteMethods} />
        </TabContent>
      </TabRoot>
    </main>
  )
}
