import type {Metadata} from 'next'

import MessageTemplatePage from '@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-page'

export const metadata: Metadata = {
  title: 'Message Template',
  description: 'Quản lý mẫu tin nhắn trong quy trình chăm sóc học sinh.',
}

export default function LeadSaleMessageTemplatePage() {
  return <MessageTemplatePage />
}
