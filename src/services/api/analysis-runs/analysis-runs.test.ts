import { describe, expect, it } from "vitest";

import { normalizeAnalysisRun } from "./index";

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
});
