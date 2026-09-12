"use client";

import {
  Code1,
  UserCircle1,
  UserMultiple1,
  UserPencil,
} from "@tailgrids/icons";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";

type MessageTemplateTokenKind = "student" | "leads" | "sender" | "placeholder";

const tokenKindLabels: Record<MessageTemplateTokenKind, string> = {
  student: "Student",
  leads: "Leads",
  sender: "Sender",
  placeholder: "Placeholder",
};

function getTokenKind(namespace: string): MessageTemplateTokenKind {
  if (namespace === "student") return "student";
  if (namespace === "lead") return "leads";
  if (namespace === "owner") return "sender";
  return "placeholder";
}

function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getMessageTemplateTokenLabel(token: string): string {
  const [namespace = "placeholder", ...fieldParts] = token.trim().split(".");
  const kind = getTokenKind(namespace);
  const field = fieldParts.join("_") || namespace;
  const fieldLabel = titleCase(field);
  const displayFieldLabel =
    kind === "placeholder"
      ? `${titleCase(namespace)} ${fieldLabel}`
      : fieldLabel;

  return `${tokenKindLabels[kind]}: ${displayFieldLabel}`;
}

function TokenIcon({ kind }: { kind: MessageTemplateTokenKind }) {
  if (kind === "student") return <UserCircle1 size={14} aria-hidden="true" />;
  if (kind === "leads") return <UserMultiple1 size={14} aria-hidden="true" />;
  if (kind === "sender") return <UserPencil size={14} aria-hidden="true" />;
  return <Code1 size={14} aria-hidden="true" />;
}

function MessageTemplateTokenView({ node }: NodeViewProps) {
  const token = String(node.attrs.token ?? "");
  const [namespace = "placeholder"] = token.trim().split(".");
  const kind = getTokenKind(namespace);

  return (
    <NodeViewWrapper
      as="span"
      contentEditable={false}
      title={`{{${token}}}`}
      className="mx-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-text-primary/70 bg-background-gray-secondary/70 px-1.5 py-0.5 align-middle text-[0.9em] font-medium leading-5 text-text-primary shadow-none"
    >
      <span className="shrink-0 text-text-secondary">
        <TokenIcon kind={kind} />
      </span>
      <span>{getMessageTemplateTokenLabel(token)}</span>
    </NodeViewWrapper>
  );
}

const MessageTemplateToken = Node.create({
  name: "messageTemplateToken",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      token: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-message-template-token") ?? "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-message-template-token]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const token = String(node.attrs.token ?? "");

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-message-template-token": token,
        title: `{{${token}}}`,
        class:
          "mx-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-text-primary/70 bg-background-gray-secondary/70 px-1.5 py-0.5 align-middle text-[0.9em] font-medium leading-5 text-text-primary shadow-none",
      }),
      getMessageTemplateTokenLabel(token),
    ];
  },

  renderText({ node }) {
    return `{{${String(node.attrs.token ?? "")}}}`;
  },

  addNodeView() {
    return ReactNodeViewRenderer(MessageTemplateTokenView) as never;
  },
});

export default MessageTemplateToken;
