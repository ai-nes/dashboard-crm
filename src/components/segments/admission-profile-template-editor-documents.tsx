'use client'

import {Trash1} from '@tailgrids/icons'

import {Badge} from '@/components/tailgrids/core/badge'
import {Button} from '@/components/tailgrids/core/button'
import {Input} from '@/components/tailgrids/core/input'
import {Backdrop} from '@/components/tailgrids/core/overlay'
import type {AdmissionDocumentTypeOption} from '@/services/api/admission-profile-catalog'

import {AdmissionProfileTemplateDocumentDetailDialog} from './admission-profile-template-document-detail-dialog'
import {
  documentTypeLabel,
  requirementModeLabel,
  updateRequirement,
  type RequirementForm,
} from './admission-profile-template-editor-types'

export function AdmissionProfileTemplateDocuments({
  requirements,
  documentTypes,
  isSaving,
  selectedGroup,
  documentSearch,
  selectedIndex,
  onAdd,
  onRemove,
  onSelectGroup,
  onSearchChange,
  onSelect,
  onCloseDetail,
  onRequirementsChange,
}: {
  requirements: RequirementForm[]
  documentTypes: AdmissionDocumentTypeOption[]
  isSaving: boolean
  selectedGroup: string
  documentSearch: string
  selectedIndex: number | null
  onAdd: () => void
  onRemove: (index: number) => void
  onSelectGroup: (group: string) => void
  onSearchChange: (value: string) => void
  onSelect: (index: number) => void
  onCloseDetail: () => void
  onRequirementsChange: (requirements: RequirementForm[]) => void
}) {
  const requirementGroups = Array.from(
    new Set(requirements.map((requirement) => requirement.requirement_group.trim() || 'Chưa phân nhóm')),
  )
  const showGroupFilter = requirementGroups.length > 1
  const showSearch = requirements.length > 3
  const normalizedSearch = documentSearch.trim().toLowerCase()
  const visibleRequirements = requirements
    .map((requirement, index) => ({requirement, index}))
    .filter(({requirement}) => {
      const group = requirement.requirement_group.trim() || 'Chưa phân nhóm'
      const matchesGroup = selectedGroup === 'all' || group === selectedGroup
      const matchesSearch = !normalizedSearch || `${documentTypeLabel(requirement.document_type, documentTypes)} ${requirement.document_type} ${requirement.section_code} ${requirement.requirement_group}`.toLowerCase().includes(normalizedSearch)
      return matchesGroup && matchesSearch
    })

  return (
    <section className="overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="border-b border-card-border px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Tài liệu cần nộp</h2>
            <p className="mt-1 text-sm text-text-secondary">Chỉ các tài liệu trong danh sách này mới xuất hiện trong checklist nhập học.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {showSearch && (
              <>
                <Input value={documentSearch} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm tên tài liệu" aria-label="Tìm tài liệu" className="h-9 w-48" />
                <span className="whitespace-nowrap text-xs text-text-tertiary">{visibleRequirements.length}/{requirements.length}</span>
              </>
            )}
            <Button size="sm" appearance="outline" onPress={onAdd} isDisabled={isSaving || documentTypes.length === 0}>+ Thêm tài liệu</Button>
          </div>
        </div>
      </div>

      {showGroupFilter && (
        <div className="border-b border-card-border px-4 py-3 sm:px-5">
          <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-1" aria-label="Lọc theo nhóm tài liệu">
            <button type="button" onClick={() => onSelectGroup('all')} aria-pressed={selectedGroup === 'all'} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 ${selectedGroup === 'all' ? 'bg-badge-primary-background text-badge-primary-text' : 'bg-background-gray-secondary text-text-secondary hover:text-text-primary'}`}>
              Tất cả <span className="ml-1 text-text-tertiary">{requirements.length}</span>
            </button>
            {requirementGroups.map((group) => (
              <button key={group} type="button" onClick={() => onSelectGroup(group)} aria-pressed={selectedGroup === group} className={`max-w-48 shrink-0 truncate rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 ${selectedGroup === group ? 'bg-badge-primary-background text-badge-primary-text' : 'bg-background-gray-secondary text-text-secondary hover:text-text-primary'}`}>
                {group} <span className="ml-1 text-text-tertiary">{requirements.filter((requirement) => (requirement.requirement_group.trim() || 'Chưa phân nhóm') === group).length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-card-border">
        {visibleRequirements.map(({requirement, index}) => {
          const isSelected = selectedIndex === index
          return (
            <div key={`${requirement.document_type}-${index}`} className={`flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5 ${isSelected ? 'bg-badge-primary-background/40' : 'bg-card-background'}`}>
              <button type="button" onClick={() => onSelect(index)} aria-pressed={isSelected} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1.5 text-left outline-none transition-colors hover:bg-background-gray-secondary/50 focus-visible:ring-2 focus-visible:ring-primary-500">
                <span className="shrink-0 font-mono text-xs text-text-tertiary">#{requirement.order_display}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text-primary">{documentTypeLabel(requirement.document_type, documentTypes)}</span>
                  <span className="mt-0.5 block truncate text-xs text-text-tertiary">{requirement.requirement_group.trim() || 'Chưa phân nhóm'} · {requirementModeLabel(requirement.requirement_mode)}</span>
                </span>
                <Badge color={requirement.is_required ? 'primary' : 'gray'} size="sm">{requirement.is_required ? 'Bắt buộc' : 'Tùy chọn'}</Badge>
              </button>
              <Backdrop
                isOpen={isSelected}
                onOpenChange={(open) => {
                  if (!open && isSelected) onCloseDetail()
                }}
              >
                <AdmissionProfileTemplateDocumentDetailDialog
                  requirement={requirement}
                  documentTypes={documentTypes}
                  isSaving={isSaving}
                  onChange={(patch) => onRequirementsChange(updateRequirement(requirements, index, patch))}
                />
              </Backdrop>
              <Button aria-label={`Xóa ${documentTypeLabel(requirement.document_type, documentTypes)}`} iconOnly size="sm" appearance="ghost" variant="danger" onPress={() => onRemove(index)} isDisabled={isSaving}>
                <Trash1 size={15} aria-hidden="true" />
              </Button>
            </div>
          )
        })}
        {visibleRequirements.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-text-primary">{requirements.length ? 'Không có tài liệu phù hợp' : 'Chưa có tài liệu nào'}</p>
            <p className="mt-1 text-sm text-text-tertiary">{requirements.length ? 'Thử đổi từ khóa hoặc nhóm tài liệu.' : 'Thêm tài liệu đầu tiên để tạo checklist nhập học.'}</p>
            {!requirements.length && <Button className="mt-4" size="sm" onPress={onAdd} isDisabled={isSaving || documentTypes.length === 0}>+ Thêm tài liệu</Button>}
          </div>
        )}
      </div>
    </section>
  )
}
