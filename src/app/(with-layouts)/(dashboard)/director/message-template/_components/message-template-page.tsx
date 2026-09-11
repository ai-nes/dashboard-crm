"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardTitle } from "@/components/tailgrids/core/card";
import { getCurrentUser, type CurrentUser } from "@/services/api/auth";
import {
  createMessageTemplate,
  deleteMessageTemplate,
  listMessageTemplates,
  updateMessageTemplate,
} from "@/services/api/message-templates";
import { listSnippets, type SnippetRecord } from "@/services/api/snippets";

import ContentCreateMenu from "../../_components/content-create-menu";
import { normalizeMessageTemplateBody } from "./message-template-body";
import MessageTemplateCreateDialog from "./message-template-create-dialog";
import MessageTemplateLibraryDialog from "./message-template-library-dialog";
import MessageTemplateList from "./message-template-list";
import type { MessageTemplateRecord } from "./message-template-data";
import type { MessageTemplateDraft } from "./message-template-create-types";

const emptyDraft: MessageTemplateDraft = {
  name: "",
  subject: "",
  body: "",
  sharing: "public",
};

function getDraftForTemplate(template: MessageTemplateRecord | null): MessageTemplateDraft {
  if (!template) return emptyDraft;

  return {
    name: template.name,
    subject: template.subject,
    body: normalizeMessageTemplateBody(template.body),
    sharing: template.sharing,
  };
}

export default function MessageTemplatePage() {
  const [templates, setTemplates] = useState<MessageTemplateRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<MessageTemplateRecord | null>(null);
  const [draft, setDraft] = useState<MessageTemplateDraft>(emptyDraft);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [selectedContact, setSelectedContact] = useState("");
  const [snippets, setSnippets] = useState<SnippetRecord[]>([]);
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(true);
  const [snippetsError, setSnippetsError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [response, user] = await Promise.all([
        listMessageTemplates(),
        getCurrentUser(),
      ]);
      setTemplates(response.templates);
      setCurrentUser(user);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không thể tải mẫu email.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSnippets = useCallback(async () => {
    setIsLoadingSnippets(true);
    setSnippetsError(null);
    try {
      const response = await listSnippets();
      setSnippets(response.snippets);
    } catch (error) {
      setSnippetsError(error instanceof Error ? error.message : "Không thể tải snippet.");
    } finally {
      setIsLoadingSnippets(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTemplates();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTemplates]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSnippets();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSnippets]);

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

  const useLibraryTemplate = (libraryDraft: MessageTemplateDraft) => {
    setTemplateToEdit(null);
    setDraft({
      ...libraryDraft,
      body: normalizeMessageTemplateBody(libraryDraft.body),
    });
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

  const saveTemplate = async (nextDraft: MessageTemplateDraft) => {
    setIsSaving(true);
    const normalizedDraft = {
      ...nextDraft,
      body: normalizeMessageTemplateBody(nextDraft.body),
    };
    try {
      if (templateToEdit) {
        await updateMessageTemplate(
          templateToEdit.id,
          normalizedDraft,
          templateToEdit.modifiedAt,
        );
        toast.success("Đã lưu thay đổi mẫu email.");
      } else {
        await createMessageTemplate(normalizedDraft);
        toast.success("Đã tạo mẫu email.");
      }
      await loadTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu mẫu email.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const duplicateTemplate = async (template: MessageTemplateRecord) => {
    try {
      await createMessageTemplate({
        name: `${template.name} (Bản sao)`,
        subject: template.subject,
        body: template.body,
        sharing: template.sharing,
      });
      toast.success("Đã nhân bản mẫu email.");
      await loadTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể nhân bản mẫu email.");
    }
  };

  const deleteTemplate = async (template: MessageTemplateRecord) => {
    if (!window.confirm(`Xóa mẫu “${template.name}”?`)) return;
    try {
      await deleteMessageTemplate(template.id, template.modifiedAt);
      toast.success("Đã xóa mẫu email.");
      await loadTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa mẫu email.");
    }
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

      {loadError ? (
        <Card className="border-button-error-outline-stroke p-6 text-sm text-button-error-outline-text">
          <p>{loadError}</p>
          <button type="button" className="mt-3 underline" onClick={() => void loadTemplates()}>
            Thử lại
          </button>
        </Card>
      ) : (
        <MessageTemplateList
          templates={templates}
          currentUserId={currentUser?.user ?? currentUser?.email}
          isLoading={isLoading}
          onDuplicate={duplicateTemplate}
          onDelete={deleteTemplate}
          onEdit={openEditDialog}
        />
      )}

      <MessageTemplateLibraryDialog
        isOpen={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onUseTemplate={useLibraryTemplate}
      />
      <MessageTemplateCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={handleCreateDialogChange}
        draft={draft}
        ownerName={templateToEdit?.owner ?? currentUser?.full_name ?? "Bạn"}
        onDraftChange={updateDraft}
        template={templateToEdit}
        onSave={saveTemplate}
        isSaving={isSaving}
        isPreviewVisible={isPreviewVisible}
        onPreviewVisibilityChange={setIsPreviewVisible}
        selectedContact={selectedContact}
        onContactChange={setSelectedContact}
        snippets={snippets}
        isLoadingSnippets={isLoadingSnippets}
        snippetsError={snippetsError}
      />
    </main>
  );
}
