'use client'

import {Pencil1, Trash1} from '@tailgrids/icons'
import {useDeferredValue, useMemo, useState} from 'react'
import {toast} from 'sonner'

import {DeleteRecordDialog} from '@/components/common/delete-record-dialog'
import {Badge} from '@/components/tailgrids/core/badge'
import {Button} from '@/components/tailgrids/core/button'
import {Input} from '@/components/tailgrids/core/input'
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/tailgrids/core/select'
import {TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow} from '@/components/tailgrids/core/table'
import {useAdmissionMethodsQuery, useDeleteAdmissionMethodMutation} from '@/hooks/use-admission-catalog-queries'
import type {AdmissionMethodOption} from '@/services/api/admission-profile-catalog'

import {AdmissionCatalogPanel} from './admission-catalog-panel'
import {AdmissionMethodEditorDialog} from './admission-method-editor-dialog'

const EMPTY_METHODS: AdmissionMethodOption[] = []
const METHOD_STATUS_FILTERS = ['all', 'enabled', 'disabled'] as const
type MethodStatusFilter = (typeof METHOD_STATUS_FILTERS)[number]

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Không thể tải danh mục phương thức xét tuyển.'
}

function filterLabel(value: MethodStatusFilter): string {
  if (value === 'enabled') return 'Đang dùng'
  if (value === 'disabled') return 'Đã tắt'
  return 'Tất cả trạng thái'
}

export function AdmissionMethodManagement({canManage, canDelete}: {canManage: boolean; canDelete: boolean}) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [statusFilter, setStatusFilter] = useState<MethodStatusFilter>('all')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorKey, setEditorKey] = useState(0)
  const [selected, setSelected] = useState<AdmissionMethodOption | null>(null)
  const [toDelete, setToDelete] = useState<AdmissionMethodOption | null>(null)
  const query = useAdmissionMethodsQuery({
    search: deferredSearch,
    includeDisabled: true,
  })
  const deleteMutation = useDeleteAdmissionMethodMutation()
  const methods = query.data?.methods ?? EMPTY_METHODS

  const visibleMethods = useMemo(() => {
    if (statusFilter === 'all') return methods
    const enabled = statusFilter === 'enabled'
    return methods.filter((method) => Boolean(method.enabled) === enabled)
  }, [methods, statusFilter])

  const openCreate = () => {
    setSelected(null)
    setEditorKey((current) => current + 1)
    setIsEditorOpen(true)
  }

  const openEdit = (record: AdmissionMethodOption) => {
    setSelected(record)
    setEditorKey((current) => current + 1)
    setIsEditorOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync({
        name: toDelete.id,
        expectedModified: toDelete.modified,
      })
      toast.success(`Đã xóa phương thức ${toDelete.name}.`)
      setToDelete(null)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <>
      <AdmissionCatalogPanel
        title="Phương thức xét tuyển"
        description="Danh mục phương thức dùng khi xây dựng hồ sơ và tiếp nhận đăng ký."
        count={methods.length}
        canManage={canManage}
        createLabel="Thêm phương thức"
        onCreate={openCreate}
        isBusy={query.isPending || deleteMutation.isPending}
      >
        {query.isPending ? (
          <CatalogLoading />
        ) : query.error ? (
          <CatalogError message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-card-border px-4 py-3 sm:flex-row sm:items-center sm:px-5">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo mã hoặc tên phương thức"
                aria-label="Tìm phương thức xét tuyển"
                className="h-9 min-w-0 flex-1 sm:max-w-md"
              />
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(String(value) as MethodStatusFilter)}
                aria-label="Lọc theo trạng thái phương thức xét tuyển"
                className="w-auto gap-0"
              >
                <SelectTrigger size="sm" className="min-w-40 justify-between whitespace-nowrap">
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent className="min-w-(--trigger-width)">
                  {METHOD_STATUS_FILTERS.map((value) => (
                    <SelectItem key={value} id={value} textValue={filterLabel(value)}>
                      {filterLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {visibleMethods.length === 0 ? (
              <CatalogEmpty
                title={methods.length === 0 ? 'Chưa có phương thức xét tuyển' : 'Không tìm thấy phương thức phù hợp'}
                description={
                  methods.length === 0
                    ? 'Tạo phương thức đầu tiên để dùng trong cấu hình hồ sơ.'
                    : 'Thử đổi từ khóa hoặc bộ lọc trạng thái.'
                }
                action={methods.length === 0 && canManage ? openCreate : undefined}
              />
            ) : (
              <TableRoot fullBleed className="w-full min-w-[680px] border-0">
                <TableHeader className="bg-background-gray-secondary/35">
                  <TableRow>
                    <TableHead className="w-52">Mã</TableHead>
                    <TableHead>Tên phương thức</TableHead>
                    <TableHead className="w-28 text-center">Thứ tự</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-24 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleMethods.map((method) => (
                    <TableRow key={method.id} className="group hover:bg-background-gray-secondary/30">
                      <TableCell className="align-top">
                        <span className="font-mono text-xs font-bold tracking-wide text-text-secondary">
                          {method.code}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[24rem] align-top">
                        <span className="block font-medium text-text-primary">{method.name}</span>
                        <span className="mt-1 block truncate text-xs text-text-tertiary">
                          {method.description || 'Chưa có mô tả'}
                        </span>
                      </TableCell>
                      <TableCell className="align-top text-center text-sm text-text-secondary">
                        {method.sortOrder}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge color={method.enabled ? 'success' : 'gray'} size="sm">
                          {method.enabled ? 'Đang dùng' : 'Đã tắt'}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-1">
                          {canManage && (
                            <Button
                              aria-label={`Sửa ${method.name}`}
                              iconOnly
                              size="sm"
                              appearance="ghost"
                              onPress={() => openEdit(method)}
                            >
                              <Pencil1 size={16} aria-hidden="true" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              aria-label={`Xóa ${method.name}`}
                              iconOnly
                              size="sm"
                              appearance="ghost"
                              variant="danger"
                              onPress={() => setToDelete(method)}
                            >
                              <Trash1 size={16} aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            )}
          </>
        )}
      </AdmissionCatalogPanel>

      <AdmissionMethodEditorDialog
        key={`${selected?.id ?? 'new'}-${editorKey}`}
        isOpen={isEditorOpen}
        record={selected}
        onOpenChange={(open) => {
          setIsEditorOpen(open)
          if (!open) setSelected(null)
        }}
      />
      <DeleteRecordDialog
        isOpen={Boolean(toDelete)}
        recordType="phương thức xét tuyển"
        recordName={toDelete?.name ?? ''}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setToDelete(null)
        }}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Chỉ phương thức chưa được sử dụng mới có thể xóa. Nếu đang được dùng, hãy tắt phương thức thay vì xóa.
        </p>
      </DeleteRecordDialog>
    </>
  )
}

function CatalogLoading() {
  return (
    <div className="space-y-3 px-5 py-8" aria-label="Đang tải danh mục phương thức xét tuyển">
      <p className="text-sm text-text-tertiary">Đang tải danh mục phương thức xét tuyển…</p>
      {['one', 'two', 'three'].map((item) => (
        <div
          key={item}
          className="h-10 animate-pulse rounded-lg bg-background-gray-secondary motion-reduce:animate-none"
        />
      ))}
    </div>
  )
}

function CatalogError({message, onRetry}: {message: string; onRetry: () => void}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center" role="alert">
      <p className="text-sm text-text-secondary">{message}</p>
      <Button size="sm" appearance="outline" onPress={onRetry}>
        Thử lại
      </Button>
    </div>
  )
}

function CatalogEmpty({title, description, action}: {title: string; description: string; action?: () => void}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="text-sm text-text-tertiary">{description}</p>
      {action && (
        <Button size="sm" className="mt-2" onPress={action}>
          Thêm phương thức
        </Button>
      )}
    </div>
  )
}
