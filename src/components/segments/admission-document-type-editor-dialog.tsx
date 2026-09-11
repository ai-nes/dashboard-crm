'use client'

import {useState, type FormEvent} from 'react'
import {toast} from 'sonner'

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import {Checkbox} from '@/components/tailgrids/core/checkbox'
import {Input} from '@/components/tailgrids/core/input'
import {TextArea} from '@/components/tailgrids/core/text-area'
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/tailgrids/core/select'
import {Backdrop} from '@/components/tailgrids/core/overlay'
import {
  useCreateAdmissionDocumentTypeMutation,
  useUpdateAdmissionDocumentTypeMutation,
} from '@/hooks/use-admission-catalog-queries'
import type {AdmissionDocumentTypeOption, AdmissionDocumentTypeStatus} from '@/services/api/admission-profile-catalog'
import {Button} from '@/components/tailgrids/core/button'

import {SPECIAL_PROFILE_CONDITION_OPTIONS, includeCurrentOption} from './admission-profile-template-editor-types'

const CATEGORY_OPTIONS = [
  {value: 'identity', label: 'Giấy tờ định danh'},
  {value: 'education', label: 'Học tập'},
  {value: 'photo', label: 'Ảnh'},
  {value: 'payment', label: 'Thanh toán'},
  {value: 'scholarship', label: 'Học bổng'},
  {value: 'language', label: 'Ngoại ngữ'},
  {value: 'special_program', label: 'Chương trình đặc biệt'},
] as const

interface DocumentTypeForm {
  code: string
  label: string
  category: string
  description: string
  conditionalKey: string
  status: AdmissionDocumentTypeStatus
  isActive: boolean
}

function formFromRecord(record: AdmissionDocumentTypeOption | null): DocumentTypeForm {
  return {
    code: record?.code ?? '',
    label: record?.name ?? '',
    category: record?.category ?? CATEGORY_OPTIONS[0].value,
    description: record?.description ?? '',
    conditionalKey: record?.conditionalKey ?? '',
    status: record?.status ?? 'Active',
    isActive: record?.isActive ?? true,
  }
}

export function AdmissionDocumentTypeEditorDialog({
  isOpen,
  record,
  onOpenChange,
}: {
  isOpen: boolean
  record: AdmissionDocumentTypeOption | null
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState(() => formFromRecord(record))
  const createMutation = useCreateAdmissionDocumentTypeMutation()
  const updateMutation = useUpdateAdmissionDocumentTypeMutation()
  const isSaving = createMutation.isPending || updateMutation.isPending
  const conditionOptions = includeCurrentOption(SPECIAL_PROFILE_CONDITION_OPTIONS, form.conditionalKey)

  const setField = <K extends keyof DocumentTypeForm>(field: K, value: DocumentTypeForm[K]) => {
    setForm((current) => ({...current, [field]: value}))
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = form.code.trim().toUpperCase()
    const label = form.label.trim()
    if (!code || !/^[A-Z][A-Z0-9_]{1,49}$/.test(code)) {
      toast.error('Mã loại tài liệu phải dài 2-50 ký tự, gồm A-Z, 0-9 và dấu gạch dưới.')
      return
    }
    if (!label || !form.category) {
      toast.error('Vui lòng nhập tên và nhóm loại tài liệu.')
      return
    }
    if (form.status === 'Active' && !form.isActive) {
      toast.error('Loại tài liệu đang dùng phải được cho phép sử dụng trong hồ sơ mới.')
      return
    }

    const data = {
      code,
      label,
      category: form.category,
      description: form.description.trim() || null,
      conditional_key: form.conditionalKey.trim() || null,
      status: form.status,
      is_active: form.status === 'Active' && form.isActive,
    } as const

    try {
      if (record) {
        await updateMutation.mutateAsync({
          name: record.id,
          data,
          expectedModified: record.modified,
        })
        toast.success(`Đã cập nhật loại tài liệu ${label}.`)
      } else {
        await createMutation.mutateAsync(data)
        toast.success(`Đã tạo loại tài liệu ${label}.`)
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu loại tài liệu.')
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
        aria-label={record ? 'Chỉnh sửa loại tài liệu' : 'Tạo loại tài liệu'}
        className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0"
      >
        <form onSubmit={save}>
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>{record ? 'Chỉnh sửa loại tài liệu' : 'Tạo loại tài liệu'}</DialogTitle>
            <p className="text-sm text-text-tertiary">Loại tài liệu được dùng để dựng checklist hồ sơ nhập học.</p>
          </DialogHeader>
          <DialogBody className="max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto px-5 py-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">Mã loại tài liệu</span>
              <Input
                value={form.code}
                onChange={(event) => setField('code', event.target.value.toUpperCase())}
                disabled={Boolean(record) || isSaving}
                maxLength={50}
                placeholder="Ví dụ: BIRTH_CERTIFICATE"
                className="h-10 w-full"
              />
              <span className="text-xs text-text-tertiary">Mã không thể thay đổi sau khi tạo.</span>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">Tên loại tài liệu</span>
              <Input
                value={form.label}
                onChange={(event) => setField('label', event.target.value)}
                disabled={isSaving}
                placeholder="Ví dụ: Bản sao chứng thực Giấy khai sinh"
                className="h-10 w-full"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">Nhóm tài liệu</span>
                <Select
                  value={form.category}
                  onChange={(value) => setField('category', String(value))}
                  isDisabled={isSaving}
                  className="w-full gap-0"
                >
                  <SelectTrigger className="h-10 w-full justify-between">
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} id={option.value} textValue={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <div className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">Điều kiện áp dụng</span>
                <Select
                  value={form.conditionalKey}
                  onChange={(value) => setField('conditionalKey', String(value))}
                  isDisabled={isSaving}
                  aria-label="Điều kiện áp dụng"
                  className="w-full gap-0"
                >
                  <SelectTrigger className="h-10 w-full justify-between">
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent className="min-w-(--trigger-width)">
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} id={option.value} textValue={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">Mô tả</span>
              <TextArea
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
                disabled={isSaving}
                rows={3}
                placeholder="Mô tả ngắn về tài liệu và trường hợp sử dụng"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">Trạng thái</span>
                <Select
                  value={form.status}
                  onChange={(value) => {
                    const status = String(value) as AdmissionDocumentTypeStatus
                    setForm((current) => ({
                      ...current,
                      status,
                      isActive: status === 'Active' ? current.isActive : false,
                    }))
                  }}
                  isDisabled={isSaving}
                  className="w-full gap-0"
                >
                  <SelectTrigger className="h-10 w-full justify-between">
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="Active" textValue="Đang dùng">
                      Đang dùng
                    </SelectItem>
                    <SelectItem id="Archived" textValue="Lưu trữ">
                      Lưu trữ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <Checkbox
                size="sm"
                isSelected={form.isActive}
                onChange={(selected) => setField('isActive', selected)}
                isDisabled={isSaving || form.status === 'Archived'}
                className="min-h-10 rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 text-sm text-text-secondary"
              >
                Cho phép dùng trong hồ sơ mới
              </Checkbox>
            </div>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button size="sm" type="submit" isDisabled={isSaving}>
              {isSaving ? 'Đang lưu…' : record ? 'Lưu thay đổi' : 'Tạo loại tài liệu'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  )
}
