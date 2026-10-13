import { describe, expect, it } from "vitest";

import type { SchoolMarkerFilters } from "./school-engagement-filter";
import type { HighSchoolItem } from "./types";
import {
  filterMarketSchools,
  getSchoolMarkerFilterAvailability,
} from "./school-marker-filtering";

const school = (
  id: string,
  overrides: Partial<HighSchoolItem> = {},
): HighSchoolItem => ({
  id,
  directoryId: id,
  name: `Trường ${id}`,
  district: null,
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
  ...overrides,
});

const filters = (
  overrides: Partial<SchoolMarkerFilters> = {},
): SchoolMarkerFilters => ({
  schoolGroups: [],
  engagementIds: [],
  potentialBand: "all",
  ...overrides,
});

describe("school marker filtering", () => {
  const schools = [
    school("key-zero", {
      potentialScore: 0,
      classification: "Trọng điểm",
      participations: [
        {
          id: "campaign-1",
          name: "Tư vấn tuyển sinh",
          type: "campaign",
          occurredAt: null,
        },
      ],
    }),
    school("expand-55", {
      potentialScore: 55,
      classification: "Mở rộng",
    }),
    school("maintain-70", {
      potentialScore: 70,
      classification: "Duy trì",
      participations: [
        {
          id: "event-1",
          name: "Ngày hội hướng nghiệp",
          type: "event",
          occurredAt: "2026-06-01T00:00:00.000Z",
        },
      ],
    }),
    school("screen-90", {
      potentialScore: 90,
      classification: "Sàng lọc",
    }),
    school("unavailable", { potentialScore: null }),
  ];

  it.each([
    ["80-plus", ["screen-90"]],
    ["60-to-79", ["maintain-70"]],
    ["under-60", ["key-zero", "expand-55"]],
  ] as const)("filters the %s score band and preserves zero", (band, ids) => {
    expect(
      filterMarketSchools(schools, filters({ potentialBand: band })).map(
        (item) => item.id,
      ),
    ).toEqual(ids);
  });

  it.each([
    ["Trọng điểm", ["key-zero"]],
    ["Mở rộng", ["expand-55"]],
    ["Duy trì", ["maintain-70"]],
    ["Sàng lọc", ["screen-90"]],
  ] as const)("filters the %s school group", (group, ids) => {
    expect(
      filterMarketSchools(schools, filters({ schoolGroups: [group] })).map(
        (item) => item.id,
      ),
    ).toEqual(ids);
  });

  it.each([
    ["campaign-1", ["key-zero"]],
    ["event-1", ["maintain-70"]],
  ])("filters participation %s", (id, ids) => {
    expect(
      filterMarketSchools(schools, filters({ engagementIds: [id] })).map(
        (item) => item.id,
      ),
    ).toEqual(ids);
  });

  it("combines filters and school search with AND semantics", () => {
    const candidates = [
      school("hanoi-match", {
        name: "THPT Hà Nội",
        potentialScore: 70,
        classification: "Duy trì",
        participations: [
          {
            id: "event-1",
            name: "Ngày hội hướng nghiệp",
            type: "event",
            occurredAt: null,
          },
        ],
      }),
      school("hanoi-wrong-band", {
        name: "THPT Hà Nội 2",
        potentialScore: 90,
        classification: "Duy trì",
        participations: [
          {
            id: "event-1",
            name: "Ngày hội hướng nghiệp",
            type: "event",
            occurredAt: null,
          },
        ],
      }),
      school("hcm-wrong-query", {
        name: "THPT Hồ Chí Minh",
        potentialScore: 70,
        classification: "Duy trì",
        participations: [
          {
            id: "event-1",
            name: "Ngày hội hướng nghiệp",
            type: "event",
            occurredAt: null,
          },
        ],
      }),
    ];

    expect(
      filterMarketSchools(
        candidates,
        filters({
          schoolGroups: ["Duy trì"],
          engagementIds: ["event-1"],
          potentialBand: "60-to-79",
        }),
        "hà nội",
      ).map((item) => item.id),
    ).toEqual(["hanoi-match"]);
  });

  it("returns no schools when an applied criterion has no matching values", () => {
    expect(
      filterMarketSchools(schools, filters({ engagementIds: ["missing"] })),
    ).toEqual([]);
  });

  it("only enables score bands and groups represented by available source data", () => {
    expect(getSchoolMarkerFilterAvailability(schools)).toEqual({
      potentialBands: new Set(["under-60", "60-to-79", "80-plus"]),
      schoolGroups: new Set(["Trọng điểm", "Mở rộng", "Duy trì", "Sàng lọc"]),
    });
    expect(getSchoolMarkerFilterAvailability([school("empty")])).toEqual({
      potentialBands: new Set(),
      schoolGroups: new Set(),
    });
  });

  it("only enables the supported key-account group when that is the available classification", () => {
    const availability = getSchoolMarkerFilterAvailability([
      school("key-zero", {
        classification: "Trọng điểm",
        potentialScore: 0,
      }),
      school("unclassified"),
    ]);

    expect(availability.schoolGroups).toEqual(new Set(["Trọng điểm"]));
    expect(availability.potentialBands).toEqual(new Set(["under-60"]));
  });
});
