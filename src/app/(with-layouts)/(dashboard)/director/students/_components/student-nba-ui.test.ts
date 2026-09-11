import { describe, expect, it } from "vitest";

import { formatNbaEvaluationFailure } from "./student-nba-ui";

describe("formatNbaEvaluationFailure", () => {
  it("preserves the terminal reason for troubleshooting", () => {
    expect(formatNbaEvaluationFailure("kernel_precondition_failed")).toBe(
      "Đánh giá NBA chưa hoàn tất: kernel_precondition_failed. Vui lòng thử lại.",
    );
  });

  it("uses a generic retry message when no reason is returned", () => {
    expect(formatNbaEvaluationFailure(null)).toBe(
      "Đánh giá NBA chưa hoàn tất. Vui lòng thử lại.",
    );
  });
});
