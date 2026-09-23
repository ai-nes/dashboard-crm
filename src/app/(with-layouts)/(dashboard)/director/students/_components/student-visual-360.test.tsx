import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { computeStudent360 } from "@/services/api/students";
import type { AnalysisReport } from "@/services/api/analysis-runs";
import StudentVisual360 from "./student-visual-360";
import StudentVisual360Orbit from "./student-visual-360-orbit";
import StudentVisual360Panel from "./student-visual-360-panel";
import { visual360Sections } from "./student-visual-360-sections";

vi.mock("./student-gauge-chart", () => ({
  default: ({ score }: { score: number }) => <span>score:{score}</span>,
}));

const fixture = () => {
  const data = computeStudent360("nguyen-minh-an");
  if (!data) throw new Error("Missing student fixture");
  return data;
};

describe("Visual 360", () => {
  it("does not render student data or controls without read permission", () => {
    expect(
      renderToStaticMarkup(
        <StudentVisual360 canRead={false} data={fixture()} report={null} />,
      ),
    ).toBe("");
  });

  it("renders the five analysis views and an honest empty state for an authorized reader", () => {
    const html = renderToStaticMarkup(
      <StudentVisual360 canRead data={fixture()} report={null} />,
    );
    for (const section of visual360Sections)
      expect(html).toContain(section.label);
    expect(html).toContain("Chưa có phân tích cho hồ sơ này.");
    expect(html).not.toContain("Đang tải phân tích hồ sơ");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-controls=/g)).toHaveLength(5);
  });

  it("identifies the selected orbit node and its linked detail region", () => {
    const html = renderToStaticMarkup(
      <StudentVisual360Orbit
        student={fixture().student}
        selected="challenges"
        onSelect={() => {}}
        panelId="details"
      />,
    );
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(
      /<button[^>]*aria-pressed="true"[^>]*>[\s\S]*?Rào cản tuyển sinh/,
    );
    expect(html.match(/aria-controls="details"/g)).toHaveLength(5);
    expect(html).not.toContain("color-mix(");
    expect(html.match(/fill-badge-primary-background/g)).toHaveLength(1);
    expect(html.match(/fill-background-soft-100/g)).toHaveLength(4);
  });

  it("displays actual analysis content without creating a second report", () => {
    const report: AnalysisReport = {
      summary: "Học sinh cần tư vấn lộ trình ngành học.",
      risks: [],
      recommendations: [],
      advisorySignals: [],
    };
    const html = renderToStaticMarkup(
      <StudentVisual360Panel
        selected="signals"
        data={fixture()}
        report={report}
        isLoading={false}
        hasError={false}
      />,
    );
    expect(html).toContain(report.summary);
    expect(html).not.toContain("Chưa có phân tích");
  });

  it("preserves zero scores and does not manufacture missing scores", () => {
    const data = fixture();
    data.insight.signalScore = 0;
    const props = {
      selected: "potential" as const,
      data,
      report: null,
      isLoading: false,
      hasError: false,
    };
    expect(
      renderToStaticMarkup(<StudentVisual360Panel {...props} />),
    ).toContain("score:0");
    data.insight.signalScore = null;
    data.insight.probability = null;
    expect(
      renderToStaticMarkup(<StudentVisual360Panel {...props} />),
    ).toContain("Chưa có dữ liệu điểm tiềm năng");
  });

  it("distinguishes a loading analysis from unavailable data", () => {
    const props = {
      selected: "signals" as const,
      data: fixture(),
      report: null,
    };
    expect(
      renderToStaticMarkup(
        <StudentVisual360Panel {...props} isLoading hasError={false} />,
      ),
    ).toContain("Đang tải phân tích");
    expect(
      renderToStaticMarkup(
        <StudentVisual360Panel {...props} isLoading={false} hasError />,
      ),
    ).toContain("Chưa tải được báo cáo phân tích");
  });
});
