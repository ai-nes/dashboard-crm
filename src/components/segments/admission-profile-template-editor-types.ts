import type {
  AdmissionMethodOption,
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

export const REQUIREMENT_SECTION_OPTIONS = [
  {value: 'basic_admission', label: 'Hồ sơ thông thường'},
  {value: 'method', label: 'Theo phương thức xét tuyển'},
  {value: 'special_program', label: 'Hồ sơ bổ sung'},
  {value: 'scholarship', label: 'Học bổng'},
]

export const REQUIREMENT_GROUP_OPTIONS = [
  {value: 'BASIC_ADMISSION', label: 'Hồ sơ cơ bản'},
  {value: 'IDENTITY', label: 'Giấy tờ tùy thân'},
  {value: 'GRADUATION', label: 'Tốt nghiệp THPT'},
  {value: 'COLLEGE_GRADUATION', label: 'Tốt nghiệp Cao đẳng'},
  {value: 'ACHIEVEMENT', label: 'Thành tích'},
  {value: 'FIRST_GENERATION', label: 'Thế hệ đầu tiên'},
  {value: 'LANGUAGE_CERTIFICATE', label: 'Chứng chỉ ngoại ngữ'},
  {value: 'INTERNATIONAL_PROGRAM', label: 'Chương trình quốc tế'},
  {value: 'FPT_POLYTECHNIC', label: 'FPT Polytechnic'},
  {value: 'STUDY_NOW_PAY_LATER', label: 'Học trước - trả sau'},
  {value: 'FAMILY_FE_FPT', label: 'Gia đình FE FPT'},
  {value: 'SCHOLARSHIP', label: 'Học bổng'},
]

export const SPECIAL_PROFILE_CONDITION_OPTIONS = [
  {value: '', label: 'Không áp dụng'},
  {value: 'FIRST_GENERATION', label: 'Diện thế hệ đầu tiên'},
  {value: 'LANGUAGE_CERTIFICATE', label: 'Diện chứng chỉ ngoại ngữ'},
  {value: 'INTERNATIONAL_PROGRAM', label: 'Diện chương trình quốc tế'},
  {value: 'ACHIEVEMENT', label: 'Diện thành tích'},
  {value: 'STUDY_NOW_PAY_LATER', label: 'Diện học trước - trả sau'},
  {value: 'FAMILY_FE_FPT', label: 'Diện gia đình FE FPT'},
  {value: 'SCHOLARSHIP', label: 'Diện học bổng'},
]

export type TechnicalSelectOption = {value: string; label: string}

export function includeCurrentOption(
  options: readonly TechnicalSelectOption[],
  currentValue: string,
): TechnicalSelectOption[] {
  if (!currentValue || options.some((option) => option.value === currentValue)) return [...options]
  return [{value: currentValue, label: `Giá trị hiện tại (${currentValue})`}, ...options]
}

export function requirementConditionOptions(
  sectionCode: string,
  admissionMethods: readonly AdmissionMethodOption[],
): TechnicalSelectOption[] {
  const methodOptions = admissionMethods.map((method) => ({
    value: `field:application.admission_method=${method.code || method.id}`,
    label: `Phương thức: ${method.name || method.code || method.id}`,
  }))

  if (sectionCode === 'method') {
    return [{value: '', label: 'Không áp dụng'}, ...methodOptions]
  }

  if (sectionCode === 'special_program' || sectionCode === 'scholarship') {
    return [...SPECIAL_PROFILE_CONDITION_OPTIONS]
  }

  return [
    {value: '', label: 'Không áp dụng'},
    ...methodOptions,
    ...SPECIAL_PROFILE_CONDITION_OPTIONS.slice(1),
  ]
}

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
