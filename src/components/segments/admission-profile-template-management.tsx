'use client'

import {Pencil1, Trash1} from '@tailgrids/icons'
import {useMemo, useState} from 'react'
import {toast} from 'sonner'

import {DeleteRecordDialog} from '@/components/common/delete-record-dialog'
import {AdmissionProfileTemplateEditorDialog} from '@/components/segments/admission-profile-template-editor-dialog'
import {Badge} from '@/components/tailgrids/core/badge'
import {Button} from '@/components/tailgrids/core/button'
import {Input} from '@/components/tailgrids/core/input'
import {Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue} from '@/components/tailgrids/core/select'
import {Spinner} from '@/components/tailgrids/core/spinner'
import {TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow} from '@/components/tailgrids/core/table'
import {
  useAdmissionProfileTemplatesQuery,
  useDeleteAdmissionProfileTemplateMutation,
  useTransitionAdmissionProfileTemplateMutation,
} from '@/hooks/use-admission-profile-template-queries'
import {AdmissionProfileTemplateStatusSelect} from './admission-profile-template-status-select'
import type {
  AdmissionProfileTemplateOption,
  AdmissionProfileTemplateStatus,
} from '@/services/api/admission-profile-catalog'

const STATUS_LABELS: Record<AdmissionProfileTemplateStatus, string> = {
  Draft: 'Bản nháp',
  Active: 'Đang dùng',
  Archived: 'Lưu trữ',
}

const STATUS_FILTERS: Array<{value: AdmissionProfileTemplateStatus | 'all'; label: string}> = [
  {value: 'all', label: 'Tất cả trạng thái'},
  {value: 'Active', label: 'Đang dùng'},
  {value: 'Draft', label: 'Bản nháp'},
  {value: 'Archived', label: 'Lưu trữ'},
]

const KIND_FILTERS = [
  {value: 'all', label: 'Tất cả nhóm'},
  {value: 'standard', label: 'Hồ sơ thông thường'},
  {value: 'special', label: 'Hồ sơ bổ sung'},
] as const

const EMPTY_TEMPLATES: AdmissionProfileTemplateOption[] = []

function statusColor(status: AdmissionProfileTemplateStatus): 'gray' | 'success' | 'warning' {
  if (status === 'Active') return 'success'
  if (status === 'Draft') return 'warning'
  return 'gray'
}

function statusOptions(status: AdmissionProfileTemplateStatus): AdmissionProfileTemplateStatus[] {
  if (status === 'Draft') return ['Draft', 'Active', 'Archived']
  if (status === 'Active') return ['Active', 'Archived']
  return ['Archived']
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Không thể tải danh sách loại hồ sơ.'
}

function methodLabel(method?: string | null): string {
  if (method === 'THPT_SCORE') return 'Xét điểm THPT'
  if (method === 'DIRECT_ADMISSION') return 'Xét tuyển thẳng'
  return 'Tất cả phương thức'
}

function templateKindLabel(kind: AdmissionProfileTemplateOption['templateKind']): string {
  return kind === 'special' ? 'Hồ sơ bổ sung' : 'Hồ sơ thông thường'
}

function FilterSelect({
  value,
  options,
  ariaLabel,
  onChange,
}: {
  value: string
  options: ReadonlyArray<{value: string; label: string}>
  ariaLabel: string
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} aria-label={ariaLabel} className="w-auto gap-0" onChange={(nextValue) => onChange(String(nextValue ?? ''))}>
      <SelectTrigger size="sm" className="min-w-36 justify-between whitespace-nowrap">
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent className="min-w-(--trigger-width)">
        {options.map((option) => (
          <SelectItem key={option.value} id={option.value} textValue={option.label}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AdmissionProfileTemplateManagement({canManage}: {canManage: boolean}) {
  const query = useAdmissionProfileTemplatesQuery()
  const transitionMutation = useTransitionAdmissionProfileTemplateMutation()
  const deleteMutation = useDeleteAdmissionProfileTemplateMutation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdmissionProfileTemplateStatus | 'all'>('all')
  const [kindFilter, setKindFilter] = useState<(typeof KIND_FILTERS)[number]['value']>('all')
  const [templateToDelete, setTemplateToDelete] = useState<AdmissionProfileTemplateOption | null>(null)

  const templates = query.data?.templates ?? EMPTY_TEMPLATES
  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return templates.filter((template) => {
      const matchesSearch = !normalizedSearch || `${template.code} ${template.name} ${template.description || ''}`.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || template.status === statusFilter
      const matchesKind = kindFilter === 'all' || template.templateKind === kindFilter
      return matchesSearch && matchesStatus && matchesKind
    })
  }, [kindFilter, search, statusFilter, templates])

  const changeStatus = async (template: AdmissionProfileTemplateOption, status: AdmissionProfileTemplateStatus) => {
    if (status === template.status) return
    try {
      await transitionMutation.mutateAsync({
        name: template.id,
        status,
        expectedModified: template.modified,
      })
      toast.success(`Đã chuyển ${template.name} sang ${STATUS_LABELS[status]}.`)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return
    try {
      await deleteMutation.mutateAsync({
        name: templateToDelete.id,
        expectedModified: templateToDelete.modified,
      })
      toast.success(`Đã xóa ${templateToDelete.name}.`)
      setTemplateToDelete(null)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-card-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Loại hồ sơ</h2>
            <p className="mt-1 text-sm text-text-tertiary">
              {templates.length} cấu hình · {filteredTemplates.length} đang hiển thị
            </p>
          </div>
          {canManage && (
            <AdmissionProfileTemplateEditorDialog template={null} documentTypes={query.data?.documentTypes ?? []}>
              {(open) => <Button size="sm" onPress={open} isDisabled={query.isPending || query.isError}>+ Tạo loại hồ sơ</Button>}
            </AdmissionProfileTemplateEditorDialog>
          )}
        </header>

        {query.isPending ? (
          <div className="flex flex-1 items-center justify-center gap-2 px-5 py-16 text-sm text-text-tertiary">
            <Spinner size="sm" />
            Đang tải danh mục loại hồ sơ…
          </div>
        ) : query.isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <p className="text-sm text-text-secondary">{errorMessage(query.error)}</p>
            <Button size="sm" appearance="outline" onPress={() => void query.refetch()}>Thử lại</Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <p className="text-sm text-text-tertiary">Chưa có loại hồ sơ nào được cấu hình.</p>
            {canManage && (
              <AdmissionProfileTemplateEditorDialog template={null} documentTypes={query.data?.documentTypes ?? []}>
                {(open) => <Button size="sm" onPress={open} isDisabled={query.isPending || query.isError}>+ Tạo loại hồ sơ</Button>}
              </AdmissionProfileTemplateEditorDialog>
            )}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3 border-b border-card-border px-4 py-3 sm:flex-row sm:items-center sm:px-5">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo mã hoặc tên loại hồ sơ"
                aria-label="Tìm loại hồ sơ"
                className="h-9 min-w-0 flex-1 sm:max-w-md"
              />
              <div className="flex flex-wrap gap-2">
                <FilterSelect value={statusFilter} options={STATUS_FILTERS} ariaLabel="Lọc theo trạng thái" onChange={(value) => setStatusFilter(value as AdmissionProfileTemplateStatus | 'all')} />
                <FilterSelect value={kindFilter} options={KIND_FILTERS} ariaLabel="Lọc theo nhóm hồ sơ" onChange={(value) => setKindFilter(value as typeof kindFilter)} />
              </div>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <p className="text-sm font-medium text-text-primary">Không tìm thấy loại hồ sơ phù hợp</p>
                <p className="mt-1 text-sm text-text-tertiary">Thử đổi từ khóa hoặc bộ lọc.</p>
                <Button size="sm" appearance="ghost" className="mt-3" onPress={() => { setSearch(''); setStatusFilter('all'); setKindFilter('all') }}>
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <TableRoot fullBleed className="w-full min-w-[760px] border-0">
                <TableHeader className="bg-background-gray-secondary/35">
                  <TableRow>
                    <TableHead className="w-32">Mã</TableHead>
                    <TableHead>Tên loại hồ sơ</TableHead>
                    <TableHead>Nhóm</TableHead>
                    <TableHead className="text-center">Tài liệu</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-28 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => {
                    const canOpen = canManage && template.status !== 'Archived'
                    return (
                      <TableRow key={template.id} className="group hover:bg-background-gray-secondary/30">
                        <TableCell className="align-top">
                          <span className="font-mono text-xs font-bold tracking-wide text-text-secondary">{template.code}</span>
                        </TableCell>
                        <TableCell className="max-w-[20rem] align-top">
                          <span className="block font-medium text-text-primary">{template.name}</span>
                          <span className="mt-1 block truncate text-xs text-text-tertiary">{template.description || 'Chưa có mô tả'}</span>
                        </TableCell>
                        <TableCell className="align-top text-sm text-text-secondary">{templateKindLabel(template.templateKind)}</TableCell>
                        <TableCell className="align-top text-center text-sm text-text-secondary">{template.requirements.length}</TableCell>
                        <TableCell className="align-top text-sm text-text-secondary">{methodLabel(template.admissionMethod)}</TableCell>
                        <TableCell className="align-top">
                          {canManage ? (
                            <AdmissionProfileTemplateStatusSelect
                              value={template.status}
                              options={statusOptions(template.status)}
                              ariaLabel={`Trạng thái ${template.name}`}
                              isDisabled={transitionMutation.isPending}
                              onChange={(status) => void changeStatus(template, status)}
                            />
                          ) : (
                            <Badge color={statusColor(template.status)} size="sm">{STATUS_LABELS[template.status]}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex justify-end gap-1">
                            {canOpen && (
                              <AdmissionProfileTemplateEditorDialog template={template} documentTypes={query.data?.documentTypes ?? []}>
                                {(open) => (
                                  <Button aria-label={`Sửa ${template.name}`} iconOnly size="sm" appearance="ghost" onPress={open}>
                                    <Pencil1 size={16} aria-hidden="true" />
                                  </Button>
                                )}
                              </AdmissionProfileTemplateEditorDialog>
                            )}
                            {canManage && template.status === 'Draft' && (
                              <Button aria-label={`Xóa ${template.name}`} iconOnly size="sm" appearance="ghost" variant="danger" onPress={() => setTemplateToDelete(template)}>
                                <Trash1 size={16} aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            )}
          </div>
        )}
      </section>

      <DeleteRecordDialog
        isOpen={Boolean(templateToDelete)}
        recordType="loại hồ sơ"
        recordName={templateToDelete?.name ?? ''}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setTemplateToDelete(null)
        }}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Chỉ bản nháp chưa được hồ sơ tuyển sinh sử dụng mới được xóa. Template đang dùng nên chuyển sang lưu trữ.
        </p>
      </DeleteRecordDialog>
    </>
  )
}
