import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAnalysisRun,
  normalizeAnalysisRun,
  requestAnalysisRun,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("analysis run API contract", () => {
  it("renders visible claims from the compact wire schema", () => {
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

  it("normalizes stage statuses before the UI maps them to display states", () => {
    const result = normalizeAnalysisRun(
      {
        message: {
          run_id: "run-status-case",
          status: "RUNNING",
          stages: [
            {
              stage_kind: "student_360",
              status: "ABSTAINED",
              claims: [],
            },
          ],
        },
      },
      "student",
    );

    expect(result.status).toBe("running");
    expect(result.stages[0]?.status).toBe("abstained");
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
                  {
                    action: "Xác minh đầu mối liên hệ.",
                    next_step: "Gọi cho hiệu phó.",
                  },
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
    expect(report?.risks[0]).toMatchObject({
      kind: "risk",
      headline: "Chuyển đổi chững lại",
    });
    expect(report?.recommendations[0]).toMatchObject({
      kind: "recommendation",
    });
    expect(report?.recommendations.at(-1)).toMatchObject({
      kind: "opportunity",
    });
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

  const schoolRun = {
    run_id: "run-school-1",
    run_kind: "school",
    status: "completed",
    terminal_reason: null,
    source_digest: "digest-1",
    reused_existing_run: false,
    stages: [
      {
        name: "stage-1",
        stage_kind: "school_360",
        status: "completed",
        claims: [],
        report: {
          title: "Trường tiềm năng cao",
          summary: "Trường cần bổ sung dữ liệu nền.",
          risks: [
            {
              kind: "risk",
              headline: "Chuyển đổi chững lại",
              detail: "Hồ sơ dừng ở bước tương tác.",
              confidence: 0.8,
              provenance_ids: ["school:237-82"],
            },
          ],
          recommendations: [],
          missing_evidence: ["Mối quan hệ liên kết"],
        },
        terminal_reason: null,
      },
    ],
  };

  it("starts a school analysis through the Nest endpoint", async () => {
    fetchMock.mockResolvedValue(json(schoolRun, 202));

    const result = await requestAnalysisRun({
      kind: "school",
      highSchool: "237-82",
      admissionYear: 2026,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/director/schools/237-82/ai-analysis`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ admissionYear: 2026 });
    expect(result).toMatchObject({
      runId: "run-school-1",
      runKind: "school",
      status: "completed",
      reusedExistingRun: false,
    });
    expect(result.stages[0]).toMatchObject({
      stageKind: "school_360",
      report: { summary: "Trường cần bổ sung dữ liệu nền." },
    });
  });

  it("keeps a failed run retryable with its terminal reason", async () => {
    fetchMock.mockResolvedValue(
      json({
        ...schoolRun,
        status: "failed",
        terminal_reason: "model_unavailable",
        stages: [
          {
            stage_kind: "school_360",
            status: "failed",
            terminal_reason: "model_unavailable",
            claims: [],
          },
        ],
      }),
    );

    const result = await requestAnalysisRun({
      kind: "school",
      highSchool: "237-82",
    });

    expect(result.status).toBe("failed");
    expect(result.terminalReason).toBe("model_unavailable");
    expect(result.stages[0]?.terminalReason).toBe("model_unavailable");
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({});
  });

  it("requires a school before calling the API", async () => {
    await expect(
      requestAnalysisRun({ kind: "school", highSchool: " " }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_SCHOOL" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps API errors to an analysis run error", async () => {
    fetchMock.mockResolvedValue(
      json(
        { error: { code: "RATE_LIMITED", message: "Quá nhiều yêu cầu." } },
        429,
      ),
    );

    await expect(
      requestAnalysisRun({ kind: "school", highSchool: "237-82" }),
    ).rejects.toMatchObject({
      name: "AnalysisRunApiError",
      status: 429,
      code: "RATE_LIMITED",
    });
  });

  it("rejects a response without a run", async () => {
    fetchMock.mockResolvedValue(json({ status: "queued" }, 202));

    await expect(
      requestAnalysisRun({ kind: "school", highSchool: "237-82" }),
    ).rejects.toMatchObject({
      status: 502,
      code: "INVALID_ANALYSIS_RUN_RESPONSE",
    });
  });

  it("reads a settled run by id", async () => {
    fetchMock.mockResolvedValue(json(schoolRun));

    const result = await getAnalysisRun("run-school-1");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/ai/analysis-runs/run-school-1`,
    );
    expect(result.runId).toBe("run-school-1");
    expect(result.stages[0]?.report?.missingEvidence).toEqual([
      "Mối quan hệ liên kết",
    ]);
  });

  it("reports a missing run", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "NOT_FOUND", message: "Không tìm thấy." } }, 404),
    );

    await expect(getAnalysisRun("missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
  });
});
