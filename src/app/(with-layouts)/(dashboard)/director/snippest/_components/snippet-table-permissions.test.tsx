import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { SnippetRecord } from "@/services/api/snippets";
import SnippetTable from "./snippet-table";

const snippet: SnippetRecord = {
  id: "SNP-001",
  code: "SNP-001",
  internalName: "Snippet One",
  snippetText: "Snippet text",
  shortcut: "hello",
  ownerId: "owner@example.test",
  owner: "Owner",
  sharing: "private",
  createdAt: "2026-01-01T00:00:00Z",
  modifiedAt: "2026-01-01T00:00:00Z",
  canEdit: true,
};

describe("snippet row actions", () => {
  it("hides create-copy, edit and delete affordances without their grants", () => {
    const html = renderToStaticMarkup(
      <SnippetTable
        snippets={[snippet]}
        totalCount={1}
        canCreate={false}
        canUpdate={false}
        canDelete={false}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(html).toContain("Snippet One");
    expect(html).not.toContain('aria-label="Nhân bản Snippet One"');
    expect(html).not.toContain('aria-label="Xóa Snippet One"');
    expect(html).not.toContain('aria-label="Chỉnh sửa Snippet One"');
  });

  it("shows actions only when the grant and record ownership allow them", () => {
    const html = renderToStaticMarkup(
      <SnippetTable
        snippets={[
          snippet,
          { ...snippet, id: "SNP-002", internalName: "Other", canEdit: false },
        ]}
        totalCount={2}
        canCreate
        canUpdate
        canDelete
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(html).toContain('aria-label="Nhân bản Snippet One"');
    expect(html).toContain('aria-label="Xóa Snippet One"');
    expect(html).toContain('aria-label="Chỉnh sửa Snippet One"');
    expect(html).not.toContain('aria-label="Xóa Other"');
    expect(html).not.toContain('aria-label="Chỉnh sửa Other"');
  });
});
