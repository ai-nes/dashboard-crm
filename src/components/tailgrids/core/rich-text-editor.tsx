"use client";

import {
  ChevronDown,
  FileImage,
  Link1AngularRight,
  Paperclip2,
  SparkleFill,
} from "@tailgrids/icons";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type UseEditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import { cn } from "@/utils/cn";

import { Button } from "./button";

export type RichTextEditorExtension = NonNullable<
  UseEditorOptions["extensions"]
>[number];
type RichTextEditorInstance = NonNullable<ReturnType<typeof useEditor>>;
export type { RichTextEditorInstance };

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  showInsertButton?: boolean;
  onInsert?: () => void;
  renderInsertControl?: (
    onInsertToken: (token: string) => void,
    onInsertContent: (content: string) => void,
  ) => ReactNode;
  extensions?: RichTextEditorExtension[];
  onInsertToken?: (editor: RichTextEditorInstance, token: string) => void;
  onEditorUpdate?: (editor: RichTextEditorInstance) => void;
  onEditorSelectionUpdate?: (editor: RichTextEditorInstance) => void;
  onEditorKeyDown?: (
    editor: RichTextEditorInstance,
    event: KeyboardEvent,
  ) => boolean;
  onEditorBlur?: (editor: RichTextEditorInstance) => void;
  toolbarPlacement?: "top" | "bottom";
  toolbarEndContent?: ReactNode;
  scrollable?: boolean;
}

interface ToolbarButtonProps {
  active: boolean;
  onPress: () => void;
  label: string;
  children: ReactNode;
}

function ToolbarButton({
  active,
  onPress,
  label,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="xs"
      iconOnly
      aria-label={label}
      onPress={onPress}
      className={cn(
        "text-sm text-text-secondary",
        active && "bg-background-gray-secondary text-text-primary",
      )}
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  showInsertButton = false,
  onInsert,
  renderInsertControl,
  extensions = [],
  onInsertToken,
  onEditorUpdate,
  onEditorSelectionUpdate,
  onEditorKeyDown,
  onEditorBlur,
  toolbarPlacement = "top",
  toolbarEndContent,
  scrollable = false,
}: RichTextEditorProps) {
  const editorRef = useRef<RichTextEditorInstance | null>(null);
  const editorKeyDownRef = useRef(onEditorKeyDown);
  const editorSelectionUpdateRef = useRef(onEditorSelectionUpdate);
  const editorBlurRef = useRef(onEditorBlur);

  useEffect(() => {
    editorKeyDownRef.current = onEditorKeyDown;
    editorSelectionUpdateRef.current = onEditorSelectionUpdate;
    editorBlurRef.current = onEditorBlur;
  }, [onEditorBlur, onEditorKeyDown, onEditorSelectionUpdate]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung..." }),
      ...extensions,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-28 px-4 py-3 text-sm leading-6 text-text-primary outline-none [&_p]:my-1 [&_a]:text-primary-500 [&_a]:underline",
      },
      handleKeyDown: (_view, event) => {
        const currentEditor = editorRef.current;
        return currentEditor
          ? (editorKeyDownRef.current?.(currentEditor, event) ?? false)
          : false;
      },
    },
    onUpdate: ({ editor }) => {
      onEditorUpdate?.(editor);
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      editorSelectionUpdateRef.current?.(editor);
    },
    onBlur: ({ editor }) => {
      editorBlurRef.current?.(editor);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  if (!editor) return null;

  const handleLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "Nhập đường dẫn liên kết",
      previousUrl ?? "https://",
    );
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleUnsupported = () =>
    toast.info("Tính năng này đang được phát triển.");
  const handleInsertToken = (token: string) => {
    if (onInsertToken) {
      onInsertToken(editor, token);
      return;
    }

    editor.chain().focus().insertContent(`{{${token}}}`).run();
  };
  const handleInsertContent = (content: string) => {
    if (!content) return;
    editor.chain().focus().insertContent(content).run();
  };

  const toolbar = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 px-2 py-1.5",
        toolbarPlacement === "top"
          ? "border-b border-card-border"
          : "border-t border-card-border",
      )}
    >
      <ToolbarButton
        label="In đậm"
        active={editor.isActive("bold")}
        onPress={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="In nghiêng"
        active={editor.isActive("italic")}
        onPress={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Gạch chân"
        active={editor.isActive("underline")}
        onPress={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        label="Gạch ngang"
        active={editor.isActive("strike")}
        onPress={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-card-border" aria-hidden="true" />
      <ToolbarButton
        label="Chèn liên kết"
        active={editor.isActive("link")}
        onPress={handleLink}
      >
        <Link1AngularRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Chèn ảnh"
        active={false}
        onPress={handleUnsupported}
      >
        <FileImage size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Đính kèm tệp"
        active={false}
        onPress={handleUnsupported}
      >
        <Paperclip2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Trợ lý AI"
        active={false}
        onPress={handleUnsupported}
      >
        <SparkleFill size={16} />
      </ToolbarButton>
      {renderInsertControl
        ? renderInsertControl(handleInsertToken, handleInsertContent)
        : showInsertButton && (
            <Button
              variant="ghost"
              size="xs"
              aria-label="Chèn nội dung"
              onPress={onInsert}
              className="gap-1 px-1.5 text-sm font-semibold text-text-secondary"
            >
              Chèn
              <ChevronDown size={14} aria-hidden="true" />
            </Button>
          )}
      {toolbarEndContent ? (
        <div className="ml-auto shrink-0">{toolbarEndContent}</div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-card-border bg-input-background",
        className,
      )}
    >
      {toolbarPlacement === "top" ? toolbar : null}
      <EditorContent
        editor={editor}
        className={cn(
          "min-h-0 flex-1",
          scrollable && "overflow-y-auto overscroll-contain",
        )}
      />
      {toolbarPlacement === "bottom" ? toolbar : null}
    </div>
  );
}
