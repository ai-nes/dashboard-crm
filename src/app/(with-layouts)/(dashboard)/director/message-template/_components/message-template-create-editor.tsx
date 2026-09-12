"use client";

import { ChevronDown, Eye } from "@tailgrids/icons";
import { useMemo, useRef, useState } from "react";

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
import type {
  MessageTemplateSharing,
  MessageTemplateTokenDefinition,
} from "@/services/api/message-templates";

import type { MessageTemplateDraft } from "./message-template-create-types";
import MessageTemplateTokenPopover from "./message-template-token-popover";
import MessageTemplateToken from "./message-template-token-node";
import MessageTemplateSubjectEditor from "./message-template-subject-editor";
import MessageTemplateSnippetSuggestion, {
  filterSnippetSuggestions,
  type SnippetSuggestionPosition,
} from "./message-template-snippet-suggestion";

interface MessageTemplateCreateEditorProps {
  draft: MessageTemplateDraft;
  ownerName: string;
  onChange: <K extends keyof MessageTemplateDraft>(
    field: K,
    value: MessageTemplateDraft[K],
  ) => void;
  tokens: MessageTemplateTokenDefinition[];
  isLoadingTokens?: boolean;
  tokensError?: string | null;
  sharingLocked?: boolean;
  lockedSharing?: MessageTemplateSharing;
  showPreviewToggle?: boolean;
  onShowPreview?: () => void;
  snippets?: SnippetRecord[];
  isLoadingSnippets?: boolean;
  snippetsError?: string | null;
}

const SNIPPET_REFERENCE_PATTERN =
  /#\(\s*([^()\r\n]+?)\s*\)|#([A-Za-z0-9][A-Za-z0-9_.-]*)/g;
const SNIPPET_TRIGGER_PATTERN = /(?:^|\s)#([A-Za-z0-9_.-]*)$/;

interface ActiveSnippetSuggestion extends SnippetSuggestionPosition {
  from: number;
  to: number;
  query: string;
}

function getActiveSnippetSuggestion(editor: RichTextEditorInstance) {
  const { from, to, empty } = editor.state.selection;
  if (!empty || from !== to) return null;

  const resolvedPosition = editor.state.doc.resolve(from);
  const parent = resolvedPosition.parent;
  if (!parent.isTextblock) return null;

  const textBeforeCursor = parent.textBetween(
    0,
    resolvedPosition.parentOffset,
    "\n",
    "\ufffc",
  );
  const match = textBeforeCursor.match(SNIPPET_TRIGGER_PATTERN);
  if (!match || match.index === undefined) return null;

  const hashIndex = match.index + (match[0].startsWith(" ") ? 1 : 0);
  return {
    from: from - (textBeforeCursor.length - hashIndex),
    to,
    query: match[1] ?? "",
  };
}

function expandSnippetReferences(
  editor: RichTextEditorInstance,
  snippets: SnippetRecord[],
  isExpanding: { current: boolean },
) {
  if (!snippets.length || isExpanding.current) return;

  const snippetsByReference = new Map<string, SnippetRecord>();
  snippets.forEach((snippet) => {
    [snippet.shortcut].forEach((reference) => {
      const normalized = String(reference ?? "")
        .trim()
        .toLocaleLowerCase();
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
        content: snippet.snippetText ?? "",
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
  tokens,
  isLoadingTokens = false,
  tokensError = null,
  sharingLocked = false,
  lockedSharing = "public",
  showPreviewToggle = false,
  onShowPreview,
  snippets = [],
  isLoadingSnippets = false,
  snippetsError = null,
}: MessageTemplateCreateEditorProps) {
  const isExpandingSnippet = useRef(false);
  const editorRef = useRef<RichTextEditorInstance | null>(null);
  const [activeSnippetSuggestion, setActiveSnippetSuggestion] =
    useState<ActiveSnippetSuggestion | null>(null);
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const hasSnippets = snippets.length > 0;
  const filteredSnippetSuggestions = useMemo(
    () =>
      filterSnippetSuggestions(snippets, activeSnippetSuggestion?.query ?? ""),
    [activeSnippetSuggestion?.query, snippets],
  );
  const updateSnippetSuggestion = (editor: RichTextEditorInstance) => {
    editorRef.current = editor;
    const range = getActiveSnippetSuggestion(editor);
    if (!range) {
      setActiveSnippetSuggestion(null);
      setSelectedSnippetIndex(0);
      return;
    }

    const coords = editor.view.coordsAtPos(range.to);
    setActiveSnippetSuggestion({
      ...range,
      top: coords.bottom + 4,
      left: coords.left,
    });
    setSelectedSnippetIndex(0);
  };

  const insertSuggestedSnippet = (
    snippet: SnippetRecord,
    editor = editorRef.current,
  ) => {
    if (!editor || !activeSnippetSuggestion) return;

    editor
      .chain()
      .focus()
      .insertContentAt(
        {
          from: activeSnippetSuggestion.from,
          to: activeSnippetSuggestion.to,
        },
        snippet.snippetText ?? "",
      )
      .run();
    setActiveSnippetSuggestion(null);
    setSelectedSnippetIndex(0);
  };

  const handleSnippetSuggestionKeyDown = (
    editor: RichTextEditorInstance,
    event: KeyboardEvent,
  ) => {
    if (!activeSnippetSuggestion) return false;

    if (event.key === "Escape") {
      event.preventDefault();
      setActiveSnippetSuggestion(null);
      return true;
    }

    if (filteredSnippetSuggestions.length === 0) return false;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedSnippetIndex((index) =>
        Math.min(index + 1, filteredSnippetSuggestions.length - 1),
      );
      return true;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedSnippetIndex((index) => Math.max(index - 1, 0));
      return true;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const selectedSnippet = filteredSnippetSuggestions[selectedSnippetIndex];
      if (selectedSnippet) insertSuggestedSnippet(selectedSnippet, editor);
      return true;
    }

    return false;
  };

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          Soạn mẫu email
        </h2>
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
              {lockedSharing === "private"
                ? "Chỉ mình tôi"
                : "Chia sẻ với mọi người"}
            </div>
          ) : (
            <Select
              aria-label="Quyền chia sẻ"
              className="min-w-0 gap-0"
              value={draft.sharing}
              onChange={(value) =>
                onChange(
                  "sharing",
                  String(value ?? "public") as MessageTemplateDraft["sharing"],
                )
              }
            >
              <SelectTrigger className="h-11 min-w-0 rounded-none border-0 bg-transparent px-4 text-sm font-semibold shadow-none focus:ring-0">
                <SelectValue>
                  {draft.sharing === "private"
                    ? "Chỉ mình tôi"
                    : "Chia sẻ với mọi người"}
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
            <span className="ml-1.5 truncate text-text-secondary">
              {ownerName}
            </span>
          </div>
        </div>

        <label className="flex min-h-12 shrink-0 items-center gap-3 border-b border-button-primary-outline-stroke px-4">
          <span className="shrink-0 text-sm font-semibold text-text-primary">
            Tên mẫu:
          </span>
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
            <span className="shrink-0 text-sm font-semibold text-text-primary">
              Tiêu đề:
            </span>
            <MessageTemplateSubjectEditor
              value={draft.subject}
              onChange={(value) => onChange("subject", value)}
              tokens={tokens}
              isLoadingTokens={isLoadingTokens}
              tokensError={tokensError}
            />
          </div>
        </div>

        <RichTextEditor
          value={draft.body}
          onChange={(value) => onChange("body", value)}
          scrollable
          placeholder="Nhập nội dung mẫu email..."
          toolbarPlacement="top"
          toolbarEndContent={
            <Button appearance="ghost" size="xs" onPress={() => undefined}>
              Tạo bằng AI
            </Button>
          }
          renderInsertControl={(onInsertToken, onInsertContent) => (
            <MessageTemplateTokenPopover
              tokens={tokens}
              isLoadingTokens={isLoadingTokens}
              tokensError={tokensError}
              onInsertToken={onInsertToken}
              snippets={snippets}
              isLoadingSnippets={isLoadingSnippets}
              snippetsError={snippetsError}
              onInsertSnippet={(snippet) =>
                onInsertContent(snippet.snippetText)
              }
            />
          )}
          extensions={[
            MessageTemplateToken as unknown as RichTextEditorExtension,
          ]}
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
            updateSnippetSuggestion(editor);
          }}
          onEditorSelectionUpdate={updateSnippetSuggestion}
          onEditorKeyDown={handleSnippetSuggestionKeyDown}
          onEditorBlur={() => setActiveSnippetSuggestion(null)}
          className="min-w-0 flex min-h-0 flex-1 flex-col rounded-none border-0 bg-transparent [&_.ProseMirror]:min-h-[14rem] [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-8 [&_.ProseMirror_p]:my-0 [&_.ProseMirror_p:not(:last-child)]:mb-8 sm:[&_.ProseMirror]:min-h-[17rem]"
        />
      </div>

      {activeSnippetSuggestion ? (
        <MessageTemplateSnippetSuggestion
          snippets={filteredSnippetSuggestions}
          query={activeSnippetSuggestion.query}
          position={activeSnippetSuggestion}
          selectedIndex={selectedSnippetIndex}
          isLoading={isLoadingSnippets}
          error={snippetsError}
          onActiveChange={setSelectedSnippetIndex}
          onSelect={insertSuggestedSnippet}
        />
      ) : null}
    </section>
  );
}
