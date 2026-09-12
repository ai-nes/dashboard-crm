"use client";

import { Plus } from "@tailgrids/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { getCurrentUser, type CurrentUser } from "@/services/api/auth";
import {
  createMessageTemplateLibrary,
  deleteMessageTemplateLibrary,
  listAdminMessageTemplateLibrary,
  updateMessageTemplateLibrary,
  type MessageTemplateRecord,
} from "@/services/api/message-templates";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";

import MessageTemplateCreateDialog from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-create-dialog";
import { normalizeMessageTemplateBody } from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-body";
import type { MessageTemplateDraft } from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-create-types";
import MessageTemplateList from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-list";

const emptyDraft: MessageTemplateDraft = {
  name: "",
  subject: "",
  body: "",
  sharing: "public",
  customValues: {},
};
const PAGE_SIZE = 8;

function getDraft(
  template: MessageTemplateRecord | null,
): MessageTemplateDraft {
  if (!template) return emptyDraft;

  return {
    name: template.name,
    subject: template.subject,
    body: normalizeMessageTemplateBody(template.body),
    sharing: "public",
    customValues: template.customValues ?? {},
  };
}

export default function AdminMessageTemplatePage() {
  const [templates, setTemplates] = useState<MessageTemplateRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [owners, setOwners] = useState<Array<{ id: string; name: string }>>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] =
    useState<MessageTemplateRecord | null>(null);
  const [templateToDelete, setTemplateToDelete] =
    useState<MessageTemplateRecord | null>(null);
  const [draft, setDraft] = useState<MessageTemplateDraft>(emptyDraft);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [selectedContact, setSelectedContact] = useState("");
  const [page, setPage] = useState(1);
  const [serverSearch, setServerSearch] = useState("");
  const [serverOwner, setServerOwner] = useState("all");

  const loadTemplates = useCallback(
    async (
      nextPage = page,
      nextSearch = serverSearch,
      nextOwner = serverOwner,
    ) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [response, user] = await Promise.all([
          listAdminMessageTemplateLibrary({
            start: (nextPage - 1) * PAGE_SIZE,
            pageLength: PAGE_SIZE,
            search: nextSearch,
            owner: nextOwner === "all" ? undefined : nextOwner,
          }),
          getCurrentUser(),
        ]);
        setTemplates(response.templates);
        setTotal(response.total);
        setOwners(response.owners);
        setCurrentUser(user);
        const responseTotalPages = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
        if (nextPage > responseTotalPages) setPage(responseTotalPages);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Không thể tải thư viện mẫu.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page, serverOwner, serverSearch],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTemplates();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTemplates]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const handleServerFiltersChange = useCallback(
    (filters: { search: string; owner: string }) => {
      setServerSearch(filters.search);
      setServerOwner(filters.owner);
      setPage(1);
    },
    [],
  );
  const handleServerPageChange = useCallback(
    (nextPage: number) => setPage(nextPage),
    [],
  );
  const serverPagination = useMemo(
    () => ({
      total,
      owners,
      currentPage: page,
      totalPages,
      isDisabled: isLoading,
      onPageChange: handleServerPageChange,
      onFiltersChange: handleServerFiltersChange,
    }),
    [
      handleServerFiltersChange,
      handleServerPageChange,
      isLoading,
      owners,
      page,
      total,
      totalPages,
    ],
  );

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

  const updateDraft = <K extends keyof MessageTemplateDraft>(
    field: K,
    value: MessageTemplateDraft[K],
  ) => {
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể lưu mẫu dùng chung.",
      );
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
        customValues: template.customValues ?? {},
      });
      toast.success("Đã nhân bản mẫu dùng chung.");
      await loadTemplates();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể nhân bản mẫu dùng chung.",
      );
    }
  };

  const deleteTemplate = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMessageTemplateLibrary(
        templateToDelete.id,
        templateToDelete.modifiedAt,
      );
      setTemplateToDelete(null);
      toast.success("Đã xóa mẫu dùng chung.");
      await loadTemplates();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể xóa mẫu dùng chung.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main
      id="main-content"
      className="flex min-h-0 min-w-0 flex-col gap-5 px-2 py-4 pb-8 lg:px-6"
    >
      <AdminPageHeader
        section="Message Template"
        title="Quản lý Message Template"
        description="Thư viện mẫu email dùng chung."
        actions={
          <Button size="md" className="shrink-0" onPress={openCreateDialog}>
            <Plus size={16} aria-hidden="true" />
            Tạo mẫu
          </Button>
        }
        metaLabel="Nội dung dùng chung"
        metaValue={
          <>
            <span className="font-semibold text-text-primary">{total}</span> mẫu
          </>
        }
      />

      {loadError ? (
        <Card className="border-button-error-outline-stroke p-6 text-sm text-button-error-outline-text">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-3 underline"
            onClick={() => void loadTemplates()}
          >
            Thử lại
          </button>
        </Card>
      ) : (
        <MessageTemplateList
          templates={templates}
          isLoading={isLoading}
          onDuplicate={duplicateTemplate}
          onDelete={setTemplateToDelete}
          onEdit={openEditDialog}
          serverPagination={serverPagination}
        />
      )}

      <DeleteRecordDialog
        isOpen={Boolean(templateToDelete)}
        recordType="mẫu dùng chung"
        recordName={templateToDelete?.name ?? ""}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) setTemplateToDelete(null);
        }}
        onConfirm={deleteTemplate}
      />

      <MessageTemplateCreateDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogChange}
        draft={draft}
        ownerName={
          templateToEdit?.owner ?? currentUser?.full_name ?? "Administrator"
        }
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
