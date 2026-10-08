import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AdmissionProfileCatalogApiError,
  createAdmissionApplication,
  createAdmissionDocumentType,
  createAdmissionMethod,
  createAdmissionProfileTemplate,
  deleteAdmissionDocumentType,
  deleteAdmissionMethod,
  deleteAdmissionProfileTemplate,
  getAdmissionProfileCatalog,
  listAdmissionDocumentTypes,
  listAdmissionMethods,
  listAdmissionProfileTemplates,
  transitionAdmissionProfileTemplate,
  updateAdmissionApplication,
  updateAdmissionApplicationPreference,
  updateAdmissionDocumentType,
  updateAdmissionMethod,
  updateAdmissionProfileTemplate,
  uploadStudentAdmissionDocument,
} from ".";

const API = "http://localhost:3001";
const PROFILE = `${API}/api/v1/admission-profile`;
const fetchMock = vi.fn();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

  methods: [],
  years: [],
  offerings: [],
  documentTypes: [],
  templates: [],
  specialTemplates: [],
};
const adminTemplateCatalog = { templates: [], documentTypes: [] };

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  const parsed = new URL(url);
  return {
    url: parsed,
    method: init?.method ?? "GET",
    body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
  };
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

describe("admission profile catalog API", () => {
  it("loads the catalog for an admission year", async () => {
    fetchMock.mockImplementation(async () => json(catalog));

    await expect(
      getAdmissionProfileCatalog({ admissionYear: "2026" }),
    ).resolves.toEqual(catalog);

    const call = lastCall();
    expect(call.url.pathname).toBe("/api/v1/admission-catalog/profile-catalog");
    expect(call.url.searchParams.get("admission_year")).toBe("2026");
  });

  it("rejects an invalid catalog response", async () => {
    fetchMock.mockImplementation(async () => json({ methods: [] }));

    await expect(getAdmissionProfileCatalog()).rejects.toEqual(
      expect.objectContaining<Partial<AdmissionProfileCatalogApiError>>({
        status: 502,
        code: "INVALID_ADMISSION_CATALOG_RESPONSE",
      }),
    );
  });

  it("maps API errors to the service error type", async () => {
    fetchMock.mockImplementation(async () =>
      json({ error: { code: "REVISION_CONFLICT", message: "stale" } }, 409),
    );

    await expect(getAdmissionProfileCatalog()).rejects.toMatchObject({
      name: "AdmissionProfileCatalogApiError",
      status: 409,
      code: "REVISION_CONFLICT",
    });
  });

  it("lists templates with status and search filters", async () => {
    fetchMock.mockImplementation(async () => json(adminTemplateCatalog));

    await expect(
      listAdmissionProfileTemplates({ status: "Draft", search: "achievement" }),
    ).resolves.toEqual(adminTemplateCatalog);

    const call = lastCall();
    expect(call.url.pathname).toBe(
      "/api/v1/admission-catalog/profile-templates",
    );
    expect(call.url.searchParams.get("status")).toBe("Draft");
    expect(call.url.searchParams.get("search")).toBe("achievement");
  });

  it("runs template CRUD with the record version", async () => {
    fetchMock.mockImplementation(async () => json({ id: "TPL-1" }));
    const data = {
      template_code: "STANDARD",
      template_name: "Hồ sơ tiêu chuẩn",
      template_kind: "standard" as const,
      profile_type: "academic_admission" as const,
      status: "Draft" as const,
      version: 1,
      requirements: [],
    };
    const expectedModified = "2026-09-10 10:00:00";

    await createAdmissionProfileTemplate(data);
    expect(lastCall()).toMatchObject({ method: "POST", body: { data } });
    expect(lastCall().url.pathname).toBe(
      "/api/v1/admission-catalog/profile-templates",
    );

    await updateAdmissionProfileTemplate({
      name: "TPL-1",
      data,
      expectedModified,
    });
    expect(lastCall()).toMatchObject({
      method: "PATCH",
      body: { data, expectedModified },
    });

    await transitionAdmissionProfileTemplate({
      name: "TPL-1",
      status: "Active",
      expectedModified,
    });
    expect(lastCall().url.pathname).toBe(
      "/api/v1/admission-catalog/profile-templates/TPL-1/transition",
    );
    expect(lastCall().body).toEqual({ status: "Active", expectedModified });

    await deleteAdmissionProfileTemplate({ name: "TPL-1", expectedModified });
    expect(lastCall().method).toBe("DELETE");
    expect(lastCall().url.searchParams.get("expectedModified")).toBe(
      expectedModified,
    );
  });

  it("runs document type and admission method CRUD", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.includes("/document-types") && !url.includes("/document-types/")
        ? json({ documentTypes: [] })
        : url.includes("/methods") && !url.includes("/methods/")
          ? json({ methods: [] })
          : json({ deleted: "CAT-1" }),
    );
    const documentType = {
      code: "BIRTH_CERTIFICATE",
      label: "Giấy khai sinh",
      category: "identity",
      description: null,
      conditional_key: null,
      status: "Active" as const,
      is_active: true,
    };
    const method = {
      code: "TRANSCRIPT_REVIEW",
      display_name: "Xét học bạ",
      description: null,
      enabled: true,
      sort_order: 30,
    };
    const expectedModified = "2026-09-11 10:00:00";

    await listAdmissionDocumentTypes({
      search: "birth",
      includeArchived: true,
    });
    expect(lastCall().url.pathname).toBe(
      "/api/v1/admission-catalog/document-types",
    );
    expect(lastCall().url.searchParams.get("include_archived")).toBe("1");

    await createAdmissionDocumentType(documentType);
    expect(lastCall()).toMatchObject({
      method: "POST",
      body: { data: documentType },
    });
    await updateAdmissionDocumentType({
      name: "BIRTH_CERTIFICATE",
      data: documentType,
      expectedModified,
    });
    expect(lastCall().url.pathname).toBe(
      "/api/v1/admission-catalog/document-types/BIRTH_CERTIFICATE",
    );
    expect(lastCall().body).toEqual({ data: documentType, expectedModified });
    await deleteAdmissionDocumentType({ name: "BIRTH_CERTIFICATE" });
    expect(lastCall().method).toBe("DELETE");

    await listAdmissionMethods({
      search: "transcript",
      includeDisabled: false,
    });
    expect(lastCall().url.pathname).toBe("/api/v1/admission-catalog/methods");
    expect(lastCall().url.searchParams.get("include_disabled")).toBe("0");
    await createAdmissionMethod(method);
    expect(lastCall()).toMatchObject({
      method: "POST",
      body: { data: method },
    });
    await updateAdmissionMethod({
      name: "TRANSCRIPT_REVIEW",
      data: method,
      expectedModified,
    });
    expect(lastCall().method).toBe("PATCH");
    await deleteAdmissionMethod({ name: "TRANSCRIPT_REVIEW" });
    expect(lastCall().url.pathname).toBe(
      "/api/v1/admission-catalog/methods/TRANSCRIPT_REVIEW",
    );
  });

  it("creates an application with the selected offering, method and template", async () => {
    fetchMock.mockImplementation(async () => json({ application: "APP-1" }));

    await createAdmissionApplication({
      student: "STU-1",
      values: {
        offering: "OFF-1",
        admission_year: "2026",
        admission_method: "THPT_SCORE",
        profile_template: "STANDARD",
        special_profile_options: ["SCHOLARSHIP"],
        preference_order: 1,
        preference: "Primary",
        status: "Draft",
      },
      expectedRevision: 2,
      idempotencyKey: "student-admission:test",
    });

    const call = lastCall();
    expect(call.url.href).toBe(`${PROFILE}/applications`);
    expect(call.method).toBe("POST");
    expect(call.body).toMatchObject({
      student: "STU-1",
      expectedRevision: 2,
      idempotencyKey: "student-admission:test",
      values: {
        profile_template: "STANDARD",
        special_profile_options: ["SCHOLARSHIP"],
      },
    });
  });

  it("updates the preference on an existing application", async () => {
    fetchMock.mockImplementation(async () =>
      json({ application: "APP-1", preference: "Alternative" }),
    );

    await updateAdmissionApplicationPreference({
      application: "APP-1",
      preference: "Alternative",
    });

    const call = lastCall();
    expect(call.url.href).toBe(`${PROFILE}/applications/APP-1/preference`);
    expect(call.method).toBe("PUT");
    expect(call.body).toEqual({ preference: "Alternative" });
  });

  it("updates the method and profile template on an existing application", async () => {
    fetchMock.mockImplementation(async () => json({ application: "APP-1" }));
    const values = {
      admission_method: "THPT_SCORE",
      profile_template: "SCHOLARSHIP",
      special_profile_options: ["FIRST_GENERATION", "SCHOLARSHIP"],
      preference: "Primary" as const,
    };

    await updateAdmissionApplication({ application: "APP-1", values });

    const call = lastCall();
    expect(call.url.href).toBe(`${PROFILE}/applications/APP-1`);
    expect(call.method).toBe("PUT");
    expect(call.body).toEqual({ values });
  });

  it("uploads a document as multipart form data", async () => {
    fetchMock.mockImplementation(async () =>
      json({ document: { id: "SDOC-1" }, file: { id: "FILE-1" } }),
    );
    const file = new File(["file-content"], "enrollment-form.pdf", {
      type: "application/pdf",
    });

    await uploadStudentAdmissionDocument({
      student: "STU-1",
      profile: "SAP-1",
      application: "APP-1",
      documentType: "DOC-1",
      file,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${PROFILE}/documents`);
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect(
      (init.headers as Record<string, string> | undefined)?.["Content-Type"],
    ).toBeUndefined();
    const form = init.body as FormData;
    expect(form.get("student")).toBe("STU-1");
    expect(form.get("profile")).toBe("SAP-1");
    expect(form.get("document_type")).toBe("DOC-1");
    expect((form.get("file") as File).name).toBe(file.name);
  });

  it("rejects an upload without a file before fetching", async () => {
    await expect(
      uploadStudentAdmissionDocument({
        student: "STU-1",
        profile: "SAP-1",
        documentType: "DOC-1",
        file: undefined as unknown as File,
      }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_FILE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
