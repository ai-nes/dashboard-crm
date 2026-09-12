import { describe, expect, it } from "vitest";

import { canEditRuleInVersion, canEditRulesInVersion } from "./rule-admin-edit-policy";

describe("CRM Rule admin edit policy", () => {
  it.each(["draft", "active"] as const)("allows Rule mutations in %s versions", (status) => {
    expect(canEditRulesInVersion(status)).toBe(true);
  });

  it.each(["testing", "archived"] as const)("keeps %s versions read-only", (status) => {
    expect(canEditRulesInVersion(status)).toBe(false);
    expect(canEditRuleInVersion(status, status, false)).toBe(false);
    expect(canEditRuleInVersion(status, undefined, true)).toBe(false);
  });

  it("only edits a Rule when its status matches the editable parent version", () => {
    expect(canEditRuleInVersion("draft", "draft", false)).toBe(true);
    expect(canEditRuleInVersion("active", "active", false)).toBe(true);
    expect(canEditRuleInVersion("draft", "active", false)).toBe(false);
    expect(canEditRuleInVersion("active", "draft", false)).toBe(false);
  });

  it("allows creating a Rule in Draft and Active, but nowhere else", () => {
    expect(canEditRuleInVersion("draft", undefined, true)).toBe(true);
    expect(canEditRuleInVersion("active", undefined, true)).toBe(true);
    expect(canEditRuleInVersion(undefined, undefined, true)).toBe(false);
  });
});
