import { describe, expect, it, vi } from "vitest";

import type { CrmRule, CrmRuleVersion } from "./types";
import {
  buildRuleDraftClonePayload,
  cloneRuleIntoDraft,
} from "./draft-clone";

const sourceVersion = {
  name: "CRM-RULE-VERSION-ACTIVE",
  versionId: "COPILOT-V1",
  versionName: "Copilot rules",
  description: "Published rules",
} as CrmRuleVersion;

const sourceRule = {
  name: "ACTIVE-RULE-DOC",
  ruleId: "COPILOT-001",
} as CrmRule;

const draftVersion = {
  ...sourceVersion,
  name: "CRM-RULE-VERSION-DRAFT",
  versionId: "COPILOT-V1-DRAFT",
  status: "draft",
} as CrmRuleVersion;

const draftRule = {
  ...sourceRule,
  name: "DRAFT-RULE-DOC",
  status: "draft",
} as CrmRule;

describe("Rule draft cloning", () => {
  it("generates unique version identifiers within Frappe's length limits", () => {
    const first = buildRuleDraftClonePayload(sourceVersion, 1_757_690_400_000, 0.1);
    const second = buildRuleDraftClonePayload(sourceVersion, 1_757_690_400_000, 0.2);
    if (!first.versionName || !second.versionName) {
      throw new Error("Expected clone payloads to include a version name");
    }

    expect(first.versionId).toMatch(/^[A-Z][A-Z0-9._-]{1,63}$/);
    expect(first.versionId.length).toBeLessThanOrEqual(64);
    expect(first.versionName.length).toBeLessThanOrEqual(140);
    expect(first.versionId).not.toBe(second.versionId);
    expect(first).toMatchObject({
      sourceName: sourceVersion.name,
      description: sourceVersion.description,
    });

    const longSource = {
      ...sourceVersion,
      versionId: "C".repeat(64),
      versionName: "Copilot rule version ".repeat(10),
    };
    const bounded = buildRuleDraftClonePayload(longSource, 1_757_690_400_001, 0.3);
    if (!bounded.versionName) {
      throw new Error("Expected bounded clone payload to include a version name");
    }
    expect(bounded.versionId.length).toBeLessThanOrEqual(64);
    expect(bounded.versionName.length).toBeLessThanOrEqual(140);
  });

  it("loads the matching rule from the newly cloned version", async () => {
    const cloneVersion = vi.fn().mockResolvedValue(draftVersion);
    const listRules = vi.fn().mockResolvedValue({ rules: [draftRule], total: 1, start: 0, pageLength: 200 });

    const result = await cloneRuleIntoDraft(sourceVersion, sourceRule, cloneVersion, listRules);

    expect(result).toEqual({ draftVersion, draftRule });
    expect(cloneVersion).toHaveBeenCalledWith(expect.objectContaining({
      sourceName: sourceVersion.name,
      versionId: expect.stringMatching(/-DRAFT-/),
    }));
    expect(listRules).toHaveBeenCalledWith({
      versionName: draftVersion.name,
      search: sourceRule.ruleId,
      start: 0,
      pageLength: 200,
    });
  });

  it("does not query a clone when the backend clone fails", async () => {
    const cloneVersion = vi.fn().mockRejectedValue(new Error("Version conflict"));
    const listRules = vi.fn();

    await expect(
      cloneRuleIntoDraft(sourceVersion, sourceRule, cloneVersion, listRules),
    ).rejects.toThrow("Version conflict");
    expect(listRules).not.toHaveBeenCalled();
  });

  it("reports the created draft if its rule cannot be found", async () => {
    const cloneVersion = vi.fn().mockResolvedValue(draftVersion);
    const listRules = vi.fn().mockResolvedValue({ rules: [], total: 0, start: 0, pageLength: 200 });

    await expect(
      cloneRuleIntoDraft(sourceVersion, sourceRule, cloneVersion, listRules),
    ).rejects.toMatchObject({
      name: "RuleDraftCloneLookupError",
      draftVersion,
    });
  });
});
