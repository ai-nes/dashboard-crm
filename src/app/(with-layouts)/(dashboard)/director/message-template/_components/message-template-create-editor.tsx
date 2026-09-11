"use client";

import { ChevronDown, Eye } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  RichTextEditor,
  type RichTextEditorExtension,
} from "@/components/tailgrids/core/rich-text-editor";

import type { MessageTemplateDraft } from "./message-template-create-types";
import MessageTemplateTokenPopover from "./message-template-token-popover";
import MessageTemplateToken from "./message-template-token-node";
import MessageTemplateSubjectEditor from "./message-template-subject-editor";

interface MessageTemplateCreateEditorProps {
  draft: MessageTemplateDraft;
  onChange: (field: keyof MessageTemplateDraft, value: string) => void;
  showPreviewToggle?: boolean;
  onShowPreview?: () => void;
}

export default function MessageTemplateCreateEditor({
  draft,
  onChange,
  showPreviewToggle = false,
  onShowPreview,
}: MessageTemplateCreateEditorProps) {
  const [sharingOption, setSharingOption] = useState("everyone");

  return (
    <section className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">Soạn mẫu email</h2>
        {showPreviewToggle && (
          <Button
            appearance="ghost"
            size="xs"
            onPress={onShowPreview}
            className="shrink-0 gap-1.5 px-1.5 text-sm font-semibold text-text-primary"
          >
            <Eye size={16} aria-hidden="true" />
            Hiện xem trước
          </Button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-button-primary-outline-stroke bg-background-white-primary">
        <div className="grid shrink-0 border-b border-button-primary-outline-stroke sm:grid-cols-[minmax(0,1fr)_auto]">
          <Select
            aria-label="Quyền chia sẻ"
            className="min-w-0 gap-0"
            value={sharingOption}
            onChange={(value) => setSharingOption(String(value ?? ""))}
          >
            <SelectTrigger className="h-11 min-w-0 rounded-none border-0 bg-transparent px-4 text-sm font-semibold shadow-none focus:ring-0">
              <SelectValue>
                {sharingOption === "private" ? "Chỉ mình tôi" : "Chia sẻ với mọi người"}
              </SelectValue>
              <SelectIndicator>
                <ChevronDown size={14} />
              </SelectIndicator>
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="everyone" textValue="Chia sẻ với mọi người">
                Chia sẻ với mọi người
              </SelectItem>
              <SelectItem id="private" textValue="Chỉ mình tôi">
                Chỉ mình tôi
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex h-11 items-center border-t border-button-primary-outline-stroke px-4 text-sm sm:border-t-0 sm:border-l">
            <span className="font-semibold text-text-primary">Chủ sở hữu:</span>
            <span className="ml-1.5 text-text-secondary">Thịnh Phú</span>
          </div>
        </div>

        <label className="flex min-h-12 shrink-0 items-center gap-3 border-b border-button-primary-outline-stroke px-4">
          <span className="shrink-0 text-sm font-semibold text-text-primary">Tên mẫu:</span>
          <Input
            aria-label="Tên mẫu"
            className="h-9 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-1 text-sm shadow-none focus:ring-0"
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Nhập tên mẫu"
            value={draft.name}
          />
        </label>

        <div className="flex min-h-12 shrink-0 items-center gap-3 border-b border-button-primary-outline-stroke px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="shrink-0 text-sm font-semibold text-text-primary">Tiêu đề:</span>
            <MessageTemplateSubjectEditor
              value={draft.subject}
              onChange={(value) => onChange("subject", value)}
            />
          </div>
        </div>

        <RichTextEditor
          value={draft.body}
          onChange={(value) => onChange("body", value)}
          placeholder="Nhập nội dung mẫu email..."
          renderInsertControl={(onInsertToken) => (
            <MessageTemplateTokenPopover onInsertToken={onInsertToken} />
          )}
          extensions={[MessageTemplateToken as unknown as RichTextEditorExtension]}
          onInsertToken={(editor, token) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: MessageTemplateToken.name,
                attrs: { token },
              })
              .run();
          }}
          className="min-h-0 flex-1 rounded-none border-0 bg-transparent [&>div:first-child]:border-button-primary-outline-stroke [&_.ProseMirror]:min-h-[14rem] [&_.ProseMirror]:text-sm sm:[&_.ProseMirror]:min-h-[17rem]"
        />

        <div className="flex shrink-0 justify-end px-4 py-3">
          <Button appearance="ghost" size="xs" onPress={() => undefined}>
            Tạo bằng AI
          </Button>
        </div>
      </div>
    </section>
  );
}
