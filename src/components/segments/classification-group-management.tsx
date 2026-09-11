'use client'

import {Pencil1, Plus, Trash1} from '@tailgrids/icons'
import {useState} from 'react'
import {toast} from 'sonner'

import {DeleteRecordDialog} from '@/components/common/delete-record-dialog'
import {Badge} from '@/components/tailgrids/core/badge'
import {Button} from '@/components/tailgrids/core/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import {Input} from '@/components/tailgrids/core/input'
import {Backdrop} from '@/components/tailgrids/core/overlay'
import {SegmentStatusSelect} from '@/components/segments/segment-status-select'
import {
  useClassificationTermsQuery,
  useCreateClassificationTermMutation,
  useDeleteClassificationTermMutation,
  useClassificationGroupsQuery,
  useCreateClassificationGroupMutation,
  useDeleteClassificationGroupMutation,
  useTransitionClassificationGroupMutation,
  useTransitionClassificationTermMutation,
  useUpdateClassificationTermMutation,
  useUpdateClassificationGroupMutation,
  type ClassificationGroupKind,
} from '@/hooks/use-segment-queries'
import type {ClassificationGroupRecord, SegmentTermRecord} from '@/services/api/segments'

const STATUS_LABELS = {
  draft: 'Bản nháp',
  active: 'Đang dùng',
  inactive: 'Tạm dừng',
  archive: 'Lưu trữ',
} as const

const EMPTY_FORM = {code: '', label: '', description: '', sort_order: '0'}

function GroupEditor({
  kind,
  group,
  onClose,
}: {
  kind: ClassificationGroupKind
  group: ClassificationGroupRecord | null
  onClose: () => void
}) {
  const [form, setForm] = useState(() =>
    group
      ? {
          code: group.code,
          label: group.label,
          description: group.description ?? '',
          sort_order: String(group.sort_order ?? 0),
        }
      : EMPTY_FORM
  )
  const createMutation = useCreateClassificationGroupMutation()
  const updateMutation = useUpdateClassificationGroupMutation()
  const isSaving = createMutation.isPending || updateMutation.isPending
  const title = kind === 'need' ? 'nhu cầu' : 'tag'

  const setField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({...current, [field]: value}))

  const save = async () => {
    const code = form.code.trim().toUpperCase()
    const label = form.label.trim()
    const sortOrder = Number(form.sort_order)
    if (!code || !/^[A-Z0-9_]+$/.test(code)) {
      toast.error('Mã nhóm chỉ gồm A-Z, 0-9 và dấu gạch dưới.')
      return
    }
    if (!label || !Number.isInteger(sortOrder) || sortOrder < 0) {
      toast.error('Vui lòng nhập tên nhóm và thứ tự hợp lệ.')
      return
    }
    try {
      if (group) {
        await updateMutation.mutateAsync({
          kind,
          payload: {
            name: group.name,
            expectedRevision: group.revision,
            data: {label, description: form.description.trim(), sort_order: sortOrder},
          },
        })
        toast.success(`Đã cập nhật nhóm ${label}.`)
      } else {
        await createMutation.mutateAsync({
          kind,
          payload: {code, label, description: form.description.trim(), sort_order: sortOrder},
        })
        toast.success(`Đã tạo nhóm ${label}.`)
      }
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu nhóm.')
    }
  }

  return (
    <Backdrop isOpen onOpenChange={(open) => !open && !isSaving && onClose()}>
      <Dialog
        aria-label={group ? `Chỉnh sửa nhóm ${group.label}` : `Tạo nhóm ${title}`}
        className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0"
      >
        <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
          <DialogTitle>{group ? 'Chỉnh sửa nhóm' : `Tạo nhóm ${title}`}</DialogTitle>
          <p className="text-sm text-text-tertiary">
            Nhóm dùng để tổ chức danh mục {title} trong bộ lọc segment.
          </p>
        </DialogHeader>
        <DialogBody className="space-y-4 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-input-label-text-color">Mã nhóm</span>
            <Input
              value={form.code}
              onChange={(event) => setField('code', event.target.value.toUpperCase())}
              disabled={Boolean(group) || isSaving}
              placeholder="Ví dụ: NEED_CONVERSION"
              className="h-10 w-full"
            />
            <span className="text-xs text-text-tertiary">Mã không thể thay đổi sau khi tạo.</span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-input-label-text-color">Tên nhóm</span>
            <Input
              value={form.label}
              onChange={(event) => setField('label', event.target.value)}
              disabled={isSaving}
              placeholder="Ví dụ: Cần hỗ trợ chuyển đổi"
              className="h-10 w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-input-label-text-color">Mô tả</span>
            <textarea
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              disabled={isSaving}
              rows={3}
              placeholder="Mô tả ngắn về mục đích của nhóm"
              className="w-full resize-y rounded-lg border border-card-border bg-input-background px-3 py-2.5 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed"
            />
          </label>
          <label className="block max-w-44 space-y-1.5">
            <span className="text-sm font-medium text-input-label-text-color">Thứ tự hiển thị</span>
            <Input
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(event) => setField('sort_order', event.target.value)}
              disabled={isSaving}
              className="h-10 w-full"
            />
          </label>
        </DialogBody>
        <DialogFooter className="border-t border-card-border px-5 py-3">
          <DialogClose appearance="outline" size="sm">
            Đóng
          </DialogClose>
          <Button size="sm" onPress={() => void save()} isDisabled={isSaving}>
            {isSaving ? 'Đang lưu…' : group ? 'Lưu thay đổi' : 'Tạo nhóm'}
          </Button>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  )
}

function TermEditor({
  kind,
  groups,
  term,
  initialGroup,
  onClose,
}: {
  kind: ClassificationGroupKind
  groups: ClassificationGroupRecord[]
  term: SegmentTermRecord | null
  initialGroup?: string
  onClose: () => void
}) {
  const [form, setForm] = useState({
    code: term?.code ?? '',
    label: term?.label ?? '',
    group: term?.group ?? initialGroup ?? groups[0]?.name ?? '',
    description: term?.description ?? '',
  })
  const createMutation = useCreateClassificationTermMutation()
  const updateMutation = useUpdateClassificationTermMutation()
  const isSaving = createMutation.isPending || updateMutation.isPending
  const childLabel = kind === 'need' ? 'Need' : 'Tag'

  const save = async () => {
    const code = form.code.trim().toUpperCase()
    const label = form.label.trim()
    if (!code || !/^[A-Z0-9_]+$/.test(code) || !label || !form.group) {
      toast.error('Vui lòng nhập mã, tên và group hợp lệ.')
      return
    }
    try {
      if (term) {
        await updateMutation.mutateAsync({
          kind,
          payload: {
            name: term.name,
            expectedRevision: term.revision ?? 0,
            data: {label, group: form.group, description: form.description.trim()},
          },
        })
        toast.success(`Đã cập nhật ${childLabel} ${label}.`)
      } else {
        await createMutation.mutateAsync({
          kind,
          payload: {code, label, group: form.group, description: form.description.trim()},
        })
        toast.success(`Đã tạo ${childLabel} ${label}.`)
      }
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Không thể lưu ${childLabel}.`)
    }
  }

  return (
    <Backdrop isOpen onOpenChange={(open) => !open && !isSaving && onClose()}>
      <Dialog aria-label={term ? `Chỉnh sửa ${childLabel}` : `Tạo ${childLabel}`} className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0">
        <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
          <DialogTitle>{term ? `Chỉnh sửa ${childLabel}` : `Tạo ${childLabel} mới`}</DialogTitle>
          <p className="text-sm text-text-tertiary">Mỗi {childLabel} thuộc về một group để dùng trong phân loại học sinh.</p>
        </DialogHeader>
        <DialogBody className="space-y-4 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5"><span className="text-sm font-medium text-input-label-text-color">Mã {childLabel}</span><Input value={form.code} onChange={(event) => setForm((current) => ({...current, code: event.target.value.toUpperCase()}))} disabled={Boolean(term) || isSaving} placeholder="Ví dụ: TUITION_INFORMATION" className="h-10 w-full" /><span className="text-xs text-text-tertiary">Mã không thể thay đổi sau khi tạo.</span></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium text-input-label-text-color">Tên {childLabel}</span><Input value={form.label} onChange={(event) => setForm((current) => ({...current, label: event.target.value}))} disabled={isSaving} placeholder={`Ví dụ: ${childLabel} cần tư vấn`} className="h-10 w-full" /></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium text-input-label-text-color">Group</span><select value={form.group} onChange={(event) => setForm((current) => ({...current, group: event.target.value}))} disabled={isSaving || groups.length === 0} className="h-10 w-full rounded-lg border border-card-border bg-input-background px-3 text-sm text-title-50 outline-none focus:ring-4 focus:ring-input-primary-focus-border/20">{groups.map((group) => <option key={group.name} value={group.name}>{group.label} ({group.code})</option>)}</select></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium text-input-label-text-color">Mô tả</span><textarea value={form.description} onChange={(event) => setForm((current) => ({...current, description: event.target.value}))} disabled={isSaving} rows={3} className="w-full resize-y rounded-lg border border-card-border bg-input-background px-3 py-2.5 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed" /></label>
        </DialogBody>
        <DialogFooter className="border-t border-card-border px-5 py-3"><DialogClose appearance="outline" size="sm">Đóng</DialogClose><Button size="sm" onPress={() => void save()} isDisabled={isSaving || groups.length === 0}>{isSaving ? 'Đang lưu…' : term ? 'Lưu thay đổi' : `Tạo ${childLabel}`}</Button></DialogFooter>
      </Dialog>
    </Backdrop>
  )
}

export function ClassificationGroupManagement({
  kind,
  canManage,
  hideHeader = false,
}: {
  kind: ClassificationGroupKind
  canManage: boolean
  hideHeader?: boolean
}) {
  const query = useClassificationGroupsQuery(kind)
  const termsQuery = useClassificationTermsQuery(kind)
  const deleteMutation = useDeleteClassificationGroupMutation()
  const deleteTermMutation = useDeleteClassificationTermMutation()
  const transitionMutation = useTransitionClassificationGroupMutation()
  const transitionTermMutation = useTransitionClassificationTermMutation()
  const [editorOpen, setEditorOpen] = useState(false)
  const [selected, setSelected] = useState<ClassificationGroupRecord | null>(null)
  const [toDelete, setToDelete] = useState<ClassificationGroupRecord | null>(null)
  const [termToEdit, setTermToEdit] = useState<SegmentTermRecord | null | undefined>(undefined)
  const [termGroup, setTermGroup] = useState<string | undefined>()
  const [termToDelete, setTermToDelete] = useState<SegmentTermRecord | null>(null)
  const [selectedGroupName, setSelectedGroupName] = useState<string>()
  const title = kind === 'need' ? 'Need Group' : 'Tag Group'
  const childLabel = kind === 'need' ? 'Need' : 'Tag'

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync({
        kind,
        payload: {name: toDelete.name, expectedRevision: toDelete.revision},
      })
      setToDelete(null)
      toast.success(`Đã xóa ${title}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Không thể xóa ${title}.`)
    }
  }

  const changeStatus = async (
    group: ClassificationGroupRecord,
    status: ClassificationGroupRecord['status']
  ) => {
    if (status === group.status) return
    try {
      await transitionMutation.mutateAsync({
        kind,
        payload: {name: group.name, status, expectedRevision: group.revision},
      })
      toast.success(`Đã chuyển trạng thái nhóm sang ${STATUS_LABELS[status]}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái nhóm.')
    }
  }

  const changeTermStatus = async (
    term: SegmentTermRecord,
    status: ClassificationGroupRecord['status']
  ) => {
    if (status === term.status) return
    try {
      await transitionTermMutation.mutateAsync({
        kind,
        payload: {name: term.name, status, expectedRevision: term.revision ?? 0},
      })
      toast.success(`Đã chuyển trạng thái ${childLabel} sang ${STATUS_LABELS[status]}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Không thể cập nhật trạng thái ${childLabel}.`)
    }
  }

  const confirmTermDelete = async () => {
    if (!termToDelete) return
    try {
      await deleteTermMutation.mutateAsync({
        kind,
        payload: {name: termToDelete.name, expectedRevision: termToDelete.revision ?? 0},
      })
      setTermToDelete(null)
      toast.success(`Đã xóa ${childLabel}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Không thể xóa ${childLabel}.`)
    }
  }

  if (query.isPending || termsQuery.isPending) {
    return (
      <section className="rounded-2xl border border-card-border bg-card-background p-8 text-center text-sm text-text-secondary">
        Đang tải danh sách {title}…
      </section>
    )
  }
  if (query.error || termsQuery.error) {
    return (
      <section className="rounded-2xl border border-badge-error-icon-color bg-badge-error-background p-8 text-center text-sm text-badge-error-text">
        {(query.error || termsQuery.error)?.message}
      </section>
    )
  }

  const groups = query.data ?? []
  const terms = termsQuery.data ?? []
  const selectedGroup = groups.find((group) => group.name === selectedGroupName) ?? groups[0]
  const selectedGroupTerms = selectedGroup
    ? terms.filter((term) => (term.group ?? term.group_name) === selectedGroup.name)
    : []
  return (
    <>
      <section className={`flex h-full min-h-0 flex-col overflow-hidden bg-card-background ${hideHeader ? 'rounded-none border-0 shadow-none' : 'rounded-2xl border border-card-border shadow-xs'}`}>
        {!hideHeader && <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-card-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Danh sách {title}</h2>
            <p className="mt-1 text-sm text-text-tertiary">{groups.length} nhóm trong hệ thống</p>
          </div>
          {canManage && (
            <Button
              size="sm"
              onPress={() => {
                setSelected(null)
                setEditorOpen(true)
              }}
            >
              <Plus size={16} aria-hidden="true" /> Tạo nhóm
            </Button>
          )}
        </div>}
        {groups.length > 0 ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,2fr)]">
            <div className="min-h-0 overflow-y-auto border-b border-card-border lg:border-b-0 lg:border-r">
              <div className="sticky top-0 z-10 border-b border-card-border bg-background-gray-secondary px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Danh sách Group</p>
                <p className="mt-1 text-xs text-text-tertiary">Chọn một group để xem các mục con.</p>
              </div>
              <div className="divide-y divide-card-border">
                {groups.map((group) => {
                  const groupTerms = terms.filter((term) => (term.group ?? term.group_name) === group.name)
                  const isSelected = selectedGroup?.name === group.name
                  return (
                    <button
                      key={group.name}
                      type="button"
                      className={`w-full px-5 py-4 text-left transition-colors ${isSelected ? 'bg-tab-active-background shadow-[inset_3px_0_0_0] shadow-primary-500' : 'hover:bg-background-gray-secondary_alt'}`}
                      onClick={() => setSelectedGroupName(group.name)}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-bold tracking-wide text-text-primary">{group.code}</p>
                          <p className="mt-1 truncate font-semibold text-text-primary">{group.label}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-text-tertiary">{group.description || 'Chưa có mô tả'}</p>
                        </div>
                        <span className="shrink-0 rounded-md bg-background-gray-secondary px-2 py-0.5 text-xs text-text-tertiary">{groupTerms.length} {childLabel}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            {selectedGroup && (
              <section aria-labelledby={`selected-group-${selectedGroup.name}`} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                <div className="shrink-0 border-b border-card-border bg-background-gray-secondary/25 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold tracking-wide text-text-secondary">{selectedGroup.code}</p>
                      <h3 id={`selected-group-${selectedGroup.name}`} className="mt-1 text-lg font-semibold text-text-primary">{selectedGroup.label}</h3>
                      <p className="mt-1 text-sm text-text-tertiary">{selectedGroup.description || 'Chưa có mô tả'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {canManage ? (
                        <SegmentStatusSelect ariaLabel={`Trạng thái ${selectedGroup.label}`} value={selectedGroup.status} isDisabled={transitionMutation.isPending} labels={STATUS_LABELS} onChange={(status) => void changeStatus(selectedGroup, status)} />
                      ) : (
                        <Badge color={selectedGroup.status === 'active' ? 'success' : selectedGroup.status === 'draft' ? 'warning' : 'gray'}>{STATUS_LABELS[selectedGroup.status]}</Badge>
                      )}
                      {canManage && <Button size="sm" appearance="outline" onPress={() => { setTermGroup(selectedGroup.name); setTermToEdit(null) }}><Plus size={15} aria-hidden="true" /> {childLabel}</Button>}
                      {canManage && <Button aria-label={`Sửa ${selectedGroup.label}`} iconOnly size="sm" appearance="ghost" onPress={() => { setSelected(selectedGroup); setEditorOpen(true) }}><Pencil1 size={16} aria-hidden="true" /></Button>}
                      {canManage && <Button aria-label={`Xóa ${selectedGroup.label}`} iconOnly size="sm" appearance="ghost" variant="danger" onPress={() => setToDelete(selectedGroup)}><Trash1 size={16} aria-hidden="true" /></Button>}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 border-b border-card-border bg-background-gray-secondary/10 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Các {childLabel} thuộc group này</p>
                  <p className="mt-1 text-xs text-text-tertiary">Mỗi dòng là một mục con được quản lý trong {selectedGroup.label}.</p>
                </div>
                <div className="min-h-0 flex-1 divide-y divide-card-border overflow-y-auto">
                  {selectedGroupTerms.map((term) => (
                    <div key={term.name} className="flex flex-wrap items-center gap-3 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-mono text-xs text-text-secondary">{term.code || term.name}</p>
                        <p className="mt-1 break-words font-medium text-text-primary">{term.label || term.name}</p>
                        <p className="mt-1 break-words text-sm text-text-tertiary">{term.description || 'Chưa có mô tả'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {canManage ? <SegmentStatusSelect ariaLabel={`Trạng thái ${term.label || term.name}`} value={(term.status as ClassificationGroupRecord['status']) || 'draft'} isDisabled={transitionTermMutation.isPending} labels={STATUS_LABELS} onChange={(status) => void changeTermStatus(term, status)} /> : <Badge color={term.status === 'active' ? 'success' : 'warning'}>{STATUS_LABELS[(term.status as ClassificationGroupRecord['status']) || 'draft']}</Badge>}
                        {canManage && <Button aria-label={`Sửa ${term.label || term.name}`} iconOnly size="sm" appearance="ghost" onPress={() => { setTermToEdit(term); setTermGroup(undefined) }}><Pencil1 size={15} aria-hidden="true" /></Button>}
                        {canManage && <Button aria-label={`Xóa ${term.label || term.name}`} iconOnly size="sm" appearance="ghost" variant="danger" onPress={() => setTermToDelete(term)}><Trash1 size={15} aria-hidden="true" /></Button>}
                      </div>
                    </div>
                  ))}
                  {selectedGroupTerms.length === 0 && <p className="px-5 py-10 text-center text-sm text-text-tertiary">Group này chưa có {childLabel} nào.</p>}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="px-5 py-16 text-center text-sm text-text-tertiary">Chưa có nhóm nào.</div>
        )}
        {/*
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.name}>
                  <tr>
                  <td>
                    {canManage ? (
                    {canManage ? (
                      <SegmentStatusSelect
                        ariaLabel={`Trạng thái ${group.label}`}
                        value={group.status}
                        isDisabled={transitionMutation.isPending}
                        onChange={(status) => void changeStatus(group, status)}
                      />
                    ) : (
                      <Badge
                        color={
                          group.status === 'active'
                            ? 'success'
                            : group.status === 'draft'
                              ? 'warning'
                              : 'gray'
                        }
                      >
                        {STATUS_LABELS[group.status]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      {canManage && (
                        <Button
                          size="sm"
                          appearance="outline"
                          onPress={() => {
                            setTermGroup(group.name)
                            setTermToEdit(null)
                          }}
                        >
                          <Plus size={15} aria-hidden="true" /> {childLabel}
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          aria-label={`Sửa ${group.label}`}
                          iconOnly
                          size="sm"
                          appearance="ghost"
                          onPress={() => {
                            setSelected(group)
                            setEditorOpen(true)
                          }}
                        >
                          <Pencil1 size={16} aria-hidden="true" />
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          aria-label={`Xóa ${group.label}`}
                          iconOnly
                          size="sm"
                          appearance="ghost"
                          variant="danger"
                          onPress={() => setToDelete(group)}
                        >
                          <Trash1 size={16} aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                {terms.filter((term) => (term.group ?? term.group_name) === group.name).map((term) => (
                  <tr key={term.name} className="bg-background-gray-secondary/40">
                    <td className="px-5 py-3 pl-10 font-mono text-xs text-text-secondary">↳ {term.code || term.name}</td>
                    <td className="px-5 py-3 pl-10 text-text-secondary">{term.label || term.name}</td>
                    <td className="max-w-xs px-5 py-3 text-xs text-text-tertiary">{term.description || 'Chưa có mô tả'}</td>
                    <td className="px-5 py-3">
                      {canManage ? (
                        <SegmentStatusSelect
                          ariaLabel={`Trạng thái ${term.label || term.name}`}
                          value={(term.status as ClassificationGroupRecord['status']) || 'draft'}
                          isDisabled={transitionTermMutation.isPending}
                          onChange={(status) => void changeTermStatus(term, status)}
                        />
                      ) : (
                        <Badge color={term.status === 'active' ? 'success' : 'warning'}>{STATUS_LABELS[(term.status as ClassificationGroupRecord['status']) || 'draft']}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {canManage && <Button aria-label={`Sửa ${term.label || term.name}`} iconOnly size="sm" appearance="ghost" onPress={() => { setTermToEdit(term); setTermGroup(undefined) }}><Pencil1 size={15} aria-hidden="true" /></Button>}
                        {canManage && <Button aria-label={`Xóa ${term.label || term.name}`} iconOnly size="sm" appearance="ghost" variant="danger" onPress={() => setTermToDelete(term)}><Trash1 size={15} aria-hidden="true" /></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
                  </Fragment>
                ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-text-tertiary">
                    Chưa có nhóm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> */}
      </section>
      {editorOpen && (
        <GroupEditor
          kind={kind}
          group={selected}
          onClose={() => {
            setEditorOpen(false)
            setSelected(null)
          }}
        />
      )}
      {termToEdit !== undefined && (
        <TermEditor
          kind={kind}
          groups={groups}
          term={termToEdit}
          initialGroup={termGroup}
          onClose={() => {
            setTermToEdit(undefined)
            setTermGroup(undefined)
          }}
        />
      )}
      <DeleteRecordDialog
        isOpen={Boolean(toDelete)}
        recordType={title}
        recordName={toDelete?.label ?? ''}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setToDelete(null)
        }}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Chỉ xóa được nhóm chưa có Need/Tag tham chiếu. Nếu nhóm đang được sử dụng, hãy lưu trữ
          thay vì xóa.
        </p>
      </DeleteRecordDialog>
      <DeleteRecordDialog
        isOpen={Boolean(termToDelete)}
        recordType={childLabel}
        recordName={termToDelete?.label || termToDelete?.name || ''}
        isDeleting={deleteTermMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteTermMutation.isPending) setTermToDelete(null)
        }}
        onConfirm={confirmTermDelete}
      >
        <p className="text-sm text-text-secondary">Nếu {childLabel} đang được học sinh hoặc segment sử dụng, backend sẽ chặn xóa và yêu cầu lưu trữ.</p>
      </DeleteRecordDialog>
    </>
  )
}
