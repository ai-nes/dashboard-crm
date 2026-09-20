import { describe, expect, it } from "vitest";

import {
  createScoreRuleDraft,
  formatScoreRuleEffect,
  getScoreRuleValidationMessage,
} from "./score-rule-model";

describe("score rule model", () => {
  it("validates positive rules against their maximum", () => {
    const rule = {
      ...createScoreRuleDraft("positive"),
      signal: "GRADE_12_GPA",
      base_points: 20,
      max_points: 10,
    };

    expect(getScoreRuleValidationMessage(rule)).toBe(
      "Điểm cộng tối đa phải lớn hơn hoặc bằng điểm cộng cơ bản.",
    );
  });

  it("does not require a signal for time decay rules", () => {
    const rule = createScoreRuleDraft("time_decay");

    expect(getScoreRuleValidationMessage(rule)).toBeNull();
    expect(formatScoreRuleEffect(rule)).toBe("×1 · sau 0 ngày");
  });

  it("summarizes negative rules with their operational limits", () => {
    const rule = {
      ...createScoreRuleDraft("negative"),
      signal: "NO_CONTACT_30",
      penalty_amount: 10,
      cooldown_days: 30,
      max_penalties: 1,
    };

    expect(getScoreRuleValidationMessage(rule)).toBeNull();
    expect(formatScoreRuleEffect(rule)).toBe(
      "−10 điểm · chờ 30 ngày · tối đa 1 lần",
    );
  });
});
