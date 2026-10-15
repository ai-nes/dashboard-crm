import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HighSchoolMarkerLayer from "./high-school-marker-layer";
import { getSchoolMapCoverage } from "./school-map-coverage";
import type { ProvinceMetrics } from "./types";

const mapGeometry: import("./types").ProvinceFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { code: "79", name: "Test province" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [106, 10],
              [107, 10],
              [107, 11],
              [106, 11],
              [106, 10],
            ],
          ],
        ],
      },
    },
  ],
};

const province: ProvinceMetrics = {
  code: "79",
  name: "TP. Hồ Chí Minh",
  regionKey: "south",
  schoolCount: 2,
  opportunity: null,
  leads: null,
  conversion: null,
  competition: null,
  revenue: null,
  grade12Population: null,
  penetrationRate: null,
  trend: null,
  recommendation: null,
  keyAction: null,
  highSchools: [
    {
      id: "school-located",
      directoryId: "school-located",
      name: "THPT Có tọa độ",
      district: "Quận 1",
      coordinates: { latitude: 10.1, longitude: 106.2 },
      tier: null,
      potentialScore: null,
      grade12Students: null,
      prospects: null,
      penetrationRate: null,
      applications: null,
      enrollmentForecast: null,
      conversionRate: null,
      lastActivity: null,
      recommendation: null,
      nextAction: null,
      classification: null,
      participations: [],
    },
    {
      id: "school-unlocated",
      directoryId: "school-unlocated",
      name: "THPT Chưa có tọa độ",
      district: "Quận 2",
      coordinates: null,
      tier: null,
      potentialScore: null,
      grade12Students: null,
      prospects: null,
      penetrationRate: null,
      applications: null,
      enrollmentForecast: null,
      conversionRate: null,
      lastActivity: null,
      recommendation: null,
      nextAction: null,
      classification: null,
      participations: [],
    },
    {
      id: "school-without-directory-id",
      directoryId: null,
      name: "THPT Thiếu mã tra cứu",
      district: "Quận 3",
      coordinates: { latitude: 10.2, longitude: 106.3 },
      tier: null,
      potentialScore: null,
      grade12Students: null,
      prospects: null,
      penetrationRate: null,
      applications: null,
      enrollmentForecast: null,
      conversionRate: null,
      lastActivity: null,
      recommendation: null,
      nextAction: null,
      classification: null,
      participations: [],
    },
  ],
};

describe("high school map markers", () => {
  it("plots only schools with source coordinates", () => {
    const markup = renderToStaticMarkup(
      <svg>
        <HighSchoolMarkerLayer
          onSelectSchool={() => undefined}
          projectPoint={([longitude, latitude]) => [longitude, latitude]}
          schools={
            getSchoolMapCoverage([province], "all", mapGeometry).locatedSchools
          }
          selectedProvinceCode={null}
          selectedSchoolId={null}
        />
      </svg>,
    );

    expect(markup).toContain("THPT Có tọa độ");
    expect(markup).not.toContain("THPT Chưa có tọa độ");
    expect(markup).toContain("Chưa phân loại");
    expect(markup).toContain('fill="var(--card-background)"');
    expect(markup).toContain('stroke="var(--icon-tertiary)"');
  });

  it("keeps located schools without a directory ID visible but not actionable", () => {
    const markup = renderToStaticMarkup(
      <svg>
        <HighSchoolMarkerLayer
          onSelectSchool={() => undefined}
          projectPoint={([longitude, latitude]) => [longitude, latitude]}
          schools={
            getSchoolMapCoverage([province], "all", mapGeometry).locatedSchools
          }
          selectedProvinceCode={null}
          selectedSchoolId={null}
        />
      </svg>,
    );

    expect(markup).toContain("THPT Thiếu mã tra cứu");
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain('tabindex="-1"');
    expect(markup).toContain("Không thể mở chi tiết: thiếu mã tra cứu trường");
  });
});
