import { afterEach, describe, expect, it, vi } from "vitest";

import { normalizeAnalysisRun, requestAnalysisRun } from "./index";

afterEach(() => vi.restoreAllMocks());

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

  it("normalizes the three-block report and folds the legacy envelope", () => {
    const result = normalizeAnalysisRun(
      {
        message: {
          run_id: "run-360",
          run_type: "CRM School Analysis Run",
          status: "completed",
          stages: [
            {
              stage_kind: "school_360",
              status: "completed",
              claims: [],
              report_json: JSON.stringify({
                title: "Trường tiềm năng cao, chuyển đổi đang chững",
                executive_summary: "Trường cần bổ sung dữ liệu nền.",
                risks: [
                  {
                    headline: "Chuyển đổi chững lại",
                    detail: "Hồ sơ dừng ở bước tương tác.",
                    confidence: 0.8,
                    provenance_ids: ["school:237-82"],
                  },
                ],
                recommended_actions: [
                  { action: "Xác minh đầu mối liên hệ.", next_step: "Gọi cho hiệu phó." },
                ],
                opportunities: [{ title: "Tổ chức Parent Session" }],
                missing_evidence: ["Mối quan hệ liên kết"],
              }),
            },
          ],
        },
      },
      "school",
    );

    const report = result.stages[0]?.report;
    expect(report?.summary).toBe("Trường cần bổ sung dữ liệu nền.");
    expect(report?.risks[0]).toMatchObject({ kind: "risk", headline: "Chuyển đổi chững lại" });
    expect(report?.recommendations[0]).toMatchObject({ kind: "recommendation" });
    expect(report?.recommendations.at(-1)).toMatchObject({ kind: "opportunity" });
    expect(report?.missingEvidence).toEqual(["Mối quan hệ liên kết"]);
  });

  it("normalizes visible_claims without hiding the stage response", () => {
    const result = normalizeAnalysisRun(
      {
        message: {
          run_id: "run-visible-claims",
          status: "completed",
          stages: [
            {
              stage_kind: "student_360",
              status: "completed",
              visible_claims: [
                {
                  kind: "inference",
                  text: "Học sinh cần được tư vấn thêm về chi phí.",
                  provenance_ids: ["student:STU-1"],
                  visibility: "shareable",
                },
              ],
            },
          ],
        },
      },
      "student",
    );

    expect(result.stages[0]?.claims).toHaveLength(1);
    expect(result.stages[0]?.claims[0]?.statement).toBe(
      "Học sinh cần được tư vấn thêm về chi phí.",
    );
  });

  it("keeps a completed 360 stage from a partial HTTP 400 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: {
              run_id: "partial-run",
              run_type: "CRM Student Analysis Run",
              status: "abstained",
              stages: [
                {
                  stage_kind: "next_best_action",
                  status: "abstained",
                  claims: [],
                },
                {
                  stage_kind: "student_360",
                  status: "completed",
                  claims: [],
                  report: {
                    summary: "Đã có báo cáo Student 360.",
                  },
                },
              ],
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const result = await requestAnalysisRun({
      kind: "student",
      studentId: "ENR-2026-00299",
    }, { baseUrl: "http://frappe.test" });

    expect(result.runId).toBe("partial-run");
    expect(result.stages[1]?.report?.summary).toBe(
      "Đã có báo cáo Student 360.",
    );
  });
});
