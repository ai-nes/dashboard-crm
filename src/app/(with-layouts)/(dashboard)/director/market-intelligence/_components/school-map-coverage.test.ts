import { describe, expect, it } from "vitest";
import { getSchoolMapCoverage } from "./school-map-coverage";
import type { HighSchoolItem, ProvinceMetrics } from "./types";

const province: ProvinceMetrics = {
  code: "79",
  name: "TP. Hồ Chí Minh",
  regionKey: "south",
  schoolCount: 3,
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
      id: "located",
      name: "THPT Có tọa độ",
      coordinates: { latitude: 10.1, longitude: 106.2 },
    } as HighSchoolItem,
    {
      id: "missing",
      name: "THPT Chưa có tọa độ",
      coordinates: null,
    } as HighSchoolItem,
    {
      id: "outside-map",
      name: "THPT Ngoài bản đồ",
      coordinates: { latitude: 0, longitude: 0 },
    } as HighSchoolItem,
  ],
};

describe("school map coverage", () => {
  it("counts all matching schools while returning only source coordinates inside the map", () => {
    expect(getSchoolMapCoverage([province], "south")).toMatchObject({
      matchingSchoolCount: 3,
      locatedSchoolCount: 1,
      unlocatedSchoolCount: 2,
      locatedSchools: [
        {
          provinceCode: "79",
          school: { id: "located" },
          coordinates: [106.2, 10.1],
        },
      ],
    });
  });

  it("excludes schools outside the active region from map counts", () => {
    expect(getSchoolMapCoverage([province], "north")).toMatchObject({
      matchingSchoolCount: 0,
      locatedSchoolCount: 0,
      unlocatedSchoolCount: 0,
      locatedSchools: [],
    });
  });
});
