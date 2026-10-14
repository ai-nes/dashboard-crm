import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { CrmFactMetadata } from "@/services/api/rules-config";
import { RuleConditionValue } from "./rule-condition-value";

const facts: CrmFactMetadata[] = [
  { fact: "student.is_opted_out", type: "boolean" },
];

describe("RuleConditionValue boolean selection", () => {
  it("does not present an empty draft value as an already-selected true value", () => {
    const markup = renderToStaticMarkup(
      <RuleConditionValue
        condition={{
          id: "condition-1",
          fact: "student.is_opted_out",
          op: "eq",
          value: "",
        }}
        facts={facts}
        onChange={vi.fn()}
      />,
    );

    expect(markup).toContain("Chọn giá trị");
    expect(markup).not.toContain("Đúng</span>");
  });
});
