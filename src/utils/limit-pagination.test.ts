import { describe, expect, it } from "vitest";
import { getNextLimit } from "./limit-pagination";

describe("limit-only pagination", () => {
  it("grows the prefix rather than treating it as an offset page", () => {
    expect(getNextLimit(20, 20, 20, 500)).toBe(40);
    expect(getNextLimit(40, 40, 20, 500)).toBe(60);
  });
  it("stops at a short response, empty response or backend cap", () => {
    expect(getNextLimit(19, 20, 20, 500)).toBeUndefined();
    expect(getNextLimit(0, 20, 20, 500)).toBeUndefined();
    expect(getNextLimit(500, 500, 20, 500)).toBeUndefined();
    expect(getNextLimit(490, 490, 20, 500)).toBe(500);
  });
});
