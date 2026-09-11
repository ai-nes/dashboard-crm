"use client";

import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import type { RichTextEditorExtension } from "@/components/tailgrids/core/rich-text-editor";

import MessageTemplateTokenPopover from "./message-template-token-popover";
import MessageTemplateToken from "./message-template-token-node";

interface MessageTemplateSubjectEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function createSubjectContent(value: string): JSONContent {
  const content: JSONContent[] = [];

  for (const part of value.split(/(\{\{[^}]+\}\})/g)) {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      content.push({
        type: MessageTemplateToken.name,
        attrs: { token: part.slice(2, -2) },
      });
      continue;
    }

    if (part) content.push({ type: "text", text: part });
  }

  return {
    type: "doc",
    content: [{ type: "paragraph", content }],
  };
}

function serializeSubject(editor: ReturnType<typeof useEditor>) {
  if (!editor) return "";

  let value = "";
  editor.state.doc.descendants((node) => {
    if (node.type.name === MessageTemplateToken.name) {
      value += `{{${String(node.attrs.token ?? "")}}}`;
      return false;
    }

    if (node.isText) value += node.text ?? "";
    return undefined;
  });

  return value;
}

export default function MessageTemplateSubjectEditor({
  value,
  onChange,
}: MessageTemplateSubjectEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Nhập tiêu đề" }),
      MessageTemplateToken as unknown as RichTextEditorExtension,
    ],
    content: createSubjectContent(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Tiêu đề",
        class:
          "min-h-9 px-0 py-1 text-sm leading-6 text-text-primary outline-none [&_p]:my-0",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => onChange(serializeSubject(updatedEditor)),
  });

  if (!editor) return null;

  return (
    <>
      <div className="min-w-0 flex-1">
        <EditorContent editor={editor} />
      </div>
      <MessageTemplateTokenPopover
        onInsertToken={(token) => {
          editor
            .chain()
            .focus()
            .insertContent({
              type: MessageTemplateToken.name,
              attrs: { token },
            })
            .run();
        }}
        placement="bottom end"
      />
    </>
  );
}
