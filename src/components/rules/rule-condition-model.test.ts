import { describe, expect, it } from "vitest";

import {
  conditionToDraft,
  draftToCondition,
  parseConditionValueInput,
  type RuleFilterCondition,
} from "./rule-condition-model";

describe("boolean rule condition values", () => {
  it.each([
    ["true", true],
    ["false", false],
  ] as const)(
    "keeps %s as a boolean through the visual builder",
    (raw, expected) => {
      const value = parseConditionValueInput(raw, "boolean", "eq");
      expect(value).toBe(expected);
      expect(typeof value).toBe("boolean");

      const condition: RuleFilterCondition = {
        id: "condition-1",
        fact: "student.is_opted_out",
        op: "eq",
        value,
      };
      const ast = draftToCondition({
        logic: "all",
        groups: [
          {
            id: "group-1",
            logic: "all",
            negate: false,
            conditions: [condition],
          },
        ],
      });

      expect(ast).toEqual({
        fact: "student.is_opted_out",
        op: "eq",
        value: expected,
      });
      expect(conditionToDraft(ast)?.groups[0]?.conditions[0]?.value).toBe(
        expected,
      );
    },
  );
});
