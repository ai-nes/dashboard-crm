import { describe, expect, it, vi } from "vitest";

import { createCrmRule, listCrmFactCatalog, listCrmRules, listCrmRuleVersions } from ".";
import { normalizeCondition, normalizeRule, normalizeRuleVersionDetail } from "./normalizers";

describe("CRM Rule API", () => {
  it("normalizes snake_case rules and nested conditions", () => {
    expect(normalizeRule({
      name: "CRM-RULE-001",
      rule_id: "CRM-RULE-001",
      rule_group: "lead_assignment",
      rule_name: "Lead đủ dữ liệu",
      feature_scope: "all",
      rule_type: "ELIGIBILITY",
      gate_outcome: "PASS",
      priority: 100,
      action: "ALLOW_ASSIGNMENT",
      target_actions: '["ASSIGN"]',
      condition: JSON.stringify({ all: [{ fact: "student.stage", op: "eq", value: "new" }] }),
      status: "draft",
      enabled: 0,
      revision: 0,
    })).toMatchObject({
      ruleId: "CRM-RULE-001",
      targetActions: ["ASSIGN"],
      condition: { all: [{ fact: "student.stage", op: "eq", value: "new" }] },
    });
  });

  it("normalizes the backend fact catalog without adding UI facts", () => {
    expect(normalizeCondition({ not: { fact: "student.is_opted_out", op: "is_true" } })).toEqual({
      not: { fact: "student.is_opted_out", op: "is_true" },
    });
  });

  it("sends the Version-scoped CRM Rule payload to the new Frappe API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: { name: "CRM-RULE-001", rule_id: "CRM-RULE-001", rule_group: "lead_assignment", rule_name: "Lead đủ dữ liệu", feature_scope: "all", rule_type: "ELIGIBILITY", gate_outcome: "PASS", action: "ALLOW_ASSIGNMENT", condition: { all: [{ fact: "student.stage", op: "eq", value: "new" }] }, status: "draft" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      await createCrmRule({ versionName: "NBA-V1", expectedVersionRevision: 2, ruleId: "CRM-RULE-001", ruleGroup: "lead_assignment", ruleName: "Lead đủ dữ liệu", featureScope: "all", ruleType: "ELIGIBILITY", gateOutcome: "PASS", priority: 100, action: "ALLOW_ASSIGNMENT", targetActions: ["ASSIGN"], condition: { all: [{ fact: "student.stage", op: "eq", value: "new" }] } }, { baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock.mock.calls[0][0]).toContain("/api/method/crm.api.rule_engine.create_rule");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({ version_name: "NBA-V1", expected_version_revision: 2, rule_id: "CRM-RULE-001", condition: { all: [{ fact: "student.stage" }] } });
  });

  it("normalizes a Version detail and lists Version query params", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { version_id: "NBA-V1", version_name: "NBA v1", status: "draft", groups: [{ group_id: "CONSENT", label: "CONSENT", count: 2 }] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { versions: [], total: 0, start: 0, page_length: 50 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      expect(normalizeRuleVersionDetail({ version_id: "NBA-V1", version_name: "NBA v1", groups: [{ group_id: "CONSENT", count: 2 }] })).toMatchObject({ versionId: "NBA-V1", groups: [{ groupId: "CONSENT", count: 2 }] });
      await listCrmRuleVersions({ activeOnly: true, pageLength: 50 }, { baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock.mock.calls[0][0]).toContain("active_only=true");
  });

  it("lists rules and facts through separate backend contracts", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { rules: [], start: 0, page_length: 200 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { schema_version: "crm-rule-v1", facts: [{ fact: "student.stage", type: "string" }] } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      await listCrmRules({ pageLength: 200 }, { baseUrl: "http://frappe:8000" });
      await listCrmFactCatalog({ baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain("/api/method/crm.api.rule_engine.list_fact_catalog");
  });
});
