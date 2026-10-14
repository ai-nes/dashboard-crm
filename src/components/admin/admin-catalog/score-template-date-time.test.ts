import { describe, expect, it } from "vitest";

import { formatScoreModifiedAt } from "./score-template-date-time";

describe("score-template update timestamp", () => {
  it("formats the UTC API timestamp in Vietnam time", () => {
    expect(formatScoreModifiedAt("2026-10-14T04:13:00.000Z")).toBe(
      "14/10/2026 · 11:13",
    );
  });

  it("keeps the empty timestamp label", () => {
    expect(formatScoreModifiedAt()).toBe("Chưa thiết lập");
  });
});
