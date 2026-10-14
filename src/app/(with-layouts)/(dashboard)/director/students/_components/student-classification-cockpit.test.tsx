import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/services/api/auth";
import type { StudentAiOverview } from "@/services/api/student-ai";
import { computeStudent360 } from "@/services/api/students";
import StudentClassificationCockpit from "./student-classification-cockpit";
import StudentAnalysisDimensions from "./student-analysis-dimensions";
import { StudentAnalysisDimensionDialogBody } from "./student-analysis-dimension-dialog";
import StudentInsightCard from "./student-insight-card";
import StudentOverviewScoreCard from "./student-overview-score-card";
import { getDimensionLevelColor } from "./student-analysis-display";

const mocks = vi.hoisted(() => ({
  auth: { user: null as CurrentUser | null, isLoading: false },
  analysis: vi.fn(),
  interactions: vi.fn(),
  nba: vi.fn(),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => mocks.auth,
}));
vi.mock("@/hooks/use-student-ai", () => ({
  useStudentAnalysis: mocks.analysis,
}));
vi.mock("./student-overview-interactions", () => ({
  default: mocks.interactions,
}));
vi.mock("./student-next-best-actions", () => ({ default: mocks.nba }));
vi.mock("./student-gauge-chart", () => ({
  default: ({ score }: { score: number }) => <span>score:{score}</span>,
}));

const permission = (read = true, create = true) => ({
  read,
  create,
  write: false,
  delete: false,
  export: false,
  row_scope: "all",
});
const overview: StudentAiOverview = {
  student_id: "STUDENT-1",
  revision: 1,
  enabled: true,
  state: "idle",
  stale: false,
  labels: {
    dimensions: {},
    status: { progressing: "Đang tiến triển" },
    actions: {},
    needs: {},
    memory_types: {},
  },
  analysis: {
    student_id: "STUDENT-1",
    source_revision: 1,
    generated_at: "2026-10-12T03:00:00Z",
    ai_reused: false,
    insight: {
      insight_card: {
        headline: "Học sinh cần tư vấn học phí.",
        points: ["Gia đình đang cân nhắc."],
        status_label: "progressing",
      },
      dimensions: [
        {
          code: "barrier",
          level: "high",
          level_source: "crm",
          summary: "Gia đình lo học phí.",
          evidence: [
            {
              ref: { type: "interaction", id: "I-1" },
              note: "Phụ huynh hỏi phương án đóng phí.",
            },
          ],
          missing: ["Chưa biết ngân sách gia đình."],
        },
      ],
      positives: [
        {
          text: "Chủ động hỏi học bổng.",
          refs: [{ type: "interaction", id: "I-1" }],
        },
      ],
    },
    nba: {
      run_id: "R-1",
      disposition: "NO_ACTION",
      recheck_at: null,
      items: [],
    },
  },
};
const data = () => {
  const item = computeStudent360("nguyen-minh-an");
  if (!item) throw Error("Missing fixture");
  return item;
};
const render = () =>
  renderToStaticMarkup(
    <StudentClassificationCockpit data={data()} analysisTargetId="STUDENT-1" />,
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.isLoading = false;
  mocks.auth.user = {
    user: "counselor@example.com",
    email: "counselor@example.com",
    full_name: "Counselor",
    user_image: null,
    roles: [],
    crm_profile: null,
    crm_role: null,
    crm_capabilities: ["recommendation.decide"],
    crm_doctype_permissions: {
      "CRM Student": permission(),
      "CRM Recommendation": permission(),
      "CRM Interaction Type": permission(),
    },
  };
  mocks.analysis.mockReturnValue({
    overview,
    run: null,
    request: vi.fn(),
    requestMutation: { error: null },
    query: { error: null, isLoading: false },
    isActive: false,
  });
  mocks.interactions.mockReturnValue(<div>Recent interactions</div>);
  mocks.nba.mockReturnValue(<div>Next best actions</div>);
});
describe("student Insight overview", () => {
  it("keeps the streamlined NBA header before analysis without inner tabs or recent interactions", () => {
    const html = render();
    const sections = [
      "Next best actions",
      "Insight Card",
      "Phân tích 6 chiều",
      "Tín hiệu thuận lợi",
      "Thông tin còn thiếu",
    ];
    let position = -1;
    for (const section of sections) {
      const next = html.indexOf(section);
      expect(next).toBeGreaterThan(position);
      position = next;
    }
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain("Recent interactions");
    expect(html).toContain(overview.analysis!.insight.insight_card.headline);
    expect(html).toContain("Đang tiến triển");
    expect(html).toContain("Chủ động hỏi học bổng.");
    expect(html).toContain("Chưa biết ngân sách gia đình.");
    expect(html).toContain("Xem dẫn chứng Rào cản");
    expect(mocks.nba.mock.calls.at(-1)?.[0].studentId).toBe("STUDENT-1");
  });
  it.each(["create", "capability", "recommendation-read", "loading"])(
    "hides the analysis request without %s",
    (denied) => {
      if (denied === "create")
        mocks.auth.user!.crm_doctype_permissions!["CRM Recommendation"].create =
          false;
      if (denied === "capability") mocks.auth.user!.crm_capabilities = [];
      if (denied === "recommendation-read")
        mocks.auth.user!.crm_doctype_permissions!["CRM Recommendation"].read =
          false;
      if (denied === "loading") mocks.auth.isLoading = true;
      const html = render();
      expect(html).not.toContain("Phân tích lại");
      expect(mocks.analysis.mock.calls.at(-1)?.[1].canRequest).toBe(false);
      if (denied === "recommendation-read" || denied === "loading") {
        expect(html).not.toContain("Học sinh cần tư vấn học phí.");
        expect(html).not.toContain("Xem dẫn chứng");
      }
    },
  );
  it("does not disclose the overview without student read", () => {
    mocks.auth.user!.crm_doctype_permissions!["CRM Student"].read = false;
    expect(render()).toBe("");
  });
  it("hides recent interactions without their read permission", () => {
    mocks.auth.user!.crm_doctype_permissions!["CRM Interaction Type"].read =
      false;
    expect(render()).not.toContain("Recent interactions");
    expect(mocks.interactions).not.toHaveBeenCalled();
  });
  it("retains stored results while analysis is active and disables request", () => {
    mocks.analysis.mockReturnValue({
      ...mocks.analysis.getMockImplementation()!(),
      isActive: true,
    });
    const html = render();
    expect(html).toContain("Học sinh cần tư vấn học phí.");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*?Đang phân tích/);
    expect(mocks.nba.mock.calls.at(-1)?.[0].isAnalysisActive).toBe(true);
  });
  it("renders exactly six dimensions with truthful unknowns and barrier severity", () => {
    const html = renderToStaticMarkup(
      <StudentAnalysisDimensions
        dimensions={overview.analysis!.insight.dimensions}
        canRead
      />,
    );
    for (const label of [
      "Quan tâm",
      "Phù hợp",
      "Rào cản",
      "Gia đình",
      "Tương tác",
      "Xét tuyển",
    ])
      expect(html).toContain(label);
    expect(html.match(/Chưa xác định/g)).toHaveLength(5);
    expect(
      getDimensionLevelColor(overview.analysis!.insight.dimensions[0]),
    ).toBe("warning");
    expect(
      renderToStaticMarkup(
        <StudentAnalysisDimensions
          dimensions={overview.analysis!.insight.dimensions}
          canRead={false}
        />,
      ),
    ).toBe("");
  });
  it("exposes evidence and missing data only to authorized readers", () => {
    const dimension = overview.analysis!.insight.dimensions[0];
    const html = renderToStaticMarkup(
      <StudentAnalysisDimensionDialogBody dimension={dimension} canRead />,
    );
    expect(html).toContain("Phụ huynh hỏi phương án đóng phí.");
    expect(html).toContain("Chưa biết ngân sách gia đình.");
    expect(
      renderToStaticMarkup(
        <StudentAnalysisDimensionDialogBody
          dimension={dimension}
          canRead={false}
        />,
      ),
    ).toBe("");
  });
  it.each(["stale", "failed", "disabled", "empty"] as const)(
    "distinguishes %s analysis state",
    (state) => {
      const value = {
        ...overview,
        stale: state === "stale",
        state: state === "failed" ? ("failed" as const) : ("idle" as const),
        enabled: state !== "disabled",
        analysis: state === "empty" ? null : overview.analysis,
      };
      const html = renderToStaticMarkup(
        <StudentInsightCard
          overview={value}
          canRead
          onAnalyze={() => {}}
          isBusy={false}
          isLoading={false}
          hasError={false}
          hasTarget
        />,
      );
      const messages = {
        stale: "Dữ liệu học sinh đã thay đổi",
        failed: "Chưa tải được phân tích mới nhất",
        disabled: "Dịch vụ phân tích chưa được bật",
        empty: "Chưa có phân tích",
      };
      expect(html).toContain(messages[state]);
      if (state === "disabled") expect(html).toMatch(/<button[^>]*disabled/);
    },
  );
  it("preserves a zero CRM score and never manufactures missing scores", () => {
    const value = data();
    value.insight.signalScore = 0;
    expect(
      renderToStaticMarkup(<StudentOverviewScoreCard data={value} />),
    ).toContain("score:0");
    value.insight.signalScore = null;
    value.insight.probability = null;
    expect(
      renderToStaticMarkup(<StudentOverviewScoreCard data={value} />),
    ).toContain("Chưa có dữ liệu điểm tiềm năng.");
  });
});
