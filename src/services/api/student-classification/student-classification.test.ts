import { afterEach, describe, expect, it, vi } from "vitest";

import {
  addStudentTag,
  getStudentClassifications,
  getStudentTagCatalogue,
  listStudentTagGroups,
  removeStudentTag,
  StudentClassificationApiError,
  updateStudentTag,
} from "./index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const classificationPayload = {
  message: {
    student: "CRM-STUDENT-1",
    modified: "2026-09-09 10:00:00.000000",
    admission_stage: "Attempting",
    potential: "high",
    intent: "warm",
    needs: [],
    tags: [{ name: "TAG-ROW-1", tag: "TAG-INTEREST", term: "TAG-INTEREST" }],
  },
};

describe("student classification API contract", () => {
  it("loads every catalogue page, including historical tags, for label lookup", async () => {
    vi.stubEnv("NEXT_PUBLIC_FRAPPE_URL", "http://frappe:8000");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: [
              {
                group_name: "ATTENTION",
                tags: Array.from({ length: 100 }, (_, index) => ({
                  name: `TAG-${index}`,
                  code: `CODE-${index}`,
                  label: `Label ${index}`,
                  status: "active",
                })),
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: [
              {
                group_name: "ATTENTION",
                tags: [
                  {
                    name: "old-tag",
                    code: "SPECIAL_ATTENTION",
                    label: "Special Attention",
                    status: "inactive",
                  },
                ],
              },
            ],
          }),
        ),
      );
    const groups = await getStudentTagCatalogue();
    expect(groups[0].tags).toHaveLength(101);
    expect(groups[0].tags[100].status).toBe("inactive");
    expect(String(fetchSpy.mock.calls[1][0])).toContain(
      "status=&start=100&page_length=100",
    );
  });

  it("recognizes Frappe revision conflicts so the UI can reload instead of overwriting", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          exception:
            "frappe.exceptions.ValidationError: REVISION_CONFLICT: Student changed; reload before retrying.",
        }),
        { status: 417 },
      ),
    );
    await expect(
      addStudentTag(
        { studentId: "STU-1", tag: "TAG-1", expectedModified: "old" },
        { baseUrl: "http://frappe:8000" },
      ),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT", status: 417 });
  });
  it("loads student tags and the optimistic-concurrency version", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(classificationPayload), { status: 200 }),
    );

    const result = await getStudentClassifications("CRM-STUDENT-1", {
      baseUrl: "http://frappe:8000",
    });

    expect(result).toMatchObject({
      student: "CRM-STUDENT-1",
      modified: "2026-09-09 10:00:00.000000",
      tags: [{ tag: "TAG-INTEREST" }],
    });
  });

  it("loads tag groups with the backend pagination contract", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: [
            {
              group_name: "Mối quan tâm",
              tags: [
                {
                  name: "TAG-INTEREST",
                  code: "interest",
                  label: "Quan tâm ngành",
                  group_name: "Mối quan tâm",
                  status: "active",
                },
              ],
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await listStudentTagGroups(
      { start: 0, pageLength: 100 },
      { baseUrl: "http://frappe:8000" },
    );

    expect(result[0]?.tags[0]).toMatchObject({
      name: "TAG-INTEREST",
      label: "Quan tâm ngành",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.student_classification.list_tag_groups?status=active&start=0&page_length=100",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
  });

  it.each([
    [addStudentTag, "add_student_tag", { tag: "TAG-NEW" }],
    [removeStudentTag, "remove_student_tag", { tag: "TAG-OLD" }],
  ])(
    "posts the %s student tag command with modified",
    async (mutation, method, extra) => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(JSON.stringify(classificationPayload), { status: 200 }),
        );

      await mutation(
        {
          studentId: "CRM-STUDENT-1",
          expectedModified: "2026-09-09 10:00:00.000000",
          ...extra,
        },
        { baseUrl: "http://frappe:8000" },
      );

      const [url, init] = fetchSpy.mock.calls[0] ?? [];
      expect(url).toBe(
        `http://frappe:8000/api/method/crm.api.student_classification.${method}`,
      );
      expect(JSON.parse(String(init?.body))).toMatchObject({
        student: "CRM-STUDENT-1",
        expected_modified: "2026-09-09 10:00:00.000000",
        tag: extra.tag,
      });
    },
  );

  it("posts a replacement tag with new_tag", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(classificationPayload), { status: 200 }),
      );

    await updateStudentTag(
      {
        studentId: "CRM-STUDENT-1",
        tag: "TAG-OLD",
        newTag: "TAG-NEW",
        expectedModified: "2026-09-09 10:00:00.000000",
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body))).toMatchObject(
      {
        student: "CRM-STUDENT-1",
        tag: "TAG-OLD",
        new_tag: "TAG-NEW",
      },
    );
  });

  it("rejects a command without a modified token before fetching", async () => {
    await expect(
      addStudentTag(
        { studentId: "CRM-STUDENT-1", tag: "TAG-NEW", expectedModified: "" },
        { baseUrl: "http://frappe:8000" },
      ),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentClassificationApiError>>({
        status: 400,
        code: "INVALID_MODIFIED",
      }),
    );
  });
});
