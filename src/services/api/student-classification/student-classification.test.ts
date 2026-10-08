import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addStudentTag,
  getStudentClassifications,
  getStudentTagCatalogue,
  listStudentTagGroups,
  removeStudentTag,
  StudentClassificationApiError,
  updateStudentTag,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const classificationPayload = {
  student: "CRM-STUDENT-1",
  modified: "2026-09-09T10:00:00.000Z",
  admission_stage: "Attempting",
  potential: "high",
  intent: "warm",
  needs: [],
  tags: [{ name: "TAG-ROW-1", tag: "TAG-INTEREST", term: "TAG-INTEREST" }],
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

describe("student classification API contract", () => {
  it("loads every catalogue page, including historical tags, for label lookup", async () => {
    const tag = (name: string, status: string) => ({
      name,
      code: `CODE-${name}`,
      label: `Label ${name}`,
      status,
    });
    fetchMock
      .mockResolvedValueOnce(
        json([
          {
            group_name: "ATTENTION",
            tags: Array.from({ length: 100 }, (_, index) =>
              tag(`TAG-${index}`, "active"),
            ),
          },
        ]),
      )
      .mockResolvedValueOnce(
        json([
          {
            group_name: "ATTENTION",
            tags: [tag("old-tag", "inactive")],
          },
        ]),
      );

    const groups = await getStudentTagCatalogue();

    expect(groups[0].tags).toHaveLength(101);
    expect(groups[0].tags[100].status).toBe("inactive");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      new URL(fetchMock.mock.calls[0]![0]).searchParams.get("status"),
    ).toBe("all");
  });

  it("stops paging when the backend repeats a page", async () => {
    const page = [
      {
        group_name: "ATTENTION",
        tags: Array.from({ length: 100 }, (_, index) => ({
          name: `TAG-${index}`,
          code: `CODE-${index}`,
          label: `Label ${index}`,
        })),
      },
    ];
    fetchMock.mockImplementation(async () => json(page));

    const groups = await getStudentTagCatalogue();

    expect(groups[0].tags).toHaveLength(100);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("surfaces a revision conflict so the UI can reload instead of overwriting", async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          error: {
            code: "REVISION_CONFLICT",
            message: "Student changed; reload before retrying.",
          },
        },
        409,
      ),
    );

    await expect(
      addStudentTag({
        studentId: "STU-1",
        tag: "TAG-1",
        expectedModified: "old",
      }),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT", status: 409 });
  });

  it("loads student tags and the optimistic-concurrency version", async () => {
    fetchMock.mockResolvedValue(json(classificationPayload));

    const result = await getStudentClassifications("CRM-STUDENT-1");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/students/CRM-STUDENT-1/classifications`,
    );
    expect(result).toMatchObject({
      student: "CRM-STUDENT-1",
      modified: "2026-09-09T10:00:00.000Z",
      tags: [{ tag: "TAG-INTEREST" }],
    });
  });

  it("rejects a classification response without a version", async () => {
    fetchMock.mockResolvedValue(json({ student: "CRM-STUDENT-1" }));

    await expect(getStudentClassifications("CRM-STUDENT-1")).rejects.toEqual(
      expect.objectContaining<Partial<StudentClassificationApiError>>({
        status: 502,
        code: "INVALID_STUDENT_CLASSIFICATIONS_RESPONSE",
      }),
    );
  });

  it("loads active tag groups", async () => {
    fetchMock.mockResolvedValue(
      json([
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
      ]),
    );

    const result = await listStudentTagGroups({ start: 0, pageLength: 100 });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toMatch(/tag-groups$/);
    expect(url.searchParams.get("status")).toBe("active");
    expect(url.searchParams.get("page_length")).toBe("100");
    expect(result[0]?.tags[0]).toMatchObject({
      name: "TAG-INTEREST",
      label: "Quan tâm ngành",
    });
  });

  it("posts the add-tag command with the modified token", async () => {
    fetchMock.mockResolvedValue(json(classificationPayload));

    await addStudentTag({
      studentId: "CRM-STUDENT-1",
      tag: "TAG-NEW",
      expectedModified: "2026-09-09T10:00:00.000Z",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/students/CRM-STUDENT-1/tags`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      tag: "TAG-NEW",
      expectedModified: "2026-09-09T10:00:00.000Z",
    });
  });

  it("deletes a tag with the modified token", async () => {
    fetchMock.mockResolvedValue(json(classificationPayload));

    await removeStudentTag({
      studentId: "CRM-STUDENT-1",
      tag: "TAG-OLD",
      expectedModified: "2026-09-09T10:00:00.000Z",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("DELETE");
    expect(new URL(url).pathname).toBe(
      "/api/v1/students/CRM-STUDENT-1/tags/TAG-OLD",
    );
    expect(new URL(url).searchParams.get("expectedModified")).toBe(
      "2026-09-09T10:00:00.000Z",
    );
  });

  it("replaces a tag in a single request", async () => {
    fetchMock.mockResolvedValue(json(classificationPayload));

    await updateStudentTag({
      studentId: "CRM-STUDENT-1",
      tag: "TAG-OLD",
      newTag: "TAG-NEW",
      expectedModified: "2026-09-09T10:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/students/CRM-STUDENT-1/tags/TAG-OLD`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      newTagId: "TAG-NEW",
      expectedModified: "2026-09-09T10:00:00.000Z",
    });
  });

  it("rejects a command without a modified token before fetching", async () => {
    await expect(
      addStudentTag({
        studentId: "CRM-STUDENT-1",
        tag: "TAG-NEW",
        expectedModified: "",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentClassificationApiError>>({
        status: 400,
        code: "INVALID_MODIFIED",
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
