import { describe, expect, it } from "vitest";

import { isNearScrollBottom, normalizePageSize } from "./infinite-scroll";

describe("infinite scroll boundaries", () => {
  it("normalizes invalid and fractional page sizes", () => {
    expect(normalizePageSize(NaN)).toBe(20);
    expect(normalizePageSize(Infinity)).toBe(20);
    expect(normalizePageSize(0)).toBe(1);
    expect(normalizePageSize(4.9)).toBe(4);
  });

  it("loads only near the bottom of a scrollable list", () => {
    expect(isNearScrollBottom({ scrollTop: 0, clientHeight: 200, scrollHeight: 600 })).toBe(false);
    expect(isNearScrollBottom({ scrollTop: 384, clientHeight: 200, scrollHeight: 600 })).toBe(true);
    expect(isNearScrollBottom({ scrollTop: 383, clientHeight: 200, scrollHeight: 600 })).toBe(false);
    expect(isNearScrollBottom({ scrollTop: 0, clientHeight: 200, scrollHeight: 200 })).toBe(true);
  });

  it("normalizes the threshold without triggering early loads", () => {
    const position = { scrollTop: 380, clientHeight: 200, scrollHeight: 600 };
    expect(isNearScrollBottom(position, NaN)).toBe(false);
    expect(isNearScrollBottom(position, -1)).toBe(false);
    expect(isNearScrollBottom(position, 20)).toBe(true);
  });
});
