"use client";

import { Plus } from "@tailgrids/icons";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getCurrentUser, type CurrentUser } from "@/services/api/auth";
import {
  createMessageTemplateLibrary,
  deleteMessageTemplateLibrary,
  listAdminMessageTemplateLibrary,
  updateMessageTemplateLibrary,
  type MessageTemplateRecord,
} from "@/services/api/message-templates";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardTitle } from "@/components/tailgrids/core/card";

import MessageTemplateCreateDialog from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-create-dialog";
import { normalizeMessageTemplateBody } from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-body";
import type { MessageTemplateDraft } from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-create-types";
import MessageTemplateList from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-list";

const emptyDraft: MessageTemplateDraft = {
  name: "",
  subject: "",
  body: "",
  sharing: "public",
};

function getDraft(template: MessageTemplateRecord | null): MessageTemplateDraft {
  if (!template) return emptyDraft;

  return {
    name: template.name,
    subject: template.subject,
    body: normalizeMessageTemplateBody(template.body),
    sharing: "public",
  };
}

export default function AdminMessageTemplatePage() {
  const [templates, setTemplates] = useState<MessageTemplateRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<MessageTemplateRecord | null>(null);
  const [draft, setDraft] = useState<MessageTemplateDraft>(emptyDraft);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [selectedContact, setSelectedContact] = useState("");

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [response, user] = await Promise.all([
        listAdminMessageTemplateLibrary(),
        getCurrentUser(),
      ]);
      setTemplates(response.templates);
      setCurrentUser(user);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không thể tải thư viện mẫu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTemplates();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTemplates]);

  const openCreateDialog = () => {
    setTemplateToEdit(null);
    setDraft(emptyDraft);
    setIsPreviewVisible(true);
    setSelectedContact("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: MessageTemplateRecord) => {
    setTemplateToEdit(template);
    setDraft(getDraft(template));
    setIsPreviewVisible(true);
    setSelectedContact("");
    setIsDialogOpen(true);
  };

  const updateDraft = (field: keyof MessageTemplateDraft, value: string) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
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
        await updateMessageTemplateLibrary(
          templateToEdit.id,
          normalizedDraft,
          templateToEdit.modifiedAt,
        );
        toast.success("Đã lưu thay đổi mẫu dùng chung.");
      } else {
        await createMessageTemplateLibrary(normalizedDraft);
        toast.success("Đã tạo mẫu dùng chung.");
      }
      await loadTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu mẫu dùng chung.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const duplicateTemplate = async (template: MessageTemplateRecord) => {
    try {
      await createMessageTemplateLibrary({
        name: `${template.name} (Bản sao)`,
        subject: template.subject,
        body: template.body,
        sharing: "public",
      });
      toast.success("Đã nhân bản mẫu dùng chung.");
      await loadTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể nhân bản mẫu dùng chung.");
    }
  };

  const deleteTemplate = async (template: MessageTemplateRecord) => {
    if (!window.confirm(`Xóa mẫu dùng chung “${template.name}”?`)) return;
    try {
      await deleteMessageTemplateLibrary(template.id, template.modifiedAt);
      toast.success("Đã xóa mẫu dùng chung.");
      await loadTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa mẫu dùng chung.");
    }
  };

  return (
    <main id="main-content" className="flex min-h-0 min-w-0 flex-col gap-5 px-2 py-4 pb-8 lg:px-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge color="primary">QUẢN LÝ TEMPLATE</Badge>
            <span className="text-xs text-text-tertiary">Cấu hình nội dung</span>
          </div>
          <CardTitle level={1} className="mt-4 text-[28px] leading-8">
            Quản lý Message Template
          </CardTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Quản lý các mẫu email dùng chung hiển thị trong thư viện tạo mẫu.
          </p>
        </div>
        <Button size="md" className="shrink-0" onPress={openCreateDialog}>
          <Plus size={16} aria-hidden="true" />
          Tạo mẫu
        </Button>
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
          isLoading={isLoading}
          onDuplicate={duplicateTemplate}
          onDelete={deleteTemplate}
          onEdit={openEditDialog}
        />
      )}

      <MessageTemplateCreateDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogChange}
        draft={draft}
        ownerName={templateToEdit?.owner ?? currentUser?.full_name ?? "Administrator"}
        onDraftChange={updateDraft}
        template={templateToEdit}
        sharingLocked
        onSave={saveTemplate}
        isSaving={isSaving}
        isPreviewVisible={isPreviewVisible}
        onPreviewVisibilityChange={setIsPreviewVisible}
        selectedContact={selectedContact}
        onContactChange={setSelectedContact}
      />
    </main>
  );
}
