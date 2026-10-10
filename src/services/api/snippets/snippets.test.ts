import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSnippet,
  deleteSnippet,
  listSnippets,
  SnippetsApiError,
  updateSnippet,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("Snippets API service", () => {
  const draft = {
    internalName: "Lời chào đầu tiên",
    snippetText: "Xin chào {{student.full_name}}",
    shortcut: "xinchao",
    sharing: "public" as const,
  };

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("loads permission-scoped snippets and filter options", async () => {
    fetchMock.mockResolvedValue(
      json({
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
      }),
    );

    const result = await listSnippets({
      search: "Lời chào",
      owner: "owner@example.com",
      sharing: "private",
      scope: "all",
      page: 1,
      pageSize: 5,
    });

    expect(result.total).toBe(1);
    expect(result.snippets[0]?.id).toBe("SNP-001");
    const requestUrl = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(requestUrl.pathname).toBe("/api/v1/snippets");
    expect(requestUrl.searchParams.get("search")).toBe("Lời chào");
    expect(requestUrl.searchParams.get("owner")).toBe("owner@example.com");
    expect(requestUrl.searchParams.get("sharing")).toBe("private");
    expect(requestUrl.searchParams.get("scope")).toBe("all");
    expect(requestUrl.searchParams.get("page")).toBe("1");
    expect(requestUrl.searchParams.get("pageSize")).toBe("5");
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
  });

  it("normalizes nullable fields before the UI consumes them", async () => {
    fetchMock.mockResolvedValue(
      json({
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
      }),
    );

    await expect(listSnippets({})).resolves.toEqual({
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
    fetchMock.mockImplementation(async () => json({ id: "SNP-001" }));

    await createSnippet(draft);
    await updateSnippet(
      "SNP-001",
      { ...draft, sharing: "private" },
      "modified-1",
    );

    const [createUrl, createInit] = fetchMock.mock.calls[0]!;
    expect(createUrl).toBe(`${API}/api/v1/snippets`);
    expect(createInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(createInit.body)).toEqual(draft);

    const [updateUrl, updateInit] = fetchMock.mock.calls[1]!;
    expect(updateUrl).toBe(
      `${API}/api/v1/snippets/SNP-001?expectedModified=modified-1`,
    );
    expect(updateInit).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(updateInit.body)).toEqual({
      ...draft,
      sharing: "private",
    });
  });

  it("returns the delete result", async () => {
    fetchMock.mockResolvedValue(json({ deleted: "SNP-001" }));

    await expect(deleteSnippet("SNP-001", "modified-1")).resolves.toEqual({
      name: "SNP-001",
      deleted: true,
    });
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/snippets/SNP-001?expectedModified=modified-1`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: "DELETE" });
  });

  it("reports an upstream failure as a snippets error", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "STALE_REVISION", message: "Đã thay đổi." } }, 409),
    );

    await expect(deleteSnippet("SNP-001", "old")).rejects.toEqual(
      expect.objectContaining<Partial<SnippetsApiError>>({
        status: 409,
        code: "STALE_REVISION",
      }),
    );
  });
});
