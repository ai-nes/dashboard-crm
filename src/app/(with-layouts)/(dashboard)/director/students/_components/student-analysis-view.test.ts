import { describe, expect, it } from "vitest";
import {
  buildAnalysisDimensions,
  getInitialAnalysisDimension,
  radarSegments,
} from "./student-analysis-view";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import StudentAnalysisRadarShape from "./student-analysis-radar-shape";
import StudentAnalysisRadar from "./student-analysis-radar";

describe("student analysis view model", () => {
  it("fills adjacent known radar sectors while leaving a missing axis unfilled", () => {
    const html = renderToStaticMarkup(
      createElement(StudentAnalysisRadarShape, {
        points: [
          {
            x: 50,
            y: 10,
            cx: 50,
            cy: 50,
            value: 100,
            payload: { code: "interest" },
          },
          {
            x: 90,
            y: 50,
            cx: 50,
            cy: 50,
            value: 100,
            payload: { code: "fit" },
          },
          {
            x: 50,
            y: 90,
            cx: 50,
            cy: 50,
            value: null,
            payload: { code: "barrier" },
          },
          {
            x: 10,
            y: 50,
            cx: 50,
            cy: 50,
            value: 50,
            payload: { code: "family" },
          },
        ],
      }),
    );
    expect(html).toContain('data-radar-fill="current"');
    expect(html).toContain('d="M50,50L50,10L90,50Z M50,50L10,50L50,10Z"');
    expect(html).not.toContain("L50,90");
    expect(html).not.toContain('data-dimension-point="barrier"');
  });
  it("explains sparse radar data when known dimensions are both zero", () => {
    const html = renderToStaticMarkup(
      createElement(StudentAnalysisRadar, {
        dimensions: buildAnalysisDimensions([
          { code: "engagement", level: "low", level_source: "ai" },
          { code: "admission", level: "low", level_source: "ai" },
        ]),
        showPrevious: false,
        selectedCode: "engagement",
      }),
    );
    expect(html).toContain("2 chiều ở mức 0 · 4 chiều chưa rõ");
  });
  it("keeps valid previous data visible when all current levels are unknown", () => {
    const html = renderToStaticMarkup(
      createElement(StudentAnalysisRadar, {
        dimensions: buildAnalysisDimensions(),
        previous: buildAnalysisDimensions([
          { code: "interest", level: "high", level_source: "crm" },
        ]),
        showPrevious: true,
        selectedCode: "interest",
        previousAt: "2026-10-12T03:00:00Z",
      }),
    );
    expect(html).toContain('role="img"');
    expect(html).not.toContain("Chưa đủ dữ liệu để vẽ radar");
  });
  it("renders an isolated historical point without joining it through nulls", () => {
    const html = renderToStaticMarkup(
      createElement(StudentAnalysisRadarShape, {
        previous: true,
        points: [
          { x: 10, y: 10, value: 100, payload: { code: "interest" } },
          { x: 0, y: 0, value: null, payload: { code: "fit" } },
          { x: 0, y: 0, value: null, payload: { code: "family" } },
        ],
      }),
    );
    expect(html).toContain('data-previous-dimension-point="interest"');
    expect(html).not.toContain('data-previous-dimension-point="fit"');
    expect(html).not.toContain("<path");
  });
  it("renders a genuine zero point but omits missing radar points and fills", () => {
    const html = renderToStaticMarkup(
      createElement(StudentAnalysisRadarShape, {
        points: [
          { x: 10, y: 10, value: 100, payload: { code: "interest" } },
          { x: 0, y: 0, value: null, payload: { code: "family" } },
          { x: 0, y: 0, value: 0, payload: { code: "barrier" } },
        ],
        selectedCode: "barrier",
      }),
    );
    expect(html).not.toContain("<polygon");
    expect(html).not.toContain('data-dimension-point="family"');
    expect(html).toContain('data-dimension-point="barrier"');
    expect(html).toContain("M0,0L10,10");
  });
  it("keeps six stable axes, zero, unknowns and inverted barriers", () => {
    const items = buildAnalysisDimensions([
      {
        code: "barrier",
        level: "high",
        level_source: "crm",
        readiness_score: 0,
        score_basis: "level",
      },
      { code: "interest", level: "low", level_source: "crm" },
      { code: "fit", level: "high", level_source: "crm" },
    ]);
    expect(items.map((d) => d.code)).toEqual([
      "interest",
      "fit",
      "barrier",
      "family",
      "engagement",
      "admission",
    ]);
    expect(items.map((d) => d.score)).toEqual([0, 100, 0, null, null, null]);
    expect(items[2].label).toBe("Giải quyết rào cản");
    expect(items[2].assessment).toBe("Rào cản lớn");
    expect(getInitialAnalysisDimension(items)).toBe("barrier");
  });
  it("ignores unsupported numeric precision and never scores unknown levels", () => {
    const items = buildAnalysisDimensions([
      {
        code: "interest",
        level: "unknown",
        level_source: "ai",
        readiness_score: 100,
      },
      {
        code: "fit",
        level: "medium",
        level_source: "crm",
        readiness_score: 82,
      },
      { code: "barrier", level: "low", level_source: "crm" },
    ]);
    expect(items.map((d) => d.score)).toEqual([
      null,
      50,
      100,
      null,
      null,
      null,
    ]);
  });
  it("uses actual evidence and missing fields for completeness", () => {
    const items = buildAnalysisDimensions([
      {
        code: "interest",
        level: "high",
        level_source: "crm",
        evidence: [
          { ref: { type: "note", id: "N-1" }, note: "Actual evidence" },
        ],
        missing: ["Transcript"],
      },
    ]);
    expect(items[0].evidenceQuality).toBe("partial");
    expect(items[0].evidence[0].note).toBe("Actual evidence");
    expect(items[1].evidenceQuality).toBe("insufficient");
  });
  it("does not connect radar segments through a missing value plotted at the origin by Recharts", () => {
    const points = [
      { x: 1, y: 1, value: 100 },
      { x: 0, y: 0, value: null },
      { x: 3, y: 3, value: 0 },
    ];
    expect(radarSegments(points)).toEqual(["M3,3L1,1"]);
    expect(radarSegments([{ x: 0, y: 0, value: null }])).toEqual([]);
  });
});
