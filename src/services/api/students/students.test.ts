import { afterEach, describe, expect, it, vi } from "vitest";

import {
  computeDirectorStudents,
  computeStudent360,
  DirectorStudentsApiError,
  getDirectorStudents,
  getStudent360,
} from "./index";

afterEach(() => vi.restoreAllMocks());

describe("director students API contract", () => {
  it("computes full students list when offline", async () => {
    const result = await getDirectorStudents({ admissionYear: 2026, page: 1, pageSize: 20 });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.summary.trackedStudents).toBeGreaterThan(0);
    expect(result.meta.page).toBe(1);
  });

  it("calls Frappe students endpoint with query parameters and parses envelope", async () => {
    const mockData = computeDirectorStudents({ admissionYear: 2026 });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: mockData }), { status: 200 }),
    );

    const result = await getDirectorStudents(
      { admissionYear: 2026, page: 1, pageSize: 10, q: "nguyen", stage: "Tư vấn" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_students.get_director_students?admissionYear=2026&page=1&pageSize=10&q=nguyen&stage=T%C6%B0+v%E1%BA%A5n",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(result.data.length).toBe(mockData.data.length);
    expect(result.meta.total).toBe(mockData.meta.total);
  });

  it("throws DirectorStudentsApiError on authorization failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "FORBIDDEN", message: "Không có quyền truy cập." } }),
        { status: 403 },
      ),
    );

    await expect(
      getDirectorStudents({ admissionYear: 2026 }, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("rejects invalid students envelope with 502", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { data: "not-an-array" } }), { status: 200 }),
    );

    await expect(
      getDirectorStudents({ admissionYear: 2026 }, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 502,
        code: "INVALID_STUDENTS_RESPONSE",
      }),
    );
  });

  it("calls Frappe get_director_student and maps 404 to null", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "STUDENT_NOT_FOUND", message: "Không tìm thấy hồ sơ." } }),
        { status: 404 },
      ),
    );

    const result = await getStudent360("non-existent-student", { baseUrl: "http://frappe:8000" });

    expect(result).toBeNull();
  });

  it("calls Frappe get_director_student successfully with valid payload", async () => {
    const mockStudent = computeStudent360("nguyen-minh-an");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: mockStudent }), { status: 200 }),
    );

    const result = await getStudent360("nguyen-minh-an", { baseUrl: "http://frappe:8000" });

    expect(result).not.toBeNull();
    expect(result?.student.name).toBe("Nguyễn Minh An");
  });

  it("rejects invalid student 360 envelope with 502", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { student: { name: 123 } } }), { status: 200 }),
    );

    await expect(
      getStudent360("nguyen-minh-an", { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 502,
        code: "INVALID_STUDENT_RESPONSE",
      }),
    );
  });
});
