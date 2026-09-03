import { describe, expect, it } from "vitest";

import type { AnalysisRunSnapshot } from "@/services/api/analysis-runs";

import {
  getDeepAnalysisNotice,
  getHighestConfidenceReportItem,
  getRichReport,
} from "./analysis-run-meta";

function stage(
  overrides: Partial<AnalysisRunSnapshot["stages"][number]>,
): AnalysisRunSnapshot["stages"][number] {
  return {
    stageKind: "student_360",
    status: "completed",
    claims: [],
    report: null,
    terminalReason: null,
    policyRevision: null,
    modelRevision: null,
    ...overrides,
  };
}

const report = {
  title: "Hồ sơ giai đoạn Applicant",
  summary: "Tổng quan hồ sơ.",
  risks: [],
  recommendations: [],
};

describe("getDeepAnalysisNotice", () => {
  it("returns a notice when the 360 stage completed but NBA abstained", () => {
    const run = {
      status: "abstained",
      stages: [
        stage({ stageKind: "student_360", status: "completed", report }),
        stage({
          stageKind: "next_best_action",
          status: "abstained",
          terminalReason: "evidence_access_denied",
        }),
      ],
    } as unknown as AnalysisRunSnapshot;

    expect(getDeepAnalysisNotice(run)).toBe(
      "Phân tích chuyên sâu (Hành động tiếp theo) chưa sẵn sàng — quyền truy cập dữ liệu nguồn bị từ chối.",
    );
    // The 360 report is still renderable.
    expect(getRichReport(run.stages)?.title).toBe("Hồ sơ giai đoạn Applicant");
  });

  it("falls back to a generic message for an unknown terminal reason", () => {
    const run = {
      status: "abstained",
      stages: [
        stage({ stageKind: "student_360", status: "completed", report }),
        stage({ stageKind: "next_best_action", status: "abstained", terminalReason: null }),
      ],
    } as unknown as AnalysisRunSnapshot;

    expect(getDeepAnalysisNotice(run)).toBe(
      "Phân tích chuyên sâu (Hành động tiếp theo) chưa sẵn sàng.",
    );
  });

  it("returns null when both stages completed", () => {
    const run = {
      status: "completed",
      stages: [
        stage({ stageKind: "student_360", status: "completed", report }),
        stage({ stageKind: "next_best_action", status: "completed" }),
      ],
    } as unknown as AnalysisRunSnapshot;

    expect(getDeepAnalysisNotice(run)).toBeNull();
  });

  it("returns null when the 360 stage itself did not complete", () => {
    const run = {
      status: "abstained",
      stages: [
        stage({ stageKind: "student_360", status: "abstained" }),
        stage({ stageKind: "next_best_action", status: "abstained", terminalReason: "stage_timeout" }),
      ],
    } as unknown as AnalysisRunSnapshot;

    expect(getDeepAnalysisNotice(run)).toBeNull();
  });

  it("returns null for a school run with no NBA stage", () => {
    const run = {
      status: "abstained",
      stages: [stage({ stageKind: "school_360", status: "completed", report })],
    } as unknown as AnalysisRunSnapshot;

    expect(getDeepAnalysisNotice(run)).toBeNull();
  });
});

describe("getHighestConfidenceReportItem", () => {
  it("selects the report item with the highest confidence", () => {
    const result = getHighestConfidenceReportItem([
      {
        kind: "risk",
        headline: "Độ tin cậy thấp hơn",
        detail: "Chi tiết",
        confidence: 0.72,
        provenanceIds: [],
      },
      {
        kind: "risk",
        headline: "Độ tin cậy cao nhất",
        detail: "Chi tiết",
        confidence: 0.91,
        provenanceIds: [],
      },
    ]);

    expect(result?.headline).toBe("Độ tin cậy cao nhất");
  });

  it("keeps response order when confidence is tied or missing", () => {
    const result = getHighestConfidenceReportItem([
      {
        kind: "opportunity",
        headline: "Cơ hội đầu tiên",
        detail: "Chi tiết",
        confidence: null,
        provenanceIds: [],
      },
      {
        kind: "opportunity",
        headline: "Cơ hội thứ hai",
        detail: "Chi tiết",
        confidence: null,
        provenanceIds: [],
      },
    ]);

    expect(result?.headline).toBe("Cơ hội đầu tiên");
  });
});
