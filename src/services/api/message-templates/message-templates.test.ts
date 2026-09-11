import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMessageTemplate,
  createMessageTemplateLibrary,
  deleteMessageTemplate,
  deleteMessageTemplateLibrary,
  listAdminMessageTemplateLibrary,
  listMessageTemplatePreviewContacts,
  listMessageTemplateLibrary,
  listMessageTemplates,
  previewMessageTemplate,
  updateMessageTemplate,
  updateMessageTemplateLibrary,
} from "./index";

vi.mock("../auth", () => ({
  getCsrfToken: vi.fn().mockResolvedValue("csrf-token"),
}));

describe("Message templates API service", () => {
  const originalFetch = globalThis.fetch;
  const baseUrl = "http://crm-test.local:8000";
  const draft = {
    name: "Liên hệ lần đầu",
    subject: "Chào {{student.first_name}}",
    body: "<p>Nội dung email</p>",
    sharing: "public" as const,
  };

  beforeEach(() => vi.restoreAllMocks());

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("loads permission-scoped templates and owner options", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            total: 1,
            owners: [{ id: "owner@example.com", name: "Người tạo" }],
            templates: [{ id: "MSG-001", code: "MSG-001", name: draft.name }],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await listMessageTemplates(
      { search: "Liên hệ", owner: "owner@example.com" },
      { baseUrl },
    );

    expect(result.total).toBe(1);
    const requestUrl = new URL(String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0]));
    expect(requestUrl.pathname).toBe(
      "/api/method/crm.api.message_templates.list_message_templates",
    );
    expect(requestUrl.searchParams.get("search")).toBe("Liên hệ");
    expect(requestUrl.searchParams.get("owner")).toBe("owner@example.com");
  });

  it("sends the shared draft contract for create and update", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { id: "MSG-001" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { id: "MSG-001" } }), { status: 200 }));

    await createMessageTemplate(draft, { baseUrl });
    await updateMessageTemplate("MSG-001", { ...draft, sharing: "private" }, "modified-1", { baseUrl });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}/api/method/crm.api.message_templates.create_message_template`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ data: draft }),
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/api/method/crm.api.message_templates.update_message_template`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "MSG-001",
          data: { ...draft, sharing: "private" },
          expected_modified: "modified-1",
        }),
      }),
    );
  });

  it("loads the seeded system-template library", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: { templates: [], owners: [], total: 0 } }), { status: 200 }),
    );

    await listMessageTemplateLibrary({ baseUrl });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/method/crm.api.message_templates.list_message_template_library`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("uses the admin library endpoints without sending user sharing fields", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { templates: [], owners: [], total: 0 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { id: "MSG-LIB-001" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { id: "MSG-LIB-001" } }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: { name: "MSG-LIB-001", deleted: true } }), { status: 200 }),
      );

    await listAdminMessageTemplateLibrary({ baseUrl });
    await createMessageTemplateLibrary(draft, { baseUrl });
    await updateMessageTemplateLibrary("MSG-LIB-001", draft, "modified-1", { baseUrl });
    await deleteMessageTemplateLibrary("MSG-LIB-001", "modified-2", { baseUrl });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}/api/method/crm.api.message_templates.list_admin_message_template_library`,
      expect.objectContaining({ method: "GET" }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/api/method/crm.api.message_templates.create_message_template_library`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          data: { name: draft.name, subject: draft.subject, body: draft.body },
        }),
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      3,
      `${baseUrl}/api/method/crm.api.message_templates.update_message_template_library`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "MSG-LIB-001",
          data: { name: draft.name, subject: draft.subject, body: draft.body },
          expected_modified: "modified-1",
        }),
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      4,
      `${baseUrl}/api/method/crm.api.message_templates.delete_message_template_library`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "MSG-LIB-001", expected_modified: "modified-2" }),
      }),
    );
  });

  it("returns the delete result from the Frappe envelope", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: { name: "MSG-001", deleted: true } }), { status: 200 }),
    );

    await expect(deleteMessageTemplate("MSG-001", "modified-1", { baseUrl })).resolves.toEqual({
      name: "MSG-001",
      deleted: true,
    });
  });

  it("loads real preview contacts and resolves a draft against a Lead", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: {
              contacts: [
                {
                  id: "LEAD-001",
                  label: "Nguyễn Minh Anh · LEAD-001",
                  email: "minh.anh@example.com",
                  phone: "0900000000",
                },
              ],
              total: 1,
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: {
              lead: {
                id: "LEAD-001",
                label: "Nguyễn Minh Anh · LEAD-001",
                email: "minh.anh@example.com",
                phone: "0900000000",
              },
              subject: "Chào Anh",
              body: "<p>Nguyễn Minh Anh</p>",
              missingTokens: [],
            },
          }),
          { status: 200 },
        ),
      );

    await expect(
      listMessageTemplatePreviewContacts({ search: "Minh Anh", pageLength: 100 }, { baseUrl }),
    ).resolves.toMatchObject({ total: 1 });
    await expect(
      previewMessageTemplate(
        "LEAD-001",
        { subject: "Chào {{student.first_name}}", body: "<p>{{student.full_name}}</p>" },
        { baseUrl },
      ),
    ).resolves.toMatchObject({ subject: "Chào Anh", body: "<p>Nguyễn Minh Anh</p>" });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}/api/method/crm.api.message_templates.list_message_template_preview_contacts?search=Minh+Anh&page_length=100`,
      expect.objectContaining({ method: "GET" }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/api/method/crm.api.message_templates.preview_message_template`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          lead_id: "LEAD-001",
          data: { subject: "Chào {{student.first_name}}", body: "<p>{{student.full_name}}</p>" },
        }),
      }),
    );
  });
});
