"use client";

import { Close } from "@tailgrids/icons";
import { Dialog as AriaDialog, Modal as AriaModal } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { cn } from "@/utils/cn";
import type { SnippetRecord } from "@/services/api/snippets";

import { normalizeMessageTemplateBody } from "./message-template-body";
import MessageTemplateCreateEditor from "./message-template-create-editor";
import MessageTemplateCreatePreview from "./message-template-create-preview";
import type { MessageTemplateRecord } from "./message-template-data";
import type { MessageTemplateDraft } from "./message-template-create-types";

interface MessageTemplateCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  draft: MessageTemplateDraft;
  ownerName: string;
  onDraftChange: (field: keyof MessageTemplateDraft, value: string) => void;
  template?: MessageTemplateRecord | null;
  sharingLocked?: boolean;
  onSave?: (draft: MessageTemplateDraft) => Promise<void> | void;
  isSaving?: boolean;
  isPreviewVisible: boolean;
  onPreviewVisibilityChange: (isVisible: boolean) => void;
  selectedContact: string;
  onContactChange: (contact: string) => void;
  snippets?: SnippetRecord[];
  isLoadingSnippets?: boolean;
  snippetsError?: string | null;
}

function isBodyValid(body: string) {
  return body.replace(/<[^>]*>/g, "").trim().length > 0;
}

export default function MessageTemplateCreateDialog({
  isOpen,
  onOpenChange,
  draft,
  ownerName,
  onDraftChange,
  template = null,
  sharingLocked = false,
  onSave,
  isSaving = false,
  isPreviewVisible,
  onPreviewVisibilityChange,
  selectedContact,
  onContactChange,
  snippets = [],
  isLoadingSnippets = false,
  snippetsError = null,
}: MessageTemplateCreateDialogProps) {
  const isEditMode = Boolean(template);

  const canSave = Boolean(
    draft.name.trim() && draft.subject.trim() && isBodyValid(draft.body),
  );
  const editorDraft = { ...draft, body: normalizeMessageTemplateBody(draft.body) };

  return (
    <Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AriaModal
        className={cn(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out max-sm:w-[calc(100%-1rem)]",
          isPreviewVisible
            ? "w-[96vw] max-w-[120rem]"
            : "w-[48vw] max-w-[48rem]",
        )}
      >
        <AriaDialog
          aria-label={isEditMode ? "Chỉnh sửa mẫu" : "Tạo mẫu mới"}
          className="flex h-[min(84vh,56rem)] max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-card-border px-5 py-5 pr-3 sm:px-7">
            <DialogTitle className="text-xl leading-7 sm:text-2xl">
              {isEditMode ? "Chỉnh sửa mẫu" : "Tạo mẫu mới"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                iconOnly
                size="sm"
                appearance="ghost"
                aria-label="Đóng"
                onPress={() => onOpenChange(false)}
                className="shrink-0 text-text-secondary hover:bg-transparent hover:text-text-primary"
              >
                <Close size={20} aria-hidden="true" />
              </Button>
            </div>
          </DialogHeader>

          <div
            className={cn(
              "grid min-h-0 flex-1",
              isPreviewVisible
                ? "grid-rows-[minmax(28rem,1fr)_minmax(28rem,1fr)] lg:grid-cols-2 lg:grid-rows-1 lg:gap-0"
                : "grid-rows-1 lg:grid-cols-1",
            )}
          >
            <div
              className={cn(
                "flex min-h-0 flex-col overflow-hidden border-b border-card-border px-5 py-5 sm:px-7 sm:py-6 lg:border-b-0",
                isPreviewVisible && "lg:pr-2",
                !isPreviewVisible && "lg:mx-auto lg:w-full lg:max-w-full lg:px-7",
              )}
            >
              <MessageTemplateCreateEditor
                draft={editorDraft}
                ownerName={ownerName}
                onChange={onDraftChange}
                sharingLocked={sharingLocked}
                snippets={snippets}
                isLoadingSnippets={isLoadingSnippets}
                snippetsError={snippetsError}
                showPreviewToggle={!isPreviewVisible}
                onShowPreview={() => onPreviewVisibilityChange(true)}
              />
            </div>
            {isPreviewVisible && (
              <div className="flex min-h-0 flex-col overflow-hidden px-5 py-5 sm:px-7 sm:py-6 lg:pl-2">
                <MessageTemplateCreatePreview
                  isOpen={isOpen}
                  draft={draft}
                  isPreviewVisible={isPreviewVisible}
                  onPreviewVisibilityChange={onPreviewVisibilityChange}
                  selectedContact={selectedContact}
                  onContactChange={onContactChange}
                />
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-card-border px-5 py-4 sm:justify-end sm:px-7">
            <Button appearance="outline" onPress={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              isDisabled={!canSave || isSaving}
              isPending={isSaving}
              className="sm:min-w-44"
              onPress={async () => {
                try {
                  await onSave?.(draft);
                  onOpenChange(false);
                } catch {
                  // The page-level mutation handler already surfaces the error.
                }
              }}
            >
              {isEditMode ? "Lưu thay đổi" : "Tạo mẫu"}
            </Button>
          </DialogFooter>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
