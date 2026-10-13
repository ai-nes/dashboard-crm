import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getActiveProfileOptions,
  getAllProfileOptions,
  saveProfileOptionsOrder,
  listProfileOptions,
  saveProfileOption,
  deleteProfileOption,
} from "./profile-options";

describe("profile catalog API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it("loads every active page rather than silently truncating dropdowns", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:4000");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          data: [{ id: "a", name: "A" }],
          meta: { pagination: { total: 501 } },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          data: [{ id: "b", name: "B" }],
          meta: { pagination: { total: 501 } },
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    expect(await getActiveProfileOptions("nationality")).toHaveLength(2);
    expect(fetcher.mock.calls[1][0]).toContain("page=2");
    expect(fetcher.mock.calls[0][0]).toContain("isActive=true");
  });
  it("loads inactive entries too when ordering the whole category", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:4000");
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        data: [{ id: "inactive", isActive: false }],
        meta: { pagination: { total: 1 } },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    expect(await getAllProfileOptions("religion")).toHaveLength(1);
    expect(fetcher.mock.calls[0][0]).not.toContain("isActive=");
  });
  it("persists dragged positions without changing names or codes", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:4000");
    const fetcher = vi
      .fn()
      .mockImplementation(async () => Response.json({ data: {} }));
    vi.stubGlobal("fetch", fetcher);
    await saveProfileOptionsOrder([{ id: "b" }, { id: "a" }]);
    expect(fetcher.mock.calls.map((call) => JSON.parse(call[1].body))).toEqual([
      { sortOrder: 1 },
      { sortOrder: 2 },
    ]);
    expect(fetcher.mock.calls[0][0]).toContain("/b");
  });
  it("sends CRUD through the existing session transport", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:4000");
    const fetcher = vi.fn().mockImplementation(async () =>
      Response.json({
        data: { id: "new" },
        meta: { pagination: { total: 0 } },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await listProfileOptions({ type: "religion", page: 2, q: "Không" });
    await saveProfileOption({
      type: "religion",
      code: "NONE",
      name: "Không tôn giáo",
      isActive: true,
      sortOrder: 0,
    });
    await saveProfileOption(
      {
        type: "religion",
        code: "NONE",
        name: "Không tôn giáo",
        isActive: false,
        sortOrder: 0,
      },
      "new",
    );
    await deleteProfileOption("new");
    expect(fetcher.mock.calls.map((call) => call[1].method)).toEqual([
      "GET",
      "POST",
      "PATCH",
      "DELETE",
    ]);
    expect(
      fetcher.mock.calls.every((call) => call[1].credentials === "include"),
    ).toBe(true);
  });
});
