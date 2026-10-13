import type { CRMTaskStatus } from "./types";
import { getTaskActionMetadata } from "../tasks/action-catalog";

/** Backlog and Todo share one management lane, so they use one end-user label. */
export const CRM_TASK_STATUS_LABEL: Record<CRMTaskStatus, string> = {
  Backlog: "Cần làm",
  Todo: "Cần làm",
  "In Progress": "Đang xử lý",
  Done: "Hoàn thành",
  Canceled: "Đã hủy",
};

const TECHNICAL_TASK_CODE = /^[A-Z0-9]+(?:_[A-Z0-9]+)+$/i;

/** A human label for task cards; unknown action codes never leak to the UI. */
export function getTaskTypeLabel(
  actionCode?: string | null,
  fallback?: string | null,
): string {
  const metadata = getTaskActionMetadata(actionCode ?? undefined);
  if (metadata?.displayName) return metadata.displayName;

  const readableFallback = fallback?.trim();
  return readableFallback && !TECHNICAL_TASK_CODE.test(readableFallback)
    ? readableFallback
    : "Việc cần làm";
}

const BLOCK_CONTENT_TAG =
  "script|style|iframe|object|embed|svg|math|noscript|template";
const TEXT_BLOCK_TAG =
  "address|blockquote|dd|div|dl|dt|h[1-6]|li|ol|p|pre|section|table|tr|ul";
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, token: string) => {
      if (token[0] !== "#") {
        const name = token.toLowerCase();
        return Object.hasOwn(NAMED_ENTITIES, name)
          ? NAMED_ENTITIES[name]
          : entity;
      }

      const codePoint =
        token[1]?.toLowerCase() === "x"
          ? Number.parseInt(token.slice(2), 16)
          : Number.parseInt(token.slice(1), 10);
      if (
        !Number.isInteger(codePoint) ||
        codePoint < 0 ||
        codePoint > 0x10ffff ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)
      ) {
        return entity;
      }
      return String.fromCodePoint(codePoint);
    },
  );
}

function stripUnsafeTaskHtmlContent(value: string): string {
  return value
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(
      new RegExp(
        "<\\s*(" +
          BLOCK_CONTENT_TAG +
          ")\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>",
        "gi",
      ),
      " ",
    )
    .replace(
      new RegExp("<\\s*(" + BLOCK_CONTENT_TAG + ")\\b[^>]*>[\\s\\S]*$", "gi"),
      " ",
    );
}

const TASK_DESCRIPTION_TAGS = [
  "p",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "span",
] as const;

export type TaskDescriptionTag = (typeof TASK_DESCRIPTION_TAGS)[number];

export type TaskDescriptionNode =
  | { type: "text"; value: string }
  | {
      type: "element";
      tag: TaskDescriptionTag;
      children: TaskDescriptionNode[];
    };

const TASK_DESCRIPTION_TAG_SET: ReadonlySet<string> = new Set(
  TASK_DESCRIPTION_TAGS,
);
const VOID_TASK_DESCRIPTION_TAGS: ReadonlySet<string> = new Set(["br", "hr"]);

/** Parses editor HTML into text and fixed, attribute-free formatting nodes. */
export function parseTaskDescription(
  description?: string | null,
): TaskDescriptionNode[] {
  if (!description) return [];

  const root: { tag: null; children: TaskDescriptionNode[] } = {
    tag: null,
    children: [],
  };
  const stack: Array<{
    tag: TaskDescriptionTag | null;
    children: TaskDescriptionNode[];
  }> = [root];
  const safeHtml = stripUnsafeTaskHtmlContent(description);
  const tokens =
    safeHtml.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>]*>|[^<]+|</gi) ?? [];

  for (const token of tokens) {
    if (token.startsWith("<!--") || token.startsWith("<!")) continue;

    const tagMatch = token.match(/^<\s*(\/?)\s*([a-z][a-z0-9:-]*)\b[^>]*>$/i);
    if (!tagMatch) {
      stack[stack.length - 1]?.children.push({
        type: "text",
        value: decodeHtmlEntities(token),
      });
      continue;
    }

    const tagName = tagMatch[2]!.toLowerCase();
    if (!TASK_DESCRIPTION_TAG_SET.has(tagName)) continue;

    if (tagMatch[1]) {
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index]?.tag === tagName) {
          stack.length = index;
          break;
        }
      }
      continue;
    }

    const tag = tagName as TaskDescriptionTag;
    const node: Extract<TaskDescriptionNode, { type: "element" }> = {
      type: "element",
      tag,
      children: [],
    };
    stack[stack.length - 1]?.children.push(node);

    if (!VOID_TASK_DESCRIPTION_TAGS.has(tag) && !/\/\s*>$/.test(token)) {
      stack.push(node);
    }
  }

  return root.children;
}

/** Converts stored editor HTML to plain, safe text for read-only previews. */
export function getTaskDescriptionPreview(description?: string | null): string {
  if (!description) return "";

  const text = stripUnsafeTaskHtmlContent(description)
    .replace(/<\s*br\b[^>]*\/?>/gi, " ")
    .replace(new RegExp(`<\\s*\\/\\s*(${TEXT_BLOCK_TAG})\\s*>`, "gi"), " ")
    .replace(/<[^>]*>/g, "")
    .replace(/<|>/g, " ");

  return decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
}
