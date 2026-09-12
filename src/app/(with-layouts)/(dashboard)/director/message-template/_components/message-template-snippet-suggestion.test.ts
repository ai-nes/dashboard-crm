import { describe, expect, it } from "vitest";

import type { SnippetRecord } from "@/services/api/snippets";

import { filterSnippetSuggestions } from "./message-template-snippet-suggestion";

function createSnippet(
  id: string,
  internalName: string,
  shortcut: string,
): SnippetRecord {
  return {
    id,
    code: id,
    internalName,
    snippetText: `${internalName} content`,
    shortcut,
    ownerId: "owner@example.com",
    owner: "Owner",
    sharing: "public",
    createdAt: "2026-09-12",
    modifiedAt: "2026-09-12",
    canEdit: true,
  };
}

describe("message template snippet suggestions", () => {
  const snippets = [
    createSnippet("SNP-001", "Lời chào", "xinchao"),
    createSnippet("SNP-002", "Tư vấn học phí", "hocphi"),
  ];

  it("filters shortcut suggestions as each character is typed", () => {
    expect(filterSnippetSuggestions(snippets, "xin")).toEqual([snippets[0]]);
    expect(filterSnippetSuggestions(snippets, "hoc")).toEqual([snippets[1]]);
  });

  it("also finds a snippet by its internal name and shows all on #", () => {
    expect(filterSnippetSuggestions(snippets, "học phí")).toEqual([
      snippets[1],
    ]);
    expect(filterSnippetSuggestions(snippets, "")).toEqual(snippets);
  });
});
