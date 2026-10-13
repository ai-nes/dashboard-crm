import { createElement, type ReactNode } from "react";

import {
  parseTaskDescription,
  type TaskDescriptionTag,
} from "@/services/api/crm-tasks";
import { cn } from "@/utils/cn";

const DESCRIPTION_ELEMENTS: Record<TaskDescriptionTag, TaskDescriptionTag> = {
  p: "p",
  strong: "strong",
  b: "b",
  em: "em",
  i: "i",
  u: "u",
  s: "s",
  strike: "strike",
  del: "del",
  code: "code",
  pre: "pre",
  blockquote: "blockquote",
  ul: "ul",
  ol: "ol",
  li: "li",
  br: "br",
  hr: "hr",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  div: "div",
  span: "span",
};

const DESCRIPTION_ELEMENT_CLASSES: Partial<Record<TaskDescriptionTag, string>> =
  {
    p: "my-1",
    strong: "font-bold",
    b: "font-bold",
    em: "italic",
    i: "italic",
    u: "underline",
    s: "line-through",
    strike: "line-through",
    del: "line-through",
    code: "rounded bg-background-soft-50 px-1 font-mono text-xs",
    pre: "overflow-x-auto whitespace-pre-wrap rounded-md bg-background-soft-50 p-2 font-mono text-xs",
    blockquote: "border-l-2 border-border-primary pl-3 italic",
    ul: "my-1 list-disc pl-5",
    ol: "my-1 list-decimal pl-5",
    li: "my-0.5",
    h1: "text-base font-semibold",
    h2: "text-base font-semibold",
    h3: "text-sm font-semibold",
    h4: "text-sm font-semibold",
    h5: "text-sm font-semibold",
    h6: "text-sm font-semibold",
  };

function renderDescriptionNode(
  node: ReturnType<typeof parseTaskDescription>[number],
  key: number,
): ReactNode {
  if (node.type === "text") return node.value;

  const Element = DESCRIPTION_ELEMENTS[node.tag];
  if (node.tag === "br" || node.tag === "hr") {
    return createElement(Element, { key });
  }

  return createElement(
    Element,
    {
      key,
      className: DESCRIPTION_ELEMENT_CLASSES[node.tag],
    },
    node.children.map((child, index) => renderDescriptionNode(child, index)),
  );
}

export interface TaskDescriptionPreviewProps {
  value?: string | null;
  className?: string;
}

/** Renders safe task-description text and formatting from a fixed tag set. */
export default function TaskDescriptionPreview({
  value,
  className,
}: TaskDescriptionPreviewProps) {
  const nodes = parseTaskDescription(value);

  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      {nodes.map((node, index) => renderDescriptionNode(node, index))}
    </div>
  );
}
