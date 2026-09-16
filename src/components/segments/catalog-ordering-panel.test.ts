import { describe, expect, it } from "vitest";

import { moveCatalogOrderItem } from "./catalog-ordering-panel";

describe("moveCatalogOrderItem", () => {
  it("moves an item while keeping the other items in order", () => {
    expect(moveCatalogOrderItem(["A", "B", "C"], 2, 0)).toEqual([
      "C",
      "A",
      "B",
    ]);
  });

  it("returns a copy when the indexes are invalid or unchanged", () => {
    const items = ["A", "B"];

    expect(moveCatalogOrderItem(items, 1, 1)).toEqual(items);
    expect(moveCatalogOrderItem(items, -1, 0)).toEqual(items);
    expect(moveCatalogOrderItem(items, 0, 2)).toEqual(items);
  });
});
