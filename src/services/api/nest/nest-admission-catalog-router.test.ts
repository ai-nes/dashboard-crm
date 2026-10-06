import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return {
    url,
    method: init.method ?? "GET",
    body: init.body ? JSON.parse(String(init.body)) : undefined,
  };
};

describe("admission profile catalog with the Nest backend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads the catalog and lists templates, document types and methods", async () => {
    const catalog = {
      methods: [],
      years: [],
      offerings: [],
      documentTypes: [],
      templates: [],
      specialTemplates: [],
    };
    fetchMock.mockImplementation(() => json(catalog));
    const api = await import("../admission-profile-catalog");
    await expect(
      api.getAdmissionProfileCatalog({ admissionYear: "y1", search: "cc" }),
    ).resolves.toMatchObject({ templates: [] });
    expect(lastCall().url).toBe(
      "http://api.test/api/v1/admission-catalog/profile-catalog?admission_year=y1&search=cc",
    );

    fetchMock.mockImplementation(() =>
      json({ templates: [], documentTypes: [] }),
    );
    await api.listAdmissionProfileTemplates({
      status: "Active",
      templateKind: "special",
      start: 0,
      pageLength: 10,
    });
    expect(lastCall().url).toBe(
      "http://api.test/api/v1/admission-catalog/profile-templates?status=Active&template_kind=special&start=0&page_length=10",
    );

    fetchMock.mockImplementation(() => json({ documentTypes: [] }));
    await api.listAdmissionDocumentTypes({ includeArchived: false });
    expect(lastCall().url).toBe(
      "http://api.test/api/v1/admission-catalog/document-types?include_archived=0",
    );

    fetchMock.mockImplementation(() => json({ methods: [] }));
    await api.listAdmissionMethods({ includeDisabled: false });
    expect(lastCall().url).toBe(
      "http://api.test/api/v1/admission-catalog/methods?include_disabled=0",
    );
  });

  it("maps writes to the matching REST verbs with the revision stamp", async () => {
    fetchMock.mockImplementation(() => json({ id: "t1" }));
    const api = await import("../admission-profile-catalog");
    await api.createAdmissionProfileTemplate({
      template_code: "A",
    } as never);
    expect(lastCall()).toMatchObject({
      method: "POST",
      url: "http://api.test/api/v1/admission-catalog/profile-templates",
      body: { data: { template_code: "A" } },
    });

    await api.updateAdmissionDocumentType({
      name: "d 1",
      data: { name: "x" } as never,
      expectedModified: "2026-10-07T00:00:00.000Z",
    });
    expect(lastCall()).toMatchObject({
      method: "PATCH",
      url: "http://api.test/api/v1/admission-catalog/document-types/d%201",
      body: {
        data: { name: "x" },
        expectedModified: "2026-10-07T00:00:00.000Z",
      },
    });

    await api.transitionAdmissionProfileTemplate({
      name: "t1",
      status: "Archived",
    });
    expect(lastCall()).toMatchObject({
      method: "POST",
      url: "http://api.test/api/v1/admission-catalog/profile-templates/t1/transition",
      body: { status: "Archived" },
    });

    await api.deleteAdmissionMethod({ name: "m1", expectedModified: "s" });
    expect(lastCall()).toMatchObject({
      method: "DELETE",
      url: "http://api.test/api/v1/admission-catalog/methods/m1?expectedModified=s",
    });
  });

  it("sends application commands and document uploads to the profile API", async () => {
    fetchMock.mockImplementation(() => json({ application: "a1" }));
    const api = await import("../admission-profile-catalog");
    await api.createAdmissionApplication({
      student: "s1",
      values: { admission_method: "m1", preference: "Primary" } as never,
      expectedRevision: 3,
      idempotencyKey: "key-12345678",
    });
    expect(lastCall()).toMatchObject({
      method: "POST",
      url: "http://api.test/api/v1/admission-profile/applications",
      body: {
        student: "s1",
        expectedRevision: 3,
        idempotencyKey: "key-12345678",
      },
    });

    await api.updateAdmissionApplicationPreference({
      application: "a 1",
      preference: "Alternative",
    });
    expect(lastCall()).toMatchObject({
      method: "PUT",
      url: "http://api.test/api/v1/admission-profile/applications/a%201/preference",
      body: { preference: "Alternative" },
    });

    await api.updateAdmissionApplication({
      application: "a1",
      values: { admission_method: "m2", profile_template: "t2" } as never,
    });
    expect(lastCall()).toMatchObject({
      method: "PUT",
      url: "http://api.test/api/v1/admission-profile/applications/a1",
      body: { values: { admission_method: "m2" } },
    });

    fetchMock.mockImplementation(() => json({ document: { id: "d1" } }));
    const file = new File(["scan"], "cccd.txt", { type: "text/plain" });
    await api.uploadStudentAdmissionDocument({
      student: "s1",
      profile: "p1",
      documentType: "dt1",
      application: "a1",
      file,
    });
    const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/admission-profile/documents");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("document_type")).toBe("dt1");
  });

  it("keeps the backend error code and message", async () => {
    fetchMock.mockImplementation(() =>
      json(
        { error: { code: "STALE_CATALOG_ITEM", message: "Đã thay đổi." } },
        409,
      ),
    );
    const api = await import("../admission-profile-catalog");
    await expect(
      api.deleteAdmissionProfileTemplate({ name: "t1" }),
    ).rejects.toMatchObject({ status: 409, code: "STALE_CATALOG_ITEM" });
  });
});
