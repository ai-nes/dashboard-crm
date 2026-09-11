"use client";

import { generateHTML, type Extensions, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

import MessageTemplateToken from "./message-template-token-node";

const TOKEN_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;
const HTML_TAG_PATTERN = /(<[^>]+>)/g;

const BODY_EXTENSIONS = [
  StarterKit as unknown as Extensions[number],
  MessageTemplateToken as unknown as Extensions[number],
] as Extensions;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderToken(token: string) {
  const value = token.trim();

  return `<span data-message-template-token="${escapeHtml(value)}">${escapeHtml(`{{${value}}}`)}</span>`;
}

function renderTextWithTokens(text: string) {
  return text
    .split(TOKEN_PATTERN)
    .map((part, index) => {
      if (index % 2 === 0) return escapeHtml(part);
      return renderToken(part);
    })
    .join("");
}

function plainTextToHtml(body: string) {
  const normalizedBody = body.replace(/\r\n?/g, "\n");

  return normalizedBody
    .split(/\n{2,}/g)
    .map(
      (paragraph) =>
        `<p>${paragraph.split("\n").map(renderTextWithTokens).join("<br />")}</p>`,
    )
    .join("");
}

function htmlToEditorHtml(body: string) {
  // Keep existing token nodes intact. Otherwise a token already represented by
  // a data attribute would be wrapped again when the body is normalized.
  if (body.includes("data-message-template-token")) return body;

  return body
    .split(HTML_TAG_PATTERN)
    .map((part) => (part.startsWith("<") ? part : renderTextWithTokens(part)))
    .join("");
}

function tokenizeJsonNode(node: JSONContent): JSONContent[] {
  if (node.type !== "text" || !node.text || !TOKEN_PATTERN.test(node.text)) {
    TOKEN_PATTERN.lastIndex = 0;
    return [{
      ...node,
      content: node.content?.flatMap(tokenizeJsonNode),
    }];
  }

  TOKEN_PATTERN.lastIndex = 0;
  const nodes: JSONContent[] = [];
  let lastIndex = 0;

  for (const match of node.text.matchAll(TOKEN_PATTERN)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      nodes.push({
        type: "text",
        text: node.text.slice(lastIndex, matchIndex),
        marks: node.marks,
      });
    }

    nodes.push({
      type: MessageTemplateToken.name,
      attrs: { token: match[1].trim() },
    });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < node.text.length) {
    nodes.push({
      type: "text",
      text: node.text.slice(lastIndex),
      marks: node.marks,
    });
  }

  return nodes;
}

function jsonDocumentToText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";

  return node.content?.map(jsonDocumentToText).join("") ?? "";
}

function asJsonDocument(value: unknown): JSONContent | null {
  if (Array.isArray(value)) {
    return { type: "doc", content: value as JSONContent[] };
  }

  if (!value || typeof value !== "object") return null;

  const object = value as Record<string, unknown>;
  if (object.type === "doc" && Array.isArray(object.content)) {
    return object as JSONContent;
  }

  if (typeof object.type === "string") {
    return { type: "doc", content: [object as JSONContent] };
  }

  if (Array.isArray(object.content)) {
    return { type: "doc", content: object.content as JSONContent[] };
  }

  return null;
}

function parseJsonBody(body: string): JSONContent | null {
  let value: unknown = body.trim();

  // Frappe can return a JSON field that has been encoded more than once.
  for (let attempt = 0; attempt < 3 && typeof value === "string"; attempt += 1) {
    if (!/^[\[{]/.test(value.trim())) return null;

    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }

  return asJsonDocument(value);
}

function jsonBodyToHtml(body: string) {
  const document = parseJsonBody(body);
  if (!document) return null;

  try {
    return generateHTML({
      ...document,
      content: document.content?.flatMap(tokenizeJsonNode),
    }, BODY_EXTENSIONS);
  } catch {
    // An unknown node from an older editor version should not leak its JSON
    // representation into the editor. Falling back to readable text keeps the
    // template usable while preserving the normal plain-text conversion path.
    return plainTextToHtml(jsonDocumentToText(document));
  }
}

export function normalizeMessageTemplateBody(body: string) {
  if (!body) return body;

  const jsonHtml = jsonBodyToHtml(body);
  if (jsonHtml !== null) return jsonHtml;

  return /<\/?[a-z][\s\S]*>/i.test(body)
    ? htmlToEditorHtml(body)
    : plainTextToHtml(body);
}

export function messageTemplatePreviewDocument(body: string) {
  const html = normalizeMessageTemplateBody(body);

  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>html,body{min-height:100%;margin:0}body{box-sizing:border-box;padding:12px 16px;font-family:Inter,Arial,sans-serif;font-size:16px;line-height:2rem;word-break:break-word}*,*:before,*:after{box-sizing:border-box}p{margin:0}p:not(:last-child){margin-bottom:2rem}img{max-width:100%;height:auto}a{text-decoration:underline}</style></head><body>${html}</body></html>`;
}
