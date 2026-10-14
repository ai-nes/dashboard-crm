import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AllSchoolsInspector from "./all-schools-inspector";
import ProvinceInspector from "./province-inspector";
import type { ProvinceMetrics } from "./types";

const province: ProvinceMetrics = {
  code: "79",
  name: "TP. Hồ Chí Minh",
  regionKey: "south",
  schoolCount: 1,
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
      id: "fallback-school-id",
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

describe("school detail navigation without a source directory ID", () => {
  it("keeps the all-schools row visible and disables its detail action", () => {
    const markup = renderToStaticMarkup(
      <AllSchoolsInspector
        onSelectSchool={() => undefined}
        onSchoolQueryChange={() => undefined}
        provinces={[province]}
        schoolQuery=""
      />,
    );

    expect(markup).toContain("THPT Thiếu mã tra cứu");
    expect(markup).toContain(
      "1 thị trường trọng điểm · 1 trường trong danh sách",
    );
    expect(markup).toContain('disabled=""');
    expect(markup).toContain("Không có mã tra cứu");
  });

  it("keeps the selected-province row visible and disables its detail action", () => {
    const markup = renderToStaticMarkup(
      <ProvinceInspector
        onSelectSchool={() => undefined}
        province={province}
      />,
    );

    expect(markup).toContain("THPT Thiếu mã tra cứu");
    expect(markup).toContain('disabled=""');
    expect(markup).toContain("Không có mã tra cứu");
  });
});
