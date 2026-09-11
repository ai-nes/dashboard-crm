import type {Metadata} from 'next'

import {StudentConfigurationPage} from '@/components/segments/student-configuration-page'

export const metadata: Metadata = {
  title: 'Cấu hình học sinh',
  description: 'Quản lý các danh mục dùng chung cho hồ sơ học sinh.',
}

export default function StudentConfigPage() {
  return <StudentConfigurationPage />
}
