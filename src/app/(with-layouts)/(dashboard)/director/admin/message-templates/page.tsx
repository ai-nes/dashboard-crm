import type {Metadata} from 'next'

import AdminMessageTemplatePage from './_components/admin-message-template-page'

export const metadata: Metadata = {
  title: 'Quản lý Message Template',
  description: 'Quản lý các mẫu email dùng chung trong thư viện tạo mẫu.',
}

export default function AdminMessageTemplatesPage() {
  return <AdminMessageTemplatePage />
}
