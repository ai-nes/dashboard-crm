import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMajor,
  listMajorGroups,
  listMajors,
  MajorCatalogApiError,
  updateMajor,
} from ".";

const API = "http://localhost:3001";
const fetchMock = vi.fn();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("major catalog API", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("loads paginated major groups with the API query names", async () => {
    fetchMock.mockImplementation(async () =>
      json({
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
      }),
    );

    await expect(
      listMajorGroups({
        search: "công nghệ",
        includeDisabled: true,
        start: 0,
        pageLength: 8,
      }),
    ).resolves.toMatchObject({ groups: [{ id: "ENGINEERING" }], total: 1 });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/major-catalog/groups");
    expect(url.searchParams.get("search")).toBe("công nghệ");
    expect(url.searchParams.get("includeDisabled")).toBe("true");
    expect(url.searchParams.get("pageLength")).toBe("8");
  });

  it("loads child majors filtered by their parent group", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        majors: [
          {
            id: "Software Engineering",
            name: "Software Engineering",
            majorGroup: "ENGINEERING",
            isActive: true,
          },
        ],
      }),
    );

    await expect(listMajors({ group: "ENGINEERING" })).resolves.toMatchObject({
      majors: [{ majorGroup: "ENGINEERING" }],
    });
    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/major-catalog/majors");
    expect(url.searchParams.get("group")).toBe("ENGINEERING");
  });

  it("rejects a response without the expected list", async () => {
    fetchMock.mockImplementation(async () => json({}));

    await expect(listMajors()).rejects.toMatchObject({
      status: 502,
      code: "INVALID_MAJOR_RESPONSE",
    });
  });

  it("sends major create and stale-update fields", async () => {
    fetchMock.mockImplementation(async () =>
      json({ id: "Software Engineering", isActive: true }),
    );
    const data = {
      major_name: "Software Engineering",
      major_group: "ENGINEERING",
      is_active: false,
    };

    await createMajor(data);
    await updateMajor({
      name: "Software Engineering",
      data,
      expectedModified: "2026-09-14 10:00:00",
    });

    const [createUrl, createInit] = fetchMock.mock.calls[0]!;
    expect(createUrl).toBe(`${API}/api/v1/major-catalog/majors`);
    expect(createInit.method).toBe("POST");
    expect(JSON.parse(createInit.body)).toEqual(data);
    const [updateUrl, updateInit] = fetchMock.mock.calls[1]!;
    expect(updateUrl).toBe(
      `${API}/api/v1/major-catalog/majors/Software%20Engineering`,
    );
    expect(updateInit.method).toBe("PATCH");
    expect(JSON.parse(updateInit.body)).toEqual({
      data,
      expectedModified: "2026-09-14 10:00:00",
    });
  });

  it("maps API errors to the service error type", async () => {
    fetchMock.mockImplementation(async () =>
      json({ error: { code: "REVISION_CONFLICT", message: "stale" } }, 409),
    );

    await expect(listMajors()).rejects.toBeInstanceOf(MajorCatalogApiError);
  });
});
