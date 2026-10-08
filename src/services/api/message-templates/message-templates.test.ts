import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMessageTemplate,
  createMessageTemplateLibrary,
  deleteMessageTemplate,
  deleteMessageTemplateLibrary,
  listAdminMessageTemplateLibrary,
  listMessageTemplatePreviewContacts,
  listMessageTemplateTokens,
  listMessageTemplateLibrary,
  listMessageTemplates,
  MessageTemplatesApiError,
  previewMessageTemplate,
  updateMessageTemplate,
  updateMessageTemplateLibrary,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const urlOf = (index: number) =>
  new URL(String(fetchMock.mock.calls[index]![0]));
const initOf = (index: number): RequestInit & { body?: string } =>
  fetchMock.mock.calls[index]![1];

describe("Message templates API service", () => {
  const draft = {
    name: "Liên hệ lần đầu",
    subject: "Chào {{student.first_name}}",
    body: "<p>Nội dung email</p>",
    sharing: "public" as const,
    customValues: {},
  };
  const libraryDraft = {
    name: draft.name,
    subject: draft.subject,
    body: draft.body,
    customValues: draft.customValues,
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

  it("loads permission-scoped templates and owner options", async () => {
    fetchMock.mockResolvedValue(
      json({
        total: 1,
        owners: [{ id: "owner@example.com", name: "Người tạo" }],
        templates: [{ id: "MSG-001", code: "MSG-001", name: draft.name }],
      }),
    );

    const result = await listMessageTemplates({
      search: "Liên hệ",
      owner: "owner@example.com",
    });

    expect(result.total).toBe(1);
    expect(urlOf(0).pathname).toBe("/api/v1/message-templates");
    expect(urlOf(0).searchParams.get("search")).toBe("Liên hệ");
    expect(urlOf(0).searchParams.get("owner")).toBe("owner@example.com");
    expect(initOf(0)).toMatchObject({ method: "GET", credentials: "include" });
  });

  it("sends the shared draft contract for create and update", async () => {
    fetchMock.mockImplementation(async () =>
      json({ template: { id: "MSG-001" } }),
    );

    await createMessageTemplate(draft);
    await updateMessageTemplate(
      "MSG-001",
      { ...draft, sharing: "private" },
      "modified-1",
    );

    expect(urlOf(0).pathname).toBe("/api/v1/message-templates");
    expect(initOf(0)).toMatchObject({ method: "POST" });
    expect(JSON.parse(initOf(0).body!)).toEqual(draft);

    expect(urlOf(1).pathname).toBe("/api/v1/message-templates/MSG-001");
    expect(initOf(1)).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(initOf(1).body!)).toEqual({
      ...draft,
      sharing: "private",
      expectedModified: "modified-1",
    });
  });

  it("loads the seeded system-template library", async () => {
    fetchMock.mockResolvedValue(json({ templates: [], owners: [], total: 0 }));

    await listMessageTemplateLibrary();

    expect(urlOf(0).pathname).toBe("/api/v1/message-templates/library");
    expect(initOf(0)).toMatchObject({ method: "GET" });
  });

  it("loads the backend-owned token catalog", async () => {
    fetchMock.mockResolvedValue(
      json({
        total: 2,
        tokens: [
          {
            id: "school-name",
            value: "school.name",
            label: "School Name",
            group: "common",
            groupLabel: "Thông tin chung",
            sourceType: "admin_value",
            adminValue: "Đại học FPT",
          },
          {
            id: "program-name",
            value: "program.name",
            label: "Program Name",
            group: "custom",
            groupLabel: "Thông tin nhập thêm",
            sourceType: "user_value",
          },
        ],
      }),
    );

    await expect(listMessageTemplateTokens()).resolves.toMatchObject({
      total: 2,
      tokens: [{ value: "school.name" }, { value: "program.name" }],
    });
    expect(urlOf(0).pathname).toBe("/api/v1/message-templates/tokens");
  });

  it("pages the admin library", async () => {
    fetchMock.mockResolvedValue(
      json({ templates: [], owners: [], total: 40, start: 20, pageLength: 20 }),
    );

    const result = await listAdminMessageTemplateLibrary({
      search: "chào",
      start: 20,
      pageLength: 20,
    });

    expect(urlOf(0).pathname).toBe("/api/v1/message-templates/library/admin");
    expect(Object.fromEntries(urlOf(0).searchParams)).toEqual({
      search: "chào",
      start: "20",
      page_length: "20",
    });
    expect(result).toMatchObject({ total: 40, start: 20, pageLength: 20 });
  });

  it("uses the admin library endpoints without sending user sharing fields", async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "DELETE") return json({ deleted: "MSG-LIB-001" });
      if (method === "GET")
        return json({ templates: [], owners: [], total: 0 });
      return json({ template: { id: "MSG-LIB-001" } });
    });

    await listAdminMessageTemplateLibrary();
    await createMessageTemplateLibrary(draft);
    await updateMessageTemplateLibrary("MSG-LIB-001", draft, "modified-1");
    const deleted = await deleteMessageTemplateLibrary(
      "MSG-LIB-001",
      "modified-2",
    );

    expect(urlOf(0).pathname).toBe("/api/v1/message-templates/library/admin");

    expect(urlOf(1).pathname).toBe("/api/v1/message-templates/library");
    expect(initOf(1)).toMatchObject({ method: "POST" });
    expect(JSON.parse(initOf(1).body!)).toEqual(libraryDraft);

    expect(urlOf(2).pathname).toBe(
      "/api/v1/message-templates/library/MSG-LIB-001",
    );
    expect(initOf(2)).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(initOf(2).body!)).toEqual({
      ...libraryDraft,
      expectedModified: "modified-1",
    });

    expect(urlOf(3).pathname).toBe(
      "/api/v1/message-templates/library/MSG-LIB-001",
    );
    expect(urlOf(3).searchParams.get("expectedModified")).toBe("modified-2");
    expect(initOf(3)).toMatchObject({ method: "DELETE" });
    expect(deleted).toEqual({ name: "MSG-LIB-001", deleted: true });
  });

  it("returns the delete result", async () => {
    fetchMock.mockResolvedValue(json({ deleted: "MSG-001" }));

    await expect(
      deleteMessageTemplate("MSG-001", "modified-1"),
    ).resolves.toEqual({ name: "MSG-001", deleted: true });
    expect(urlOf(0).pathname).toBe("/api/v1/message-templates/MSG-001");
    expect(urlOf(0).searchParams.get("expectedModified")).toBe("modified-1");
  });

  it("loads real preview contacts and resolves a draft against a Lead", async () => {
    fetchMock
      .mockResolvedValueOnce(
        json({
          contacts: [
            {
              id: "LEAD-001",
              label: "Nguyễn Minh Anh · LEAD-001",
              email: "minh.anh@example.com",
              phone: "0900000000",
            },
          ],
          total: 1,
        }),
      )
      .mockResolvedValueOnce(
        json({
          lead: {
            id: "LEAD-001",
            label: "Nguyễn Minh Anh · LEAD-001",
            email: "minh.anh@example.com",
            phone: "0900000000",
          },
          subject: "Chào Anh",
          body: "<p>Nguyễn Minh Anh</p>",
          missingTokens: [],
        }),
      );

    await expect(
      listMessageTemplatePreviewContacts({
        search: "Minh Anh",
        pageLength: 100,
      }),
    ).resolves.toMatchObject({ total: 1 });
    await expect(
      previewMessageTemplate("LEAD-001", {
        subject: "Chào {{student.first_name}}",
        body: "<p>{{student.full_name}}</p>",
        customValues: {},
      }),
    ).resolves.toMatchObject({
      subject: "Chào Anh",
      body: "<p>Nguyễn Minh Anh</p>",
    });

    expect(urlOf(0).pathname).toBe(
      "/api/v1/message-templates/preview-contacts",
    );
    expect(Object.fromEntries(urlOf(0).searchParams)).toEqual({
      search: "Minh Anh",
      limit: "100",
    });
    expect(urlOf(1).pathname).toBe("/api/v1/message-templates/preview");
    expect(initOf(1)).toMatchObject({ method: "POST" });
    expect(JSON.parse(initOf(1).body!)).toEqual({
      recordId: "LEAD-001",
      context: "lead",
      data: {
        subject: "Chào {{student.first_name}}",
        body: "<p>{{student.full_name}}</p>",
        customValues: {},
      },
    });
  });

  it("previews against a student when the context says so", async () => {
    fetchMock.mockResolvedValue(
      json({ subject: "s", body: "b", missingTokens: [] }),
    );

    await previewMessageTemplate(
      "STU-1",
      { subject: "s", body: "b", customValues: {} },
      { context: "student" },
    );

    expect(JSON.parse(initOf(0).body!)).toMatchObject({
      recordId: "STU-1",
      context: "student",
    });
  });

  it("reports an upstream failure as a message templates error", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    );

    await expect(listMessageTemplates()).rejects.toEqual(
      expect.objectContaining<Partial<MessageTemplatesApiError>>({
        status: 403,
        code: "FORBIDDEN",
        message: "Không có quyền.",
      }),
    );
  });
});
