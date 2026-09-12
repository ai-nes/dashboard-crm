"use client";

import { ChevronDown, Close } from "@tailgrids/icons";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { useEffect, useState } from "react";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import { cn } from "@/utils/cn";

import type {
  SnippetDraft,
  SnippetRecord,
  SnippetSharing,
} from "@/services/api/snippets";
import {
  listMessageTemplateTokens,
  type MessageTemplateTokenDefinition,
} from "@/services/api/message-templates";

import MessageTemplateTokenPopover from "../../message-template/_components/message-template-token-popover";

interface SnippetCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SnippetDraft;
  ownerName: string;
  onDraftChange: (field: keyof SnippetDraft, value: string) => void;
  snippet?: SnippetRecord | null;
  sharingLocked?: boolean;
  lockedSharing?: SnippetSharing;
  onSave?: (draft: SnippetDraft) => Promise<void> | void;
  isSaving?: boolean;
}

function isContentValid(snippetText: string | null | undefined) {
  return (snippetText ?? "").replace(/<[^>]*>/g, "").trim().length > 0;
}

export default function SnippetCreateDialog({
  isOpen,
  onOpenChange,
  draft,
  ownerName,
  onDraftChange,
  snippet = null,
  sharingLocked = false,
  lockedSharing = "public",
  onSave,
  isSaving = false,
}: SnippetCreateDialogProps) {
  const isEditMode = Boolean(snippet);
  const [tokens, setTokens] = useState<MessageTemplateTokenDefinition[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(null);
  const internalName = draft.internalName ?? "";
  const snippetText = draft.snippetText ?? "";
  const shortcut = draft.shortcut ?? "";
  const canSave = Boolean(
    internalName.trim() && shortcut.trim() && isContentValid(snippetText),
  );

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsLoadingTokens(true);
      setTokensError(null);
      void listMessageTemplateTokens()
        .then((response) => {
          if (!cancelled) setTokens(response.tokens);
        })
        .catch((error) => {
          if (!cancelled) {
            setTokensError(
              error instanceof Error
                ? error.message
                : "Không thể tải danh sách token.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingTokens(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  return (
    <Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-[min(96vw,44rem)] -translate-x-1/2 -translate-y-1/2">
        <AriaDialog
          aria-label={isEditMode ? "Chỉnh sửa snippet" : "Tạo snippet mới"}
          className="flex max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-card-border px-5 py-5 pr-3 sm:px-7">
            <DialogTitle className="text-xl leading-7 sm:text-2xl">
              {isEditMode ? "Chỉnh sửa snippet" : "Tạo snippet mới"}
            </DialogTitle>
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
          </DialogHeader>

          <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <label
                  htmlFor="snippet-internal-name"
                  className="mb-2 block text-sm font-semibold text-text-primary"
                >
                  Internal name
                </label>
                <Input
                  id="snippet-internal-name"
                  aria-label="Internal name"
                  placeholder="Nhập internal name"
                  value={internalName}
                  onChange={(event) =>
                    onDraftChange("internalName", event.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="min-w-48">
                <span className="mb-2 block text-sm font-semibold text-text-primary">
                  Chia sẻ
                </span>
                {sharingLocked ? (
                  <div className="flex h-11 items-center rounded-lg border border-card-border bg-background-gray-secondary px-3 text-sm text-text-secondary">
                    {lockedSharing === "private" ? "Riêng tư" : "Công khai"}
                  </div>
                ) : (
                  <Select
                    aria-label="Quyền chia sẻ"
                    value={draft.sharing}
                    onChange={(value) =>
                      onDraftChange("sharing", String(value ?? "public"))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {draft.sharing === "private" ? "Riêng tư" : "Công khai"}
                      </SelectValue>
                      <SelectIndicator>
                        <ChevronDown size={14} />
                      </SelectIndicator>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="public" textValue="Công khai">
                        Công khai
                      </SelectItem>
                      <SelectItem id="private" textValue="Riêng tư">
                        Riêng tư
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="snippet-text"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Snippet text
              </label>
              <RichTextEditor
                value={snippetText}
                onChange={(value) => onDraftChange("snippetText", value)}
                placeholder="Nhập nội dung snippet..."
                renderInsertControl={(onInsertToken) => (
                  <MessageTemplateTokenPopover
                    tokens={tokens}
                    isLoadingTokens={isLoadingTokens}
                    tokensError={tokensError}
                    onInsertToken={onInsertToken}
                  />
                )}
                className={cn(
                  "min-h-56 border-card-border bg-input-background [&_.ProseMirror]:min-h-48",
                )}
              />
              <p className="mt-2 text-xs text-text-tertiary">
                Chủ sở hữu:{" "}
                <span className="font-medium text-text-secondary">
                  {ownerName}
                </span>
              </p>
            </div>

            <div>
              <label
                htmlFor="snippet-shortcut"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Shortcut
              </label>
              <div className="flex h-11 items-center rounded-lg border border-card-border bg-input-background px-3 focus-within:border-input-primary-focus-border focus-within:ring-4 focus-within:ring-input-primary-focus-border/20">
                <span className="text-lg font-semibold text-text-secondary">
                  #
                </span>
                <Input
                  id="snippet-shortcut"
                  aria-label="Shortcut"
                  placeholder="xinchao"
                  value={shortcut}
                  onChange={(event) =>
                    onDraftChange(
                      "shortcut",
                      event.target.value.replace(/^#+/, ""),
                    )
                  }
                  className="h-9 flex-1 rounded-none border-0 bg-transparent px-2 py-1 text-sm shadow-none focus:ring-0"
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-text-tertiary">
                Khi dùng snippet, nhập dấu # theo sau là shortcut này trong
                trình soạn thảo.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-card-border px-5 py-4 sm:justify-end sm:px-7">
            <Button appearance="outline" onPress={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              isDisabled={!canSave || isSaving}
              isPending={isSaving}
              className="sm:min-w-36"
              onPress={async () => {
                try {
                  await onSave?.(draft);
                  onOpenChange(false);
                } catch {
                  // The page-level mutation handler already surfaces the error.
                }
              }}
            >
              {isEditMode ? "Lưu thay đổi" : "Tạo snippet"}
            </Button>
          </DialogFooter>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
