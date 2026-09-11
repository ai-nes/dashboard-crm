'use client'

import {useState, type FormEvent} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/tailgrids/core/button'
import {Checkbox} from '@/components/tailgrids/core/checkbox'
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
import {TextArea} from '@/components/tailgrids/core/text-area'
import {useCreateAdmissionMethodMutation, useUpdateAdmissionMethodMutation} from '@/hooks/use-admission-catalog-queries'
import type {AdmissionMethodOption} from '@/services/api/admission-profile-catalog'

interface MethodForm {
  code: string
  displayName: string
  description: string
  sortOrder: string
  enabled: boolean
}

function formFromRecord(record: AdmissionMethodOption | null): MethodForm {
  return {
    code: record?.code ?? '',
    displayName: record?.name ?? '',
    description: record?.description ?? '',
    sortOrder: String(record?.sortOrder ?? 0),
    enabled: record?.enabled ?? true,
  }
}

export function AdmissionMethodEditorDialog({
  isOpen,
  record,
  onOpenChange,
}: {
  isOpen: boolean
  record: AdmissionMethodOption | null
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState(() => formFromRecord(record))
  const createMutation = useCreateAdmissionMethodMutation()
  const updateMutation = useUpdateAdmissionMethodMutation()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const setField = <K extends keyof MethodForm>(field: K, value: MethodForm[K]) => {
    setForm((current) => ({...current, [field]: value}))
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = form.code.trim().toUpperCase()
    const displayName = form.displayName.trim()
    const sortOrder = Number(form.sortOrder)
    if (!code || !/^[A-Z][A-Z0-9_]{1,49}$/.test(code)) {
      toast.error('Mã phương thức phải dài 2-50 ký tự, gồm A-Z, 0-9 và dấu gạch dưới.')
      return
    }
    if (!displayName || !Number.isInteger(sortOrder) || sortOrder < 0) {
      toast.error('Vui lòng nhập tên phương thức và thứ tự hiển thị hợp lệ.')
      return
    }

    const data = {
      code,
      display_name: displayName,
      description: form.description.trim() || null,
      enabled: form.enabled,
      sort_order: sortOrder,
    }

    try {
      if (record) {
        await updateMutation.mutateAsync({
          name: record.id,
          data,
          expectedModified: record.modified,
        })
        toast.success(`Đã cập nhật phương thức ${displayName}.`)
      } else {
        await createMutation.mutateAsync(data)
        toast.success(`Đã tạo phương thức ${displayName}.`)
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu phương thức xét tuyển.')
    }
  }

  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isSaving}
      onOpenChange={(open) => {
        if (open || !isSaving) onOpenChange(open)
      }}
    >
      <Dialog
        aria-label={record ? 'Chỉnh sửa phương thức xét tuyển' : 'Tạo phương thức xét tuyển'}
        className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0"
      >
        <form onSubmit={save}>
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>{record ? 'Chỉnh sửa phương thức xét tuyển' : 'Tạo phương thức xét tuyển'}</DialogTitle>
            <p className="text-sm text-text-tertiary">Phương thức sẽ xuất hiện khi cấu hình hồ sơ và tuyển sinh.</p>
          </DialogHeader>
          <DialogBody className="space-y-4 overflow-y-auto px-5 py-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">Mã phương thức</span>
              <Input
                value={form.code}
                onChange={(event) => setField('code', event.target.value.toUpperCase())}
                disabled={Boolean(record) || isSaving}
                maxLength={50}
                placeholder="Ví dụ: TRANSCRIPT_REVIEW"
                className="h-10 w-full"
              />
              <span className="text-xs text-text-tertiary">Mã không thể thay đổi sau khi tạo.</span>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">Tên phương thức</span>
              <Input
                value={form.displayName}
                onChange={(event) => setField('displayName', event.target.value)}
                disabled={isSaving}
                placeholder="Ví dụ: Xét học bạ"
                className="h-10 w-full"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-end">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">Mô tả</span>
                <TextArea
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                  disabled={isSaving}
                  rows={3}
                  placeholder="Mô tả ngắn về phương thức xét tuyển"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">Thứ tự hiển thị</span>
                <Input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(event) => setField('sortOrder', event.target.value)}
                  disabled={isSaving}
                  className="h-10 w-full"
                />
              </label>
            </div>
            <Checkbox
              size="sm"
              isSelected={form.enabled}
              onChange={(selected) => setField('enabled', selected)}
              isDisabled={isSaving}
              className="min-h-10 rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 text-sm text-text-secondary"
            >
              Cho phép dùng trong hồ sơ mới
            </Checkbox>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button size="sm" type="submit" isDisabled={isSaving}>
              {isSaving ? 'Đang lưu…' : record ? 'Lưu thay đổi' : 'Tạo phương thức'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  )
}
