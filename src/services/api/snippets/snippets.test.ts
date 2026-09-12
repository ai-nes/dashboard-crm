import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSnippet,
  deleteSnippet,
  listSnippets,
  updateSnippet,
} from "./index";

vi.mock("../auth", () => ({
  getCsrfToken: vi.fn().mockResolvedValue("csrf-token"),
}));

describe("Snippets API service", () => {
  const originalFetch = globalThis.fetch;
  const baseUrl = "http://crm-test.local:8000";
  const draft = {
    internalName: "Lời chào đầu tiên",
    snippetText: "Xin chào {{student.full_name}}",
    shortcut: "xinchao",
    sharing: "public" as const,
  };

  beforeEach(() => vi.restoreAllMocks());

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("loads permission-scoped snippets and filter options", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            total: 1,
            totalAll: 1,
            totalMine: 1,
            page: 1,
            pageSize: 5,
            totalPages: 1,
            hasNextPage: false,
            owners: [{ id: "owner@example.com", name: "Người tạo" }],
            snippets: [
              {
                id: "SNP-001",
                code: "SNP-001",
                internalName: draft.internalName,
                snippetText: draft.snippetText,
                shortcut: draft.shortcut,
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await listSnippets(
      {
        search: "Lời chào",
        owner: "owner@example.com",
        sharing: "private",
        scope: "all",
        page: 1,
        pageSize: 5,
      },
      { baseUrl },
    );

    expect(result.total).toBe(1);
    const requestUrl = new URL(
      String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0]),
    );
    expect(requestUrl.pathname).toBe(
      "/api/method/crm.api.snippets.list_snippets",
    );
    expect(requestUrl.searchParams.get("search")).toBe("Lời chào");
    expect(requestUrl.searchParams.get("owner")).toBe("owner@example.com");
    expect(requestUrl.searchParams.get("sharing")).toBe("private");
    expect(requestUrl.searchParams.get("scope")).toBe("all");
    expect(requestUrl.searchParams.get("page")).toBe("1");
    expect(requestUrl.searchParams.get("pageSize")).toBe("5");
  });

  it("normalizes nullable legacy fields before the UI consumes them", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            total: 1,
            owners: [{ id: "owner@example.com", name: null }],
            snippets: [
              {
                id: "SNP-001",
                code: "SNP-001",
                internalName: null,
                snippetText: null,
                shortcut: null,
                ownerId: null,
                owner: null,
                sharing: null,
                canEdit: null,
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(listSnippets({}, { baseUrl })).resolves.toEqual({
      total: 1,
      totalAll: 1,
      totalMine: 0,
      page: 1,
      pageSize: 5,
      totalPages: 1,
      hasNextPage: false,
      owners: [{ id: "owner@example.com", name: "owner@example.com" }],
      snippets: [
        {
          id: "SNP-001",
          code: "SNP-001",
          internalName: "",
          snippetText: "",
          shortcut: "",
          ownerId: "",
          owner: "",
          sharing: "public",
          createdAt: "",
          modifiedAt: "",
          canEdit: false,
        },
      ],
    });
  });

  it("sends the shared draft contract for create and update", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: { id: "SNP-001" } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: { id: "SNP-001" } }), {
          status: 200,
        }),
      );

    await createSnippet(draft, { baseUrl });
    await updateSnippet(
      "SNP-001",
      { ...draft, sharing: "private" },
      "modified-1",
      { baseUrl },
    );

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}/api/method/crm.api.snippets.create_snippet`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ data: draft }),
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/api/method/crm.api.snippets.update_snippet`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "SNP-001",
          data: { ...draft, sharing: "private" },
          expected_modified: "modified-1",
        }),
      }),
    );
  });

  it("returns the delete result from the Frappe envelope", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ message: { name: "SNP-001", deleted: true } }),
          { status: 200 },
        ),
      );

    await expect(
      deleteSnippet("SNP-001", "modified-1", { baseUrl }),
    ).resolves.toEqual({
      name: "SNP-001",
      deleted: true,
    });
  });
});
