import type {Metadata} from 'next'

import SnippestPage from './_components/snippest-page'

export const metadata: Metadata = {
  title: 'Snippest',
  description: 'Quản lý các đoạn nội dung dùng nhanh trong quy trình chăm sóc học sinh.',
}

export default function DirectorSnippestPage() {
  return <SnippestPage />
}
