"use client";

import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardTitle } from "@/components/tailgrids/core/card";

import ContentCreateMenu from "../../_components/content-create-menu";
import MessageTemplateCreateDialog from "./message-template-create-dialog";
import MessageTemplateLibraryDialog from "./message-template-library-dialog";
import MessageTemplateList from "./message-template-list";
import {
  mockMessageTemplates,
  type MessageTemplateRecord,
} from "./message-template-data";
import type { MessageTemplateDraft } from "./message-template-create-types";

const emptyDraft: MessageTemplateDraft = {
  name: "",
  subject: "",
  body: "",
};

function getDraftForTemplate(template: MessageTemplateRecord | null): MessageTemplateDraft {
  if (!template) return emptyDraft;

  return {
    name: template.name,
    subject: template.subject,
    body: template.body,
  };
}

function getNextTemplateCode(templates: MessageTemplateRecord[]) {
  const highestCode = templates.reduce((highest, template) => {
    const codeNumber = Number.parseInt(template.code.replace(/\D/g, ""), 10);

    return Number.isNaN(codeNumber) ? highest : Math.max(highest, codeNumber);
  }, 0);

  return `MSG-${String(highestCode + 1).padStart(3, "0")}`;
}

export default function MessageTemplatePage() {
  const [templates, setTemplates] = useState(mockMessageTemplates);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<MessageTemplateRecord | null>(null);
  const [draft, setDraft] = useState<MessageTemplateDraft>(emptyDraft);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [selectedContact, setSelectedContact] = useState("");

  const openCreateDialog = () => {
    setTemplateToEdit(null);
    setDraft(emptyDraft);
    setIsPreviewVisible(true);
    setSelectedContact("");
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (template: MessageTemplateRecord) => {
    setTemplateToEdit(template);
    setDraft(getDraftForTemplate(template));
    setIsPreviewVisible(true);
    setSelectedContact("");
    setIsCreateDialogOpen(true);
  };

  const updateDraft = (field: keyof MessageTemplateDraft, value: string) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) setTemplateToEdit(null);
  };

  const saveTemplate = (draft: MessageTemplateDraft) => {
    const now = new Date().toISOString();

    setTemplates((currentTemplates) => {
      if (templateToEdit) {
        return currentTemplates.map((template) =>
          template.id === templateToEdit.id
            ? {
                ...template,
                name: draft.name.trim(),
                subject: draft.subject,
                body: draft.body,
                modifiedAt: now,
              }
            : template,
        );
      }

      return [
        {
          id: `mt-${Date.now()}`,
          code: getNextTemplateCode(currentTemplates),
          name: draft.name.trim(),
          owner: "Thịnh Phú",
          createdAt: now,
          modifiedAt: now,
          subject: draft.subject,
          body: draft.body,
        },
        ...currentTemplates,
      ];
    });
  };

  const duplicateTemplate = (template: MessageTemplateRecord) => {
    const now = new Date().toISOString();

    setTemplates((currentTemplates) => [
      {
        ...template,
        id: `${template.id}-copy-${Date.now()}`,
        code: getNextTemplateCode(currentTemplates),
        name: `${template.name} (Bản sao)`,
        createdAt: now,
        modifiedAt: now,
      },
      ...currentTemplates,
    ]);
  };

  const deleteTemplate = (template: MessageTemplateRecord) => {
    setTemplates((currentTemplates) =>
      currentTemplates.filter((currentTemplate) => currentTemplate.id !== template.id),
    );
  };

  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <Badge color="primary">MẪU &amp; NỘI DUNG</Badge>
          <CardTitle level={1} className="mt-4 text-[28px] leading-8">
            Message Template
          </CardTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Quản lý các mẫu tin nhắn được sử dụng trong quá trình chăm sóc học sinh.
          </p>
        </div>
        <ContentCreateMenu
          onCreateNew={openCreateDialog}
          onCreateFromTemplate={() => setIsLibraryOpen(true)}
        />
      </Card>

      <MessageTemplateList
        templates={templates}
        onDuplicate={duplicateTemplate}
        onDelete={deleteTemplate}
        onEdit={openEditDialog}
      />

      <MessageTemplateLibraryDialog
        isOpen={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
      />
      <MessageTemplateCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={handleCreateDialogChange}
        draft={draft}
        onDraftChange={updateDraft}
        template={templateToEdit}
        onSave={saveTemplate}
        isPreviewVisible={isPreviewVisible}
        onPreviewVisibilityChange={setIsPreviewVisible}
        selectedContact={selectedContact}
        onContactChange={setSelectedContact}
      />
    </main>
  );
}
