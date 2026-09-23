import { describe, expect, it } from "vitest";
import { getVisual360Rotation, getVisual360Sector } from "./student-visual-360-geometry";

describe("Visual 360 watch dial", () => {
  it("rotates by the shortest route across the last and first sectors", () => {
    expect(getVisual360Rotation(0, 4)).toBe(72);
    expect(getVisual360Rotation(72, 0)).toBe(0);
    expect(getVisual360Rotation(-288, 0)).toBe(-360);
  });

  it("aligns every selected sector at twelve o'clock after repeated turns", () => {
    let rotation = 0;
    for (const index of [1, 3, 4, 0, 2, 4, 1]) {
      const next = getVisual360Rotation(rotation, index);
      expect(Math.abs(next - rotation)).toBeLessThanOrEqual(180);
      expect(Math.abs((index * 72 + next) % 360)).toBe(0);
      rotation = next;
    }
  });

  it("joins adjacent sector boundaries into a closed ring", () => {
    for (let index = 0; index < 5; index++) {
      const points = getVisual360Sector(index).clipPath.match(/[-\d.]+% [-\d.]+%/g)!;
      const next = getVisual360Sector((index + 1) % 5).clipPath.match(/[-\d.]+% [-\d.]+%/g)!;
      const parse = (value: string) => value.split(" ").map(parseFloat);
      parse(points[24]).forEach((value, axis) => expect(value).toBeCloseTo(parse(next[0])[axis]));
      parse(points[25]).forEach((value, axis) => expect(value).toBeCloseTo(parse(next[49])[axis]));
    }
  });
});
