"use client";

import { ChevronDown, Eye } from "@tailgrids/icons";
import { useRef } from "react";

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
  type RichTextEditorInstance,
} from "@/components/tailgrids/core/rich-text-editor";
import type { SnippetRecord } from "@/services/api/snippets";

import type { MessageTemplateDraft } from "./message-template-create-types";
import MessageTemplateTokenPopover from "./message-template-token-popover";
import MessageTemplateToken from "./message-template-token-node";
import MessageTemplateSubjectEditor from "./message-template-subject-editor";

interface MessageTemplateCreateEditorProps {
  draft: MessageTemplateDraft;
  ownerName: string;
  onChange: (field: keyof MessageTemplateDraft, value: string) => void;
  sharingLocked?: boolean;
  showPreviewToggle?: boolean;
  onShowPreview?: () => void;
  snippets?: SnippetRecord[];
  isLoadingSnippets?: boolean;
  snippetsError?: string | null;
}

const SNIPPET_REFERENCE_PATTERN = /#\(\s*([^()\r\n]+?)\s*\)|#([A-Za-z0-9][A-Za-z0-9_.-]*)/g;

function expandSnippetReferences(
  editor: RichTextEditorInstance,
  snippets: SnippetRecord[],
  isExpanding: { current: boolean },
) {
  if (!snippets.length || isExpanding.current) return;

  const snippetsByReference = new Map<string, SnippetRecord>();
  snippets.forEach((snippet) => {
    [snippet.name, snippet.code].forEach((reference) => {
      const normalized = reference.trim().toLocaleLowerCase();
      if (normalized) snippetsByReference.set(normalized, snippet);
    });
  });

  const replacements: Array<{ from: number; to: number; content: string }> = [];
  editor.state.doc.descendants((node, position) => {
    if (!node.isText || !node.text) return;

    for (const match of node.text.matchAll(SNIPPET_REFERENCE_PATTERN)) {
      const reference = (match[1] ?? match[2] ?? "").trim().toLocaleLowerCase();
      const snippet = snippetsByReference.get(reference);
      if (!snippet) continue;

      replacements.push({
        from: position + match.index,
        to: position + match.index + match[0].length,
        content: snippet.content,
      });
    }
  });

  if (!replacements.length) return;

  isExpanding.current = true;
  try {
    const chain = editor.chain().focus();
    replacements
      .sort((left, right) => right.from - left.from)
      .forEach(({ from, to, content }) => {
        chain.insertContentAt({ from, to }, content);
      });
    chain.run();
  } finally {
    isExpanding.current = false;
  }
}

export default function MessageTemplateCreateEditor({
  draft,
  ownerName,
  onChange,
  sharingLocked = false,
  showPreviewToggle = false,
  onShowPreview,
  snippets = [],
  isLoadingSnippets = false,
  snippetsError = null,
}: MessageTemplateCreateEditorProps) {
  const isExpandingSnippet = useRef(false);
  const hasSnippets = snippets.length > 0;

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
          {sharingLocked ? (
            <div className="flex h-11 items-center px-4 text-sm font-semibold text-text-primary">
              Chia sẻ với mọi người
            </div>
          ) : (
            <Select
              aria-label="Quyền chia sẻ"
              className="min-w-0 gap-0"
              value={draft.sharing}
              onChange={(value) => onChange("sharing", String(value ?? "public"))}
            >
              <SelectTrigger className="h-11 min-w-0 rounded-none border-0 bg-transparent px-4 text-sm font-semibold shadow-none focus:ring-0">
                <SelectValue>
                  {draft.sharing === "private" ? "Chỉ mình tôi" : "Chia sẻ với mọi người"}
                </SelectValue>
                <SelectIndicator>
                  <ChevronDown size={14} />
                </SelectIndicator>
              </SelectTrigger>
              <SelectContent>
                <SelectItem id="public" textValue="Chia sẻ với mọi người">
                  Chia sẻ với mọi người
                </SelectItem>
                <SelectItem id="private" textValue="Chỉ mình tôi">
                  Chỉ mình tôi
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="flex h-11 items-center border-t border-button-primary-outline-stroke px-4 text-sm sm:border-t-0 sm:border-l">
            <span className="font-semibold text-text-primary">Chủ sở hữu:</span>
            <span className="ml-1.5 truncate text-text-secondary">{ownerName}</span>
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
          toolbarPlacement="bottom"
          toolbarEndContent={
            <Button appearance="ghost" size="xs" onPress={() => undefined}>
              Tạo bằng AI
            </Button>
          }
          renderInsertControl={(onInsertToken, onInsertContent) => (
            <MessageTemplateTokenPopover
              onInsertToken={onInsertToken}
              snippets={snippets}
              isLoadingSnippets={isLoadingSnippets}
              snippetsError={snippetsError}
              onInsertSnippet={(snippet) => onInsertContent(snippet.content)}
            />
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
          onEditorUpdate={(editor) => {
            if (hasSnippets) {
              expandSnippetReferences(editor, snippets, isExpandingSnippet);
            }
          }}
          className="flex min-h-0 flex-1 flex-col rounded-none border-0 bg-transparent [&_.ProseMirror]:min-h-[14rem] [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-8 [&_.ProseMirror_p]:my-0 [&_.ProseMirror_p:not(:last-child)]:mb-8 sm:[&_.ProseMirror]:min-h-[17rem]"
        />
      </div>
    </section>
  );
}
