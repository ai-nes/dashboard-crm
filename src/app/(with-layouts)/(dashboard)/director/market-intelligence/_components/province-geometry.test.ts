import { describe, expect, it } from "vitest";
import { containsMapPoint } from "./province-geometry";

const geometry: GeoJSON.MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [
    [
      [
        [105, 10],
        [107, 10],
        [107, 12],
        [105, 12],
        [105, 10],
      ],
      [
        [105.5, 10.5],
        [106.5, 10.5],
        [106.5, 11.5],
        [105.5, 11.5],
        [105.5, 10.5],
      ],
    ],
    [
      [
        [108, 10],
        [108.5, 10],
        [108.5, 10.5],
        [108, 10.5],
        [108, 10],
      ],
    ],
  ],
};

describe("province geometry", () => {
  it.each([
    [[105.2, 10.2], true],
    [[104.9, 10.2], false],
    [[106, 11], false],
    [[105, 11], true],
    [[105, 10], true],
    [[108.2, 10.2], true],
    [[107.5, 10.2], false],
  ] as const)(
    "checks mainland, boundary, holes and islands at %j",
    (point, expected) => {
      expect(containsMapPoint(geometry, [...point])).toBe(expected);
    },
  );
});
