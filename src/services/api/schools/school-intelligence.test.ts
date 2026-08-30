import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DirectorApiError,
  getDirectorSchoolDetail,
  normalizeSchoolIntelligence,
} from "./school-intelligence";

afterEach(() => vi.restoreAllMocks());

describe("school intelligence contract", () => {
  it("normalizes partial data, preserves zero and removes forbidden PII", () => {
    const data = normalizeSchoolIntelligence({
      school: { id: "01-001-062", provinceCode: "01", schoolCode: "062", name: "THPT A" },
      potentialScore: 0,
      grade12Students: null,
      contacts: [
        {
          full_name: "Nguyễn Văn A",
          role: "Ban giám hiệu",
          position: "Phó hiệu trưởng",
          relationship_status: "Active",
          last_touch: "2026-08-01",
          phone: "0900000000",
          email: "secret@example.com",
          name: "INTERNAL-1",
          notes: "private",
        },
      ],
      activities: [
        {
          activity_type: "Career Talk",
          scheduled_at: "2026-08-03T08:00:00+07:00",
          status: "scheduled",
          outcome: "Completed",
          attendance: 0,
          title: "private title",
          owner: "private owner",
        },
      ],
      dataAvailability: { sections: { identity: "available", snapshot: "partial" } },
    });

    expect(data.potentialScore).toBe(0);
    expect(data.grade12Students).toBeNull();
    expect(data.contacts[0]).toEqual({
      fullName: "Nguyễn Văn A",
      role: "Ban giám hiệu",
      position: "Phó hiệu trưởng",
      relationshipStatus: "Active",
      lastTouch: "2026-08-01",
      nextTouch: null,
    });
    expect(JSON.stringify(data)).not.toContain("0900000000");
    expect(JSON.stringify(data)).not.toContain("secret@example.com");
    expect(JSON.stringify(data)).not.toContain("private title");
    expect(data.activities[0].attendance).toBe(0);
  });

  it("keeps empty collections as valid empty states", () => {
    const data = normalizeSchoolIntelligence({
      school: { id: "01-001-062", name: "THPT A" },
      contacts: [],
      activities: [],
      dataAvailability: { sections: { relationship: "available", activities: "available" } },
    });

    expect(data.contacts).toEqual([]);
    expect(data.activities).toEqual([]);
    expect(data.dataAvailability.sections.relationship).toBe("available");
  });

  it("uses the three-part school id, forwards query and maps 404 to null", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "SCHOOL_NOT_FOUND" } }), { status: 404 }),
    );

    await expect(
      getDirectorSchoolDetail("01-001-062", { admissionYear: 2026, baseUrl: "http://frappe:8000" }),
    ).resolves.toBeNull();
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_school_detail.get_director_school_detail?school_id=01-001-062&admissionYear=2026",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("keeps authorization failures explicit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Không có quyền." } }), {
        status: 403,
      }),
    );

    await expect(
      getDirectorSchoolDetail("01-001-062", { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(expect.objectContaining<Partial<DirectorApiError>>({ status: 403, code: "FORBIDDEN" }));
  });

  it("does not treat an unrelated 404 as a missing school", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "METHOD_NOT_FOUND" } }), { status: 404 }),
    );

    await expect(
      getDirectorSchoolDetail("01-001-062", { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(expect.objectContaining<Partial<DirectorApiError>>({ status: 404, code: "METHOD_NOT_FOUND" }));
  });

  it("rejects a successful response with an invalid envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ message: {} }), { status: 200 }));

    await expect(getDirectorSchoolDetail("01-001-062", { baseUrl: "http://frappe:8000" })).rejects.toEqual(
      expect.objectContaining<Partial<DirectorApiError>>({
        status: 502,
        code: "INVALID_SCHOOL_RESPONSE",
      }),
    );
  });

  it("rejects a successful response without the backend school id", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            school: { name: "THPT A" },
            dataAvailability: { sections: {} },
            meta: { admissionYear: 2026 },
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getDirectorSchoolDetail("01-001-062", { baseUrl: "http://frappe:8000" })).rejects.toEqual(
      expect.objectContaining<Partial<DirectorApiError>>({
        status: 502,
        code: "INVALID_SCHOOL_RESPONSE",
      }),
    );
  });
});
