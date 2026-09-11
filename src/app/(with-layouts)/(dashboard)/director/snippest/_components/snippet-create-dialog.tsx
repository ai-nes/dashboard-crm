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
import { cn } from "@/utils/cn";

import type { SnippetDraft, SnippetRecord } from "@/services/api/snippets";

interface SnippetCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SnippetDraft;
  ownerName: string;
  onDraftChange: (field: keyof SnippetDraft, value: string) => void;
  snippet?: SnippetRecord | null;
  onSave?: (draft: SnippetDraft) => Promise<void> | void;
  isSaving?: boolean;
}

function isContentValid(content: string) {
  return content.replace(/<[^>]*>/g, "").trim().length > 0;
}

export default function SnippetCreateDialog({
  isOpen,
  onOpenChange,
  draft,
  ownerName,
  onDraftChange,
  snippet = null,
  onSave,
  isSaving = false,
}: SnippetCreateDialogProps) {
  const isEditMode = Boolean(snippet);
  const canSave = Boolean(draft.name.trim() && isContentValid(draft.content));

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
                  htmlFor="snippet-name"
                  className="mb-2 block text-sm font-semibold text-text-primary"
                >
                  Tên snippet
                </label>
                <Input
                  id="snippet-name"
                  aria-label="Tên snippet"
                  placeholder="Nhập tên snippet"
                  value={draft.name}
                  onChange={(event) =>
                    onDraftChange("name", event.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="min-w-48">
                <span className="mb-2 block text-sm font-semibold text-text-primary">
                  Chia sẻ
                </span>
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
              </div>
            </div>

            <div>
              <label
                htmlFor="snippet-content"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Nội dung
              </label>
              <textarea
                id="snippet-content"
                aria-label="Nội dung snippet"
                placeholder="Nhập đoạn nội dung dùng nhanh..."
                value={draft.content}
                onChange={(event) =>
                  onDraftChange("content", event.target.value)
                }
                className={cn(
                  "min-h-56 w-full resize-y rounded-lg border border-card-border bg-input-background px-4 py-3 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20",
                )}
              />
              <p className="mt-2 text-xs text-text-tertiary">
                Chủ sở hữu:{" "}
                <span className="font-medium text-text-secondary">
                  {ownerName}
                </span>
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
