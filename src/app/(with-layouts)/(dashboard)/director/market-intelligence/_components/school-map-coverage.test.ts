import { describe, expect, it } from "vitest";
import { getSchoolMapCoverage } from "./school-map-coverage";
import type { HighSchoolItem, ProvinceMetrics } from "./types";

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
    expect(
      getSchoolMapCoverage([province], "south", mapGeometry),
    ).toMatchObject({
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
    expect(
      getSchoolMapCoverage([province], "north", mapGeometry),
    ).toMatchObject({
      matchingSchoolCount: 0,
      locatedSchoolCount: 0,
      unlocatedSchoolCount: 0,
      locatedSchools: [],
    });
  });
});

it("does not plot a school outside its province even inside the nationwide map bounds", () => {
  const geometry = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { code: "79", name: province.name },
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [106.4, 10],
                [107, 10],
                [107, 11],
                [106.4, 11],
                [106.4, 10],
              ],
            ],
          ],
        },
      },
    ],
  } as import("./types").ProvinceFeatureCollection;
  expect(getSchoolMapCoverage([province], "all", geometry)).toMatchObject({
    matchingSchoolCount: 3,
    locatedSchoolCount: 0,
    unlocatedSchoolCount: 3,
    locatedSchools: [],
  });
  expect(province.highSchools).toHaveLength(3);
});

it("keeps schools in the list when their province geometry is unavailable", () => {
  expect(
    getSchoolMapCoverage([province], "all", {
      type: "FeatureCollection",
      features: [],
    }),
  ).toMatchObject({
    matchingSchoolCount: 3,
    locatedSchoolCount: 0,
    unlocatedSchoolCount: 3,
  });
});

it("does not accept coordinates in another province as the school's own province", () => {
  const anotherProvinceGeometry = {
    ...mapGeometry,
    features: mapGeometry.features.map((feature) => ({
      ...feature,
      properties: { ...feature.properties, code: "75" },
    })),
  };
  expect(
    getSchoolMapCoverage([province], "all", anotherProvinceGeometry)
      .locatedSchools,
  ).toEqual([]);
});
