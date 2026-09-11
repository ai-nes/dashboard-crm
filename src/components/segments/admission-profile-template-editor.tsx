'use client'

import {type FormEvent, useState} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/tailgrids/core/button'
import {useAdmissionMethodsQuery} from '@/hooks/use-admission-catalog-queries'
import {
  useCreateAdmissionProfileTemplateMutation,
  useUpdateAdmissionProfileTemplateMutation,
} from '@/hooks/use-admission-profile-template-queries'
import type {
  AdmissionDocumentTypeOption,
  AdmissionProfileTemplateMutationInput,
  AdmissionProfileTemplateOption,
  AdmissionProfileTemplateRequirementInput,
} from '@/services/api/admission-profile-catalog'

import {AdmissionProfileTemplateDocuments} from './admission-profile-template-editor-documents'
import {AdmissionProfileTemplateOverview} from './admission-profile-template-editor-overview'
import {
  type EditorSection,
  type RequirementForm,
  type TemplateFieldSetter,
  type TemplateForm,
} from './admission-profile-template-editor-types'

function toRequirementForm(
  requirement: AdmissionProfileTemplateOption['requirements'][number],
): RequirementForm {
  return {
    section_code: requirement.sectionCode,
    document_type: requirement.documentType,
    requirement_group: requirement.requirementGroup,
    requirement_mode: requirement.requirementMode,
    is_required: requirement.isRequired,
    min_required: String(requirement.minimumRequired || 1),
    quantity: String(requirement.quantity || 1),
    order_display: String(requirement.orderDisplay || 1),
    condition_key: requirement.conditionKey || '',
    instruction: requirement.instruction || '',
  }
}

function initialForm(template: AdmissionProfileTemplateOption | null): TemplateForm {
  return {
    template_code: template?.code || '',
    template_name: template?.name || '',
    template_kind: template?.templateKind || 'standard',
    status: template?.status || 'Draft',
    version: String(template?.version || 1),
    education_program: template?.educationProgram || '',
    admission_method: template?.admissionMethod || '',
    description: template?.description || '',
    requirements:
      template?.requirements
        ?.slice()
        .sort((left, right) => left.orderDisplay - right.orderDisplay)
        .map(toRequirementForm) || [],
  }
}

function toMutationInput(form: TemplateForm, version: number): AdmissionProfileTemplateMutationInput {
  return {
    template_code: form.template_code.trim().toUpperCase(),
    template_name: form.template_name.trim(),
    template_kind: form.template_kind,
    profile_type: 'academic_admission',
    status: form.status,
    version,
    education_program: form.education_program.trim() || null,
    admission_method: form.admission_method || null,
    description: form.description.trim() || null,
    requirements: form.requirements.map<AdmissionProfileTemplateRequirementInput>((requirement) => ({
      section_code: requirement.section_code.trim(),
      document_type: requirement.document_type,
      requirement_group: requirement.requirement_group.trim(),
      requirement_mode: requirement.requirement_mode,
      is_required: requirement.is_required,
      min_required: Number(requirement.min_required),
      quantity: Number(requirement.quantity),
      order_display: Number(requirement.order_display),
      condition_key: requirement.condition_key.trim() || null,
      instruction: requirement.instruction.trim() || null,
    })),
  }
}

function requirementForNewRow(
  documentType: AdmissionDocumentTypeOption,
  order: number,
): RequirementForm {
  return {
    section_code: 'basic_admission',
    document_type: documentType.id,
    requirement_group: 'BASIC_ADMISSION',
    requirement_mode: 'ALL',
    is_required: true,
    min_required: '1',
    quantity: '1',
    order_display: String(order),
    condition_key: '',
    instruction: documentType.description || '',
  }
}

function SectionTab({
  active,
  controls,
  id,
  label,
  value,
  count,
  onPress,
}: {
  active: boolean
  controls: string
  id: string
  label: string
  value: EditorSection
  count?: number
  onPress: (value: EditorSection) => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      id={id}
      onClick={() => onPress(value)}
      className={`border-b-2 px-1 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 sm:px-2 ${active ? 'border-primary-500 text-primary-600' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${active ? 'bg-badge-primary-background text-badge-primary-text' : 'bg-background-gray-secondary text-text-tertiary'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

export function AdmissionProfileTemplateEditor({
  template,
  documentTypes,
  initialSection = 'overview',
  onSaved,
}: {
  template: AdmissionProfileTemplateOption | null
  documentTypes: AdmissionDocumentTypeOption[]
  initialSection?: EditorSection
  onSaved: () => void
}) {
  const [form, setForm] = useState(() => initialForm(template))
  const [activeSection, setActiveSection] = useState<EditorSection>(initialSection)
  const [isOverviewEditing, setIsOverviewEditing] = useState(() => !template)
  const [selectedRequirementIndex, setSelectedRequirementIndex] = useState<number | null>(null)
  const [selectedRequirementGroup, setSelectedRequirementGroup] = useState('all')
  const [documentSearch, setDocumentSearch] = useState('')
  const createMutation = useCreateAdmissionProfileTemplateMutation()
  const updateMutation = useUpdateAdmissionProfileTemplateMutation()
  const methodsQuery = useAdmissionMethodsQuery({includeDisabled: false})
  const isSaving = createMutation.isPending || updateMutation.isPending
  const admissionMethods = methodsQuery.data?.methods || []

  const setField: TemplateFieldSetter = (field, value) => {
    setForm((current) => ({...current, [field]: value}))
  }

  const addRequirement = () => {
    const selectedIds = new Set(form.requirements.map((requirement) => requirement.document_type))
    const nextDocumentType = documentTypes.find((documentType) => !selectedIds.has(documentType.id))
    if (!nextDocumentType) {
      toast.info('Tất cả loại giấy tờ đang có đã được thêm vào loại hồ sơ.')
      return
    }
    const nextOrder = form.requirements.reduce(
      (maximum, requirement) => Math.max(maximum, Number(requirement.order_display) || 0),
      0,
    ) + 1
    setField('requirements', [
      ...form.requirements,
      requirementForNewRow(nextDocumentType, nextOrder),
    ])
    setSelectedRequirementIndex(form.requirements.length)
  }

  const removeRequirement = (index: number) => {
    setField('requirements', form.requirements.filter((_, itemIndex) => itemIndex !== index))
    setSelectedRequirementIndex((current) => {
      if (current === null || current === index) return null
      return current > index ? current - 1 : current
    })
  }

  const cancelOverviewEditing = () => {
    if (isSaving) return
    const initial = initialForm(template)
    setForm((current) => ({
      ...current,
      template_code: initial.template_code,
      template_name: initial.template_name,
      template_kind: initial.template_kind,
      status: initial.status,
      version: initial.version,
      education_program: initial.education_program,
      admission_method: initial.admission_method,
      description: initial.description,
    }))
    setIsOverviewEditing(false)
  }

  const save = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const nextVersion = template ? Math.max(1, template.version || 1) + 1 : 1
    const input = toMutationInput(form, nextVersion)
    if (!input.template_code || !/^[A-Z][A-Z0-9_]*$/.test(input.template_code)) {
      toast.error('Mã loại hồ sơ phải bắt đầu bằng A-Z và chỉ gồm A-Z, 0-9, dấu gạch dưới.')
      setActiveSection('overview')
      return
    }
    if (!input.template_name) {
      toast.error('Vui lòng nhập tên loại hồ sơ.')
      setActiveSection('overview')
      return
    }
    if (!Number.isInteger(input.version) || input.version < 1) {
      toast.error('Phiên bản phải là số nguyên dương.')
      setActiveSection('overview')
      return
    }
    if (input.status === 'Active' && input.requirements.length === 0) {
      toast.error('Loại hồ sơ đang dùng phải có ít nhất một loại giấy tờ.')
      setActiveSection('documents')
      return
    }
    const documentIds = input.requirements.map((requirement) => requirement.document_type)
    const orderValues = input.requirements.map((requirement) => requirement.order_display)
    if (new Set(documentIds).size !== documentIds.length) {
      toast.error('Mỗi loại giấy tờ chỉ được xuất hiện một lần trong loại hồ sơ.')
      setActiveSection('documents')
      return
    }
    if (new Set(orderValues).size !== orderValues.length || orderValues.some((value) => value < 1)) {
      toast.error('Thứ tự hiển thị phải là số dương và không được trùng nhau.')
      setActiveSection('documents')
      return
    }
    if (input.requirements.some((requirement) => !requirement.section_code || !requirement.requirement_group)) {
      toast.error('Mỗi tài liệu cần có section và nhóm yêu cầu.')
      setActiveSection('documents')
      return
    }
    try {
      if (template) {
        await updateMutation.mutateAsync({
          name: template.id,
          expectedModified: template.modified,
          data: input,
        })
        toast.success(`Đã cập nhật ${input.template_name}.`)
      } else {
        await createMutation.mutateAsync(input)
        toast.success(`Đã tạo ${input.template_name}.`)
      }
      onSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu loại hồ sơ.')
    }
  }

  return (
    <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-card-background text-text-primary">
      <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-card-border px-4 sm:px-8" role="tablist" aria-label="Nội dung loại hồ sơ">
        <SectionTab
          active={activeSection === 'overview'}
          controls="admission-template-overview-panel"
          id="admission-template-overview-tab"
          label="Thông tin chung"
          value="overview"
          onPress={setActiveSection}
        />
        <SectionTab
          active={activeSection === 'documents'}
          controls="admission-template-documents-panel"
          id="admission-template-documents-tab"
          label="Tài liệu cần nộp"
          value="documents"
          count={form.requirements.length}
          onPress={setActiveSection}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-background-gray-secondary/20">
        <div className="w-full px-3 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div
            role="tabpanel"
            id={activeSection === 'overview' ? 'admission-template-overview-panel' : 'admission-template-documents-panel'}
            aria-labelledby={activeSection === 'overview' ? 'admission-template-overview-tab' : 'admission-template-documents-tab'}
          >
            {activeSection === 'overview' ? (
              <AdmissionProfileTemplateOverview
                form={form}
                template={template}
                admissionMethods={admissionMethods}
                isSaving={isSaving}
                isEditing={isOverviewEditing}
                onEdit={() => setIsOverviewEditing(true)}
                onCancel={cancelOverviewEditing}
                onSave={(event) => void save(event)}
                setField={setField}
              />
            ) : (
              <AdmissionProfileTemplateDocuments
                requirements={form.requirements}
                documentTypes={documentTypes}
                isSaving={isSaving}
                selectedGroup={selectedRequirementGroup}
                documentSearch={documentSearch}
                selectedIndex={selectedRequirementIndex}
                onAdd={addRequirement}
                onRemove={removeRequirement}
                onSelectGroup={setSelectedRequirementGroup}
                onSearchChange={setDocumentSearch}
                onSelect={setSelectedRequirementIndex}
                onCloseDetail={() => setSelectedRequirementIndex(null)}
                onRequirementsChange={(requirements) => setField('requirements', requirements)}
              />
            )}
          </div>
        </div>
      </div>

      {activeSection === 'documents' && (
        <footer className="flex shrink-0 justify-end border-t border-card-border bg-card-background px-3 py-3 sm:px-6">
          <Button size="sm" onPress={() => void save()} isDisabled={isSaving}>
            {isSaving ? 'Đang lưu…' : template ? 'Lưu thay đổi' : 'Tạo loại hồ sơ'}
          </Button>
        </footer>
      )}

    </main>
  )
}
