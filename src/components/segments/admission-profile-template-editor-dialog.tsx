'use client'

import {type ReactNode, useState} from 'react'

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import {Backdrop} from '@/components/tailgrids/core/overlay'
import type {AdmissionDocumentTypeOption, AdmissionProfileTemplateOption} from '@/services/api/admission-profile-catalog'

import {AdmissionProfileTemplateEditor} from './admission-profile-template-editor'

export function AdmissionProfileTemplateEditorDialog({
  template,
  documentTypes,
  children,
}: {
  template: AdmissionProfileTemplateOption | null
  documentTypes: AdmissionDocumentTypeOption[]
  children: (open: () => void) => ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isCreate = !template

  return (
    <>
      {children(() => setIsOpen(true))}
      <Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Dialog
          aria-label={isCreate ? 'Tạo loại hồ sơ' : `Chỉnh sửa ${template.name}`}
          className="flex h-[min(90vh,52rem)] max-h-[calc(100vh-2rem)] max-w-6xl flex-col overflow-hidden p-0"
        >
          <DialogHeader className="shrink-0 border-b border-card-border px-5 py-4 pr-14">
            <DialogTitle className="text-base font-semibold text-text-primary">
              {isCreate ? 'Tạo loại hồ sơ' : 'Chỉnh sửa loại hồ sơ'}
            </DialogTitle>
            <DialogDescription className="truncate text-text-tertiary">
              {isCreate ? 'Nhập thông tin chung trước, sau đó thêm các tài liệu cần nộp.' : template.name}
            </DialogDescription>
          </DialogHeader>
          <AdmissionProfileTemplateEditor
            template={template}
            documentTypes={documentTypes}
            initialSection="overview"
            onSaved={() => setIsOpen(false)}
          />
        </Dialog>
      </Backdrop>
    </>
  )
}
