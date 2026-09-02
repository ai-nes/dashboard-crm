import { afterEach, describe, expect, it, vi } from "vitest";

import { normalizeAnalysisRun, requestAnalysisRun } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("analysis run API contract", () => {
  it("renders Frappe visible claims from its compact wire schema", () => {
    const result = normalizeAnalysisRun(
      {
        message: {
          run_id: "f1dsd4tpuh",
          run_type: "CRM Student Analysis Run",
          status: "completed",
          stages: [
            {
              name: "stage-1",
              stage_kind: "student_360",
              status: "completed",
              claims: [
                {
                  kind: "fact",
                  text: "Hồ sơ đang ở giai đoạn Applicant.",
                  provenance_ids: ["student:ENR-2026-07553"],
                  visibility: "shareable",
                },
              ],
            },
          ],
        },
      },
      "student",
    );

    expect(result.stages[0]?.claims).toEqual([
      {
        claimKind: "fact",
        statement: "Hồ sơ đang ở giai đoạn Applicant.",
        provenanceIds: ["student:ENR-2026-07553"],
        visibilityLabel: "shareable",
        confidence: null,
      },
    ]);
  });

  it("loads the session CSRF token before a browser analysis request", async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("crypto", { randomUUID: () => "request-id" });

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: {
              user: "director@example.com",
              email: "director@example.com",
              full_name: "Director",
              user_image: null,
              roles: ["Admissions Director"],
              crm_profile: "admissions_director",
              crm_role: "Admissions Director",
              crm_capabilities: ["analysis:request"],
              csrf_token: "session-csrf-token",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: {
              run_id: "run-1",
              run_type: "CRM Student Analysis Run",
              status: "queued",
              stages: [{ name: "stage-1", stage_kind: "student_360", status: "queued" }],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await requestAnalysisRun(
      { kind: "student", studentId: "ENR-2026-01395" },
      { baseUrl: "https://crm.faip.pro" },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://crm.faip.pro/api/method/crm.api.session.me",
    );
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      credentials: "include",
      headers: expect.objectContaining({
        "X-Frappe-CSRF-Token": "session-csrf-token",
      }),
    });
  });
});
