import { beforeEach, describe, expect, it, vi } from "vitest";

import { listScoreSignals } from "./admin-catalog";

describe("admin catalog score signal API", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_FRAPPE_URL", "http://frappe:8000");
    vi.restoreAllMocks();
  });

  it("loads searchable score signals with active-only filtering", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            signals: [
              {
                name: "GRADE_12_GPA",
                signal_key: "GRADE_12_GPA",
                label: "Điểm TB lớp 12",
                category: "Fit",
                signal_type: "property",
                is_active: 1,
              },
            ],
            total: 1,
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      listScoreSignals({
        search: "gpa",
        activeOnly: true,
        start: 0,
        pageLength: 25,
      }),
    ).resolves.toMatchObject({
      signals: [{ name: "GRADE_12_GPA", is_active: true }],
      total: 1,
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.admin_catalog.list_score_signals?search=gpa&start=0&page_length=25&active_only=true",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
