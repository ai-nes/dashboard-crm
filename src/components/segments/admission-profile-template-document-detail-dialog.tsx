'use client'

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import {Input} from '@/components/tailgrids/core/input'
import {Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue} from '@/components/tailgrids/core/select'
import {TextArea} from '@/components/tailgrids/core/text-area'
import type {AdmissionDocumentTypeOption} from '@/services/api/admission-profile-catalog'

import {FieldLabel} from './admission-profile-template-editor-shared'
import {
  FIELD_CLASS,
  documentTypeLabel,
  type RequirementForm,
} from './admission-profile-template-editor-types'

export function AdmissionProfileTemplateDocumentDetailDialog({
  requirement,
  documentTypes,
  isSaving,
  onChange,
}: {
  requirement: RequirementForm
  documentTypes: AdmissionDocumentTypeOption[]
  isSaving: boolean
  onChange: (patch: Partial<RequirementForm>) => void
}) {
  const label = documentTypeLabel(requirement.document_type, documentTypes)

  return (
    <Dialog
      aria-label={`Chi tiết ${label}`}
      className="flex max-h-[calc(100vh-2rem)] max-w-3xl flex-col overflow-hidden p-0"
    >
      <DialogHeader className="shrink-0 border-b border-card-border px-5 py-4 pr-14">
        <DialogTitle className="text-base font-semibold text-text-primary">Chi tiết tài liệu</DialogTitle>
        <DialogDescription className="truncate text-text-tertiary">{label}</DialogDescription>
      </DialogHeader>

      <DialogBody className="min-h-0 overflow-y-auto px-5 py-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="block space-y-1.5">
            <FieldLabel>Loại giấy tờ</FieldLabel>
            <Select value={requirement.document_type} aria-label="Loại giấy tờ" isDisabled={isSaving} className="w-full gap-0" onChange={(value) => onChange({document_type: String(value)})}>
              <SelectTrigger className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent className="min-w-(--trigger-width)">
                {documentTypes.map((documentType) => <SelectItem key={documentType.id} id={documentType.id} textValue={documentType.name}>{documentType.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-text-secondary">
            <input type="checkbox" checked={requirement.is_required} onChange={(event) => onChange({is_required: event.target.checked})} disabled={isSaving} className="size-4 rounded border-card-border text-primary-500 focus:ring-primary-500" />
            Bắt buộc
          </label>
          <label className="block space-y-1.5 md:col-span-2">
            <FieldLabel>Chú thích hiển thị</FieldLabel>
            <TextArea value={requirement.instruction} onChange={(event) => onChange({instruction: event.target.value})} disabled={isSaving} rows={3} placeholder="Ví dụ: Ảnh 3x4 chụp đồng phục học sinh" />
          </label>
        </div>

        <details className="mt-5 border-t border-card-border pt-3">
          <summary className="cursor-pointer text-sm font-medium text-text-secondary outline-none marker:text-text-tertiary focus-visible:ring-2 focus-visible:ring-primary-500">Thông tin kỹ thuật</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="block space-y-1.5">
              <FieldLabel>Section</FieldLabel>
              <Input value={requirement.section_code} onChange={(event) => onChange({section_code: event.target.value})} disabled={isSaving} className={FIELD_CLASS} />
            </label>
            <label className="block space-y-1.5">
              <FieldLabel>Nhóm yêu cầu</FieldLabel>
              <Input value={requirement.requirement_group} onChange={(event) => onChange({requirement_group: event.target.value})} disabled={isSaving} className={FIELD_CLASS} />
            </label>
            <label className="block space-y-1.5">
              <FieldLabel>Kiểu yêu cầu</FieldLabel>
              <Select value={requirement.requirement_mode} aria-label="Kiểu yêu cầu" isDisabled={isSaving} className="w-full gap-0" onChange={(value) => {
                const mode = String(value) as RequirementForm['requirement_mode']
                onChange({requirement_mode: mode, quantity: mode === 'ANY' ? '1' : requirement.quantity})
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent className="min-w-(--trigger-width)">
                  <SelectItem id="ALL" textValue="Bắt buộc tất cả">Bắt buộc tất cả</SelectItem>
                  <SelectItem id="ANY" textValue="Chọn một trong nhóm">Chọn một trong nhóm</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="block space-y-1.5">
              <FieldLabel>Thứ tự</FieldLabel>
              <Input type="number" min="1" value={requirement.order_display} onChange={(event) => onChange({order_display: event.target.value})} disabled={isSaving} className={FIELD_CLASS} />
            </label>
            <label className="block space-y-1.5">
              <FieldLabel>Tối thiểu</FieldLabel>
              <Input type="number" min="1" value={requirement.min_required} onChange={(event) => onChange({min_required: event.target.value})} disabled={isSaving} className={FIELD_CLASS} />
            </label>
            <label className="block space-y-1.5">
              <FieldLabel>Số bản</FieldLabel>
              <Input type="number" min="1" value={requirement.quantity} onChange={(event) => onChange({quantity: event.target.value})} disabled={isSaving || requirement.requirement_mode === 'ANY'} className={FIELD_CLASS} />
            </label>
            <label className="block space-y-1.5 md:col-span-2">
              <FieldLabel>Mã điều kiện</FieldLabel>
              <Input value={requirement.condition_key} onChange={(event) => onChange({condition_key: event.target.value})} disabled={isSaving} placeholder="Ví dụ: FIRST_GENERATION" className={FIELD_CLASS} />
            </label>
          </div>
        </details>
      </DialogBody>

      <DialogFooter className="shrink-0 border-t border-card-border px-5 py-3">
        <DialogClose appearance="outline" size="sm">Đóng</DialogClose>
      </DialogFooter>
    </Dialog>
  )
}
