import type {
  AdmissionDocumentTypeOption,
  AdmissionProfileTemplateOption,
  AdmissionProfileTemplateStatus,
} from '@/services/api/admission-profile-catalog'

export const FIELD_CLASS = 'h-10 w-full'
export const SELECT_CLASS =
  'h-10 w-full rounded-lg border border-card-border bg-input-background px-3 text-sm text-text-primary outline-none focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:text-input-disabled-text'

export const STATUS_LABELS: Record<AdmissionProfileTemplateStatus, string> = {
  Draft: 'Bản nháp',
  Active: 'Đang dùng',
  Archived: 'Lưu trữ',
}

export const ADMISSION_METHODS = [
  {value: '', label: 'Tất cả phương thức'},
  {value: 'THPT_SCORE', label: 'Xét điểm THPT'},
  {value: 'DIRECT_ADMISSION', label: 'Xét tuyển thẳng'},
]

export type EditorSection = 'overview' | 'documents'

export interface RequirementForm {
  section_code: string
  document_type: string
  requirement_group: string
  requirement_mode: 'ALL' | 'ANY'
  is_required: boolean
  min_required: string
  quantity: string
  order_display: string
  condition_key: string
  instruction: string
}

export interface TemplateForm {
  template_code: string
  template_name: string
  template_kind: 'standard' | 'special'
  status: AdmissionProfileTemplateStatus
  version: string
  education_program: string
  admission_method: string
  description: string
  requirements: RequirementForm[]
}

export type TemplateFieldSetter = <K extends keyof TemplateForm>(
  field: K,
  value: TemplateForm[K],
) => void

export function statusColor(status: AdmissionProfileTemplateStatus): 'gray' | 'success' | 'warning' {
  if (status === 'Active') return 'success'
  if (status === 'Draft') return 'warning'
  return 'gray'
}

export function documentTypeLabel(
  documentType: string,
  documentTypes: AdmissionDocumentTypeOption[],
): string {
  return documentTypes.find((item) => item.id === documentType)?.name || documentType
}

export function requirementModeLabel(mode: 'ALL' | 'ANY'): string {
  return mode === 'ANY' ? 'Chọn một trong nhóm' : 'Bắt buộc tất cả'
}

export function updateRequirement(
  requirements: RequirementForm[],
  index: number,
  patch: Partial<RequirementForm>,
): RequirementForm[] {
  return requirements.map((requirement, requirementIndex) =>
    requirementIndex === index ? {...requirement, ...patch} : requirement,
  )
}

export type TemplateOption = AdmissionProfileTemplateOption
