import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMajor, listMajorGroups, listMajors, updateMajor } from ".";

describe("major catalog API", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_FRAPPE_URL", "http://frappe:8000");
    vi.restoreAllMocks();
  });

  it("loads paginated Major Groups with backend query names", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            groups: [
              {
                id: "ENGINEERING",
                code: "ENGINEERING",
                name: "Công nghệ",
                enabled: true,
                sortOrder: 0,
              },
            ],
            total: 1,
            start: 0,
            pageLength: 8,
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      listMajorGroups({
        search: "công nghệ",
        includeDisabled: true,
        start: 0,
        pageLength: 8,
      }),
    ).resolves.toMatchObject({ groups: [{ id: "ENGINEERING" }], total: 1 });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.major_catalog.list_major_groups?search=c%C3%B4ng+ngh%E1%BB%87&include_disabled=true&start=0&page_length=8",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("loads child Majors filtered by their parent group", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            majors: [
              {
                id: "Software Engineering",
                name: "Software Engineering",
                majorGroup: "ENGINEERING",
                majorGroupName: "Công nghệ",
                isActive: true,
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(listMajors({ group: "ENGINEERING" })).resolves.toMatchObject({
      majors: [{ majorGroup: "ENGINEERING" }],
    });
  });

  it("sends Major create and stale-update fields through the mutation RPC", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            id: "Software Engineering",
            name: "Software Engineering",
            majorGroup: "ENGINEERING",
            isActive: true,
          },
        }),
        { status: 200 },
      ),
    );

    await createMajor({
      major_name: "Software Engineering",
      major_group: "ENGINEERING",
      is_active: true,
    });
    await updateMajor({
      name: "Software Engineering",
      data: {
        major_name: "Software Engineering",
        major_group: "ENGINEERING",
        is_active: false,
      },
      expectedModified: "2026-09-14 10:00:00",
    });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "http://frappe:8000/api/method/crm.api.major_catalog.create_major",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          data: {
            major_name: "Software Engineering",
            major_group: "ENGINEERING",
            is_active: true,
          },
        }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "http://frappe:8000/api/method/crm.api.major_catalog.update_major",
      expect.objectContaining({
        body: JSON.stringify({
          name: "Software Engineering",
          data: {
            major_name: "Software Engineering",
            major_group: "ENGINEERING",
            is_active: false,
          },
          expected_modified: "2026-09-14 10:00:00",
        }),
      }),
    );
  });
});
