'use client'

import {useState} from 'react'

import {ArrowLeft, Search1} from '@tailgrids/icons'

import {Button} from '@/components/tailgrids/core/button'
import {useAdmissionProfileDocumentTypesQuery} from '@/hooks/use-admission-profile-template-queries'
import {Input} from '@/components/tailgrids/core/input'
import {InputGroup, InputGroupAddon, InputGroupInput} from '@/components/tailgrids/core/input-group'
import {Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue} from '@/components/tailgrids/core/select'
import {TextArea} from '@/components/tailgrids/core/text-area'
import type {AdmissionDocumentTypeOption} from '@/services/api/admission-profile-catalog'

import {FieldLabel} from './admission-profile-template-editor-shared'
import {
  FIELD_CLASS,
  REQUIREMENT_GROUP_OPTIONS,
  REQUIREMENT_SECTION_OPTIONS,
  documentTypeLabel,
  type RequirementForm,
} from './admission-profile-template-editor-types'

type TechnicalSelectOption = {value: string; label: string}

function includeCurrentOption(
  options: readonly TechnicalSelectOption[],
  currentValue: string,
): TechnicalSelectOption[] {
  if (!currentValue || options.some((option) => option.value === currentValue)) return [...options]
  return [{value: currentValue, label: `Giá trị hiện tại (${currentValue})`}, ...options]
}

function TechnicalSelectField({
  label,
  value,
  options,
  isDisabled,
  onChange,
}: {
  label: string
  value: string
  options: readonly TechnicalSelectOption[]
  isDisabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} aria-label={label} isDisabled={isDisabled} className="w-full gap-0" onChange={(nextValue) => onChange(String(nextValue))}>
        <SelectTrigger className="w-full">
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent className="min-w-(--trigger-width)">
          {options.map((option) => <SelectItem key={option.value} id={option.value} textValue={option.label}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  )
}

export function AdmissionProfileTemplateDocumentDetailPage({
  requirement,
  documentTypes,
  isSaving,
  onBack,
  onChange,
}: {
  requirement: RequirementForm
  documentTypes: AdmissionDocumentTypeOption[]
  isSaving: boolean
  onBack: () => void
  onChange: (patch: Partial<RequirementForm>) => void
}) {
  const label = documentTypeLabel(requirement.document_type, documentTypes)
  const [documentTypeSearch, setDocumentTypeSearch] = useState('')
  const documentTypeQuery = useAdmissionProfileDocumentTypesQuery(documentTypeSearch)
  const sectionOptions = includeCurrentOption(REQUIREMENT_SECTION_OPTIONS, requirement.section_code)
  const groupOptions = includeCurrentOption(REQUIREMENT_GROUP_OPTIONS, requirement.requirement_group)
  const hasDocumentTypeSearch = Boolean(documentTypeSearch.trim())
  const visibleDocumentTypes = hasDocumentTypeSearch ? documentTypeQuery.data ?? [] : documentTypes

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-card-border bg-card-background">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-card-border px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <Button appearance="ghost" size="sm" onPress={onBack} isDisabled={isSaving}>
            <ArrowLeft size={16} aria-hidden="true" />
            Quay lại danh sách
          </Button>
          <p className="mt-3 text-xs text-text-tertiary">Tài liệu cần nộp</p>
          <h2 className="text-base font-semibold text-text-primary">Chi tiết tài liệu</h2>
          <p className="truncate text-sm text-text-secondary">{label}</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-4 py-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="block space-y-1.5">
            <FieldLabel>Loại giấy tờ</FieldLabel>
            <Select value={requirement.document_type} aria-label="Loại giấy tờ" isDisabled={isSaving} className="w-full gap-0" onOpenChange={(open) => { if (!open) setDocumentTypeSearch('') }} onChange={(value) => { setDocumentTypeSearch(''); onChange({document_type: String(value)}) }}>
              <SelectTrigger className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent
                className="max-h-[min(24rem,calc(100vh-8rem))] min-w-(--trigger-width)"
                header={
                  <div className="sticky top-0 z-10 border-b border-card-border bg-background-white-secondary p-2">
                    <InputGroup className="h-9 rounded-md">
                      <InputGroupAddon className="px-2.5 text-text-tertiary">
                        <Search1 size={14} aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        autoFocus
                        aria-label="Tìm loại giấy tờ"
                        className="py-1.5 text-xs"
                        value={documentTypeSearch}
                        onChange={(event) => setDocumentTypeSearch(event.target.value)}
                        onKeyDown={(event) => event.stopPropagation()}
                        placeholder="Tìm theo tên hoặc mã..."
                      />
                    </InputGroup>
                  </div>
                }
              >
                {documentTypeQuery.isPending && <SelectItem id="document-type-loading" isDisabled>Đang tìm loại giấy tờ...</SelectItem>}
                {!documentTypeQuery.isPending && documentTypeQuery.isError && <SelectItem id="document-type-error" isDisabled>Không thể tìm loại giấy tờ</SelectItem>}
                {!documentTypeQuery.isPending && !documentTypeQuery.isError && visibleDocumentTypes.map((documentType) => <SelectItem key={documentType.id} id={documentType.id} textValue={documentType.name}>{documentType.name}</SelectItem>)}
                {!documentTypeQuery.isPending && !documentTypeQuery.isError && visibleDocumentTypes.length === 0 && <SelectItem id="document-type-empty" isDisabled>Không tìm thấy loại giấy tờ</SelectItem>}
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

        <details className="mt-6 border-t border-card-border pt-4">
          <summary className="cursor-pointer text-sm font-medium text-text-secondary outline-none marker:text-text-tertiary focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary-500">
            <span>Thông tin kỹ thuật</span>
            <span className="ml-2 text-xs font-normal text-text-tertiary">Tùy chọn nâng cao</span>
          </summary>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-text-tertiary">Các mục này giúp hệ thống tự xếp tài liệu vào đúng nhóm và điều kiện. Bạn chỉ cần thay đổi khi muốn tùy chỉnh checklist.</p>
          <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <TechnicalSelectField label="Nhóm tài liệu" value={requirement.section_code} options={sectionOptions} isDisabled={isSaving} onChange={(value) => onChange({section_code: value})} />
            <TechnicalSelectField label="Mục checklist" value={requirement.requirement_group} options={groupOptions} isDisabled={isSaving} onChange={(value) => onChange({requirement_group: value})} />
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
              <FieldLabel>Điều kiện áp dụng</FieldLabel>
              <Input
                value={requirement.condition_key}
                aria-label="Điều kiện áp dụng"
                onChange={(event) => onChange({condition_key: event.target.value})}
                disabled={isSaving}
                className={FIELD_CLASS}
                placeholder="field:application.admission_method=THPT_SCORE"
              />
              <p className="text-xs text-text-tertiary">Để trống nếu không áp dụng; dùng định dạng field:&lt;nguồn&gt;.&lt;trường&gt;=&lt;giá trị&gt;.</p>
            </label>
          </div>
        </details>
      </div>

    </section>
  )
}
