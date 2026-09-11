import {Badge} from '@/components/tailgrids/core/badge'
import {Card, CardTitle} from '@/components/tailgrids/core/card'
import ContentCreateMenu from '../../_components/content-create-menu'

export default function SnippestPage() {
  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <Badge color="primary">MẪU &amp; NỘI DUNG</Badge>
          <CardTitle level={1} className="mt-4 text-[28px] leading-8">
            Snippest
          </CardTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Quản lý các đoạn nội dung dùng nhanh trong quá trình tư vấn học sinh.
          </p>
        </div>
        <ContentCreateMenu />
      </Card>

      <Card className="flex min-h-80 items-center justify-center border-dashed bg-background-gray-secondary/20">
        <div className="max-w-md text-center">
          <h2 className="text-base font-semibold text-text-primary">Khung Snippest</h2>
          <p className="mt-2 text-sm leading-6 text-text-tertiary">
            Nội dung cấu hình snippet sẽ được bổ sung trong bước tiếp theo.
          </p>
        </div>
      </Card>
    </main>
  )
}
