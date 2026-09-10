'use client'

import {Badge} from '@/components/tailgrids/core/badge'
import {Input} from '@/components/tailgrids/core/input'
import {Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue} from '@/components/tailgrids/core/select'
import {TextArea} from '@/components/tailgrids/core/text-area'
import type {AdmissionProfileTemplateOption} from '@/services/api/admission-profile-catalog'

import {FieldLabel} from './admission-profile-template-editor-shared'
import {AdmissionProfileTemplateStatusSelect} from './admission-profile-template-status-select'
import {
  ADMISSION_METHODS,
  FIELD_CLASS,
  STATUS_LABELS,
  statusColor,
  type TemplateFieldSetter,
  type TemplateForm,
} from './admission-profile-template-editor-types'

export function AdmissionProfileTemplateOverview({
  form,
  template,
  isSaving,
  setField,
}: {
  form: TemplateForm
  template: AdmissionProfileTemplateOption | null
  isSaving: boolean
  setField: TemplateFieldSetter
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="border-b border-card-border px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Thông tin chung</h2>
            <p className="mt-1 text-sm text-text-secondary">Thông tin hiển thị cho đội tuyển sinh khi chọn loại hồ sơ.</p>
          </div>
          <Badge color={statusColor(form.status)}>{STATUS_LABELS[form.status]}</Badge>
        </div>
      </div>
      <div className="grid gap-4 px-4 py-5 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <label className="block space-y-1.5">
          <FieldLabel>Mã loại hồ sơ</FieldLabel>
          <Input value={form.template_code} onChange={(event) => setField('template_code', event.target.value.toUpperCase())} disabled={Boolean(template) || isSaving} placeholder="Ví dụ: STANDARD" className={FIELD_CLASS} />
          <span className="block text-xs text-text-tertiary">Mã không thể đổi sau khi tạo.</span>
        </label>
        <label className="block space-y-1.5">
          <FieldLabel>Tên loại hồ sơ</FieldLabel>
          <Input value={form.template_name} onChange={(event) => setField('template_name', event.target.value)} disabled={isSaving} placeholder="Ví dụ: Hồ sơ nhập học thông thường" className={FIELD_CLASS} />
        </label>
        <label className="block space-y-1.5">
          <FieldLabel>Nhóm hồ sơ</FieldLabel>
          <Select value={form.template_kind} aria-label="Nhóm hồ sơ" isDisabled={Boolean(template) || isSaving} className="w-full gap-0" onChange={(value) => setField('template_kind', String(value) as TemplateForm['template_kind'])}>
            <SelectTrigger className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              <SelectItem id="standard" textValue="Hồ sơ thông thường">Hồ sơ thông thường</SelectItem>
              <SelectItem id="special" textValue="Hồ sơ bổ sung">Hồ sơ bổ sung</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="block space-y-1.5">
          <FieldLabel>Trạng thái</FieldLabel>
          <AdmissionProfileTemplateStatusSelect
            value={form.status}
            ariaLabel="Trạng thái"
            size="md"
            className="w-full"
            triggerClassName="w-full"
            isDisabled={isSaving || template?.status === 'Archived'}
            onChange={(status) => setField('status', status)}
          />
        </label>
        <label className="block space-y-1.5">
          <FieldLabel>Phiên bản</FieldLabel>
          <Input type="number" min="1" value={form.version} onChange={(event) => setField('version', event.target.value)} disabled={isSaving} className={FIELD_CLASS} />
        </label>
        <label className="block space-y-1.5 md:col-span-1 lg:col-span-2">
          <FieldLabel>Phương thức xét tuyển</FieldLabel>
          <Select value={form.admission_method || 'all'} aria-label="Phương thức xét tuyển" isDisabled={isSaving} className="w-full gap-0" onChange={(value) => setField('admission_method', String(value ?? '') === 'all' ? '' : String(value ?? ''))}>
            <SelectTrigger className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              {ADMISSION_METHODS.map((method) => (
                <SelectItem key={method.value || 'all'} id={method.value || 'all'} textValue={method.label}>{method.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="block space-y-1.5 md:col-span-2 lg:col-span-4">
          <FieldLabel>Mô tả</FieldLabel>
          <TextArea value={form.description} onChange={(event) => setField('description', event.target.value)} disabled={isSaving} rows={3} placeholder="Mô tả mục đích và phạm vi áp dụng của loại hồ sơ" />
        </label>
      </div>
      <details className="border-t border-card-border px-4 py-3 sm:px-6">
        <summary className="cursor-pointer text-sm font-medium text-text-secondary outline-none marker:text-text-tertiary focus-visible:ring-2 focus-visible:ring-primary-500">Thông tin nâng cao</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <FieldLabel>Chương trình đào tạo</FieldLabel>
            <Input value={form.education_program} onChange={(event) => setField('education_program', event.target.value)} disabled={isSaving} placeholder="Có thể để trống nếu dùng chung" className={FIELD_CLASS} />
          </label>
          <div className="rounded-lg bg-background-gray-secondary/60 px-3 py-2.5 text-xs leading-5 text-text-secondary">
            Loại hồ sơ được lưu dưới profile type <span className="font-mono text-text-primary">academic_admission</span>.
          </div>
        </div>
      </details>
    </section>
  )
}
