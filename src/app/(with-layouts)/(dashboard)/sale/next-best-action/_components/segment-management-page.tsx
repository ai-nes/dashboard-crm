'use client'

import {Plus} from '@tailgrids/icons'
import {usePathname, useRouter} from 'next/navigation'
import {SegmentList} from '@/components/segments/segment-list'

import AdminPageHeader from '@/components/common/admin/admin-page-header'
import {useAuth} from '@/components/common/auth/auth-provider'
import {hasFrappeTechnicalRole} from '@/components/common/auth/rbac'
import {Badge} from '@/components/tailgrids/core/badge'
import {Button} from '@/components/tailgrids/core/button'

export default function SegmentManagementPage({
  createHref,
  isAdmin = false,
}: {
  createHref?: string
  isAdmin?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const {user} = useAuth()
  const canManage = Boolean(
    hasFrappeTechnicalRole(user?.roles, 'System Manager') || user?.roles.includes('Administrator')
  )

  return (
    <main id="main-content" className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6">
      {isAdmin ? (
        <AdminPageHeader
          section="Segments"
          title="Quản lý segments"
          description="Quản lý các nhóm học sinh."
          canEdit={canManage}
          actions={
            canManage && createHref ? (
              <Button size="md" className="shrink-0" onPress={() => router.push(createHref)}>
                <Plus size={16} aria-hidden="true" />
                Tạo segment
              </Button>
            ) : null
          }
          metaLabel="Đồng bộ từ Frappe CRM"
          metaValue="Nhóm dùng chung"
        />
      ) : (
        <header className="relative isolate shrink-0 overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-xs sm:px-6 lg:px-7 lg:py-6">
          <div className="pointer-events-none absolute -top-24 -right-8 -z-10 size-72 rounded-full bg-primary-50/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-60 rounded-full bg-badge-sky-background/50 blur-3xl" />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge color="primary">QUẢN LÝ SEGMENTS</Badge>
                <span className="text-xs text-text-tertiary">Không gian tuyển sinh</span>
              </div>
              <h1 className="mt-4 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
                Quản lý segments
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Xây dựng, theo dõi và sử dụng các nhóm học sinh trong quy trình tuyển sinh.
              </p>
            </div>

            {canManage && createHref && (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="md" className="shrink-0" onPress={() => router.push(createHref)}>
                  <Plus size={16} aria-hidden="true" />
                  Tạo segment
                </Button>
              </div>
            )}
          </div>
        </header>
      )}

      <div className="min-h-0 flex-1 overflow-hidden pt-5">
        <SegmentList
          detailBaseHref={pathname}
          canManage={canManage}
          compactStatus={isAdmin}
        />
      </div>
    </main>
  )
}
