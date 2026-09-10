import { describe, expect, it, vi } from "vitest";

import {
  createAdmissionApplication,
  getAdmissionProfileCatalog,
  AdmissionProfileCatalogApiError,
  uploadStudentAdmissionDocument,
  updateAdmissionApplication,
  updateAdmissionApplicationPreference,
} from ".";

const catalog = {
  methods: [],
  years: [],
  offerings: [],
  documentTypes: [],
  templates: [],
};

describe("admission profile catalog API", () => {
  it("loads the catalog through the Frappe method endpoint", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ message: catalog }), { status: 200 }),
      );

    await expect(
      getAdmissionProfileCatalog({
        baseUrl: "http://frappe:8000",
        admissionYear: "2026",
      }),
    ).resolves.toEqual(catalog);

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.admission_profile_templates.get_admission_profile_catalog?admission_year=2026",
      expect.objectContaining({ cache: "no-store", credentials: "include" }),
    );
  });

  it("rejects an invalid catalog response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { methods: [] } }), {
        status: 200,
      }),
    );

    await expect(
      getAdmissionProfileCatalog({ baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<AdmissionProfileCatalogApiError>>({
        status: 502,
        code: "INVALID_ADMISSION_CATALOG_RESPONSE",
      }),
    );
  });

  it("creates an application with the selected offering, method and template", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { application: "APP-1" } }), {
        status: 200,
      }),
    );

    await createAdmissionApplication(
      {
        student: "STU-1",
        values: {
          offering: "OFF-1",
          admission_year: "2026",
          admission_method: "THPT_SCORE",
          profile_template: "STANDARD",
          preference_order: 1,
          preference: "Primary",
          status: "Draft",
        },
        expectedRevision: 2,
        idempotencyKey: "student-admission:test",
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.admission_application.create_application",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"profile_template":"STANDARD"'),
      }),
    );
  });

  it("updates the preference on an existing admission application", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            application: "APP-1",
            student: "STU-1",
            preference: "Alternative",
            preference_order: 2,
          },
        }),
        { status: 200 },
      ),
    );

    await updateAdmissionApplicationPreference(
      { application: "APP-1", preference: "Alternative" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.admission_application.update_preference",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          application: "APP-1",
          preference: "Alternative",
        }),
      }),
    );
  });

  it("updates the admission method and profile template on an existing application", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            application: "APP-1",
            student: "STU-1",
            admission_method: "THPT_SCORE",
            profile_template: "SCHOLARSHIP",
          },
        }),
        { status: 200 },
      ),
    );

    await updateAdmissionApplication(
      {
        application: "APP-1",
        values: {
          admission_method: "THPT_SCORE",
          profile_template: "SCHOLARSHIP",
          preference: "Primary",
        },
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.admission_application.update_application",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          application: "APP-1",
          values: {
            admission_method: "THPT_SCORE",
            profile_template: "SCHOLARSHIP",
            preference: "Primary",
          },
        }),
      }),
    );
  });

  it("uploads a document as multipart form data", async () => {
    vi.clearAllMocks();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            document: { id: "SDOC-1" },
            file: { id: "FILE-1" },
          },
        }),
        { status: 200 },
      ),
    );
    const file = new File(["file-content"], "enrollment-form.pdf", {
      type: "application/pdf",
    });

    await uploadStudentAdmissionDocument(
      {
        student: "STU-1",
        profile: "SAP-1",
        application: "APP-1",
        documentType: "DOC-1",
        file,
      },
      { baseUrl: "http://frappe:8000" },
    );

    const [url, request] = fetchSpy.mock.calls[0] || [];
    expect(url).toBe(
      "http://frappe:8000/api/method/crm.api.student_documents.upload_document",
    );
    expect(request?.method).toBe("POST");
    expect(request?.body).toBeInstanceOf(FormData);
    expect(
      (request?.headers as Record<string, string>)?.["Content-Type"],
    ).toBeUndefined();
    const form = request?.body as FormData;
    expect(form.get("student")).toBe("STU-1");
    expect(form.get("profile")).toBe("SAP-1");
    expect(form.get("document_type")).toBe("DOC-1");
    expect(form.get("file")).toBeInstanceOf(File);
    expect((form.get("file") as File).name).toBe(file.name);
  });
});
