'use client'

import type {FormEvent} from 'react'

import {EditableCard} from '@/components/common/editable-card'
import {EditableDetailField, type EditableDetailOption} from '@/components/common/editable-detail-field'
import {TextArea} from '@/components/tailgrids/core/text-area'
import type {AdmissionMethodOption, AdmissionProfileTemplateOption} from '@/services/api/admission-profile-catalog'

import {AdmissionProfileTemplateStatusSelect} from './admission-profile-template-status-select'
import {
  STATUS_LABELS,
  type TemplateFieldSetter,
  type TemplateForm,
} from './admission-profile-template-editor-types'

const TEMPLATE_KIND_OPTIONS: EditableDetailOption[] = [
  {id: 'standard', label: 'Hồ sơ thông thường'},
  {id: 'special', label: 'Hồ sơ bổ sung'},
]

function selectedLabel(options: EditableDetailOption[], value: string): string {
  return options.find((option) => option.id === value)?.label || '-'
}

export function AdmissionProfileTemplateOverview({
  form,
  template,
  admissionMethods,
  isSaving,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  setField,
}: {
  form: TemplateForm
  template: AdmissionProfileTemplateOption | null
  admissionMethods: AdmissionMethodOption[]
  isSaving: boolean
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (event: FormEvent<HTMLFormElement>) => void
  setField: TemplateFieldSetter
}) {
  const hasSelectedAdmissionMethod = admissionMethods.some(
    (method) => (method.code || method.id) === form.admission_method,
  )
  const admissionMethodOptions: EditableDetailOption[] = [
    {id: '', label: 'Tất cả phương thức'},
    ...(form.admission_method && !hasSelectedAdmissionMethod
      ? [{id: form.admission_method, label: form.admission_method}]
      : []),
    ...admissionMethods.map((method) => ({id: method.code || method.id, label: method.name})),
  ]

  return (
    <EditableCard
      title="Thông tin chung"
      editLabel="Chỉnh sửa thông tin chung"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      className="p-4 sm:p-5"
    >
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <EditableDetailField
          isEditing={isEditing}
          label="Mã loại hồ sơ"
          onChange={(value) => setField('template_code', value.toUpperCase())}
          placeholder="Ví dụ: STANDARD"
          readOnly={Boolean(template)}
          value={form.template_code}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Tên loại hồ sơ"
          onChange={(value) => setField('template_name', value)}
          placeholder="Ví dụ: Hồ sơ nhập học thông thường"
          value={form.template_name}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Nhóm hồ sơ"
          onChange={(value) => setField('template_kind', value as TemplateForm['template_kind'])}
          options={TEMPLATE_KIND_OPTIONS}
          value={isEditing ? form.template_kind : selectedLabel(TEMPLATE_KIND_OPTIONS, form.template_kind)}
        />
        <div className="min-w-0">
          <dt className="text-xs text-text-tertiary">Trạng thái</dt>
          {isEditing ? (
            <AdmissionProfileTemplateStatusSelect
              value={form.status}
              ariaLabel="Trạng thái"
              className="mt-1.5 w-full"
              triggerClassName="w-full"
              isDisabled={isSaving || template?.status === 'Archived'}
              onChange={(status) => setField('status', status)}
            />
          ) : (
            <dd className="mt-1 text-sm font-medium text-text-primary">{STATUS_LABELS[form.status]}</dd>
          )}
        </div>
        <EditableDetailField
          isEditing={isEditing}
          label="Phiên bản"
          readOnly
          type="number"
          value={form.version}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Chương trình đào tạo"
          onChange={(value) => setField('education_program', value)}
          placeholder="Có thể để trống nếu dùng chung"
          value={form.education_program}
        />
        <EditableDetailField
          className="sm:col-span-2"
          isEditing={isEditing}
          label="Phương thức xét tuyển"
          onChange={(value) => setField('admission_method', value)}
          options={admissionMethodOptions}
          value={isEditing ? form.admission_method : selectedLabel(admissionMethodOptions, form.admission_method)}
        />
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-xs text-text-tertiary">Mô tả</dt>
          {isEditing ? (
            <TextArea
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              disabled={isSaving}
              rows={2}
              className="mt-1.5 min-h-20 resize-y px-3 py-2.5 text-sm"
              placeholder="Mô tả mục đích và phạm vi áp dụng của loại hồ sơ"
            />
          ) : (
            <dd className="mt-1 text-sm font-medium text-text-primary" title={form.description || '-'}>
              {form.description || '-'}
            </dd>
          )}
        </div>
      </dl>
    </EditableCard>
  )
}
