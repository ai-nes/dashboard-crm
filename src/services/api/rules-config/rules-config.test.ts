import { describe, expect, it, vi } from "vitest";

import {
  createCrmRule,
  createCrmRuleGroup,
  deleteCrmRuleGroup,
  listCrmFactCatalog,
  listCrmRules,
  listCrmRuleVersions,
  setCrmRuleEnabled,
  updateCrmRuleGroup,
  updateCrmRuleVersion,
} from ".";
import { normalizeCondition, normalizeRule, normalizeRuleVersionDetail } from "./normalizers";

describe("CRM Rule API", () => {
  it("normalizes snake_case rules and nested conditions", () => {
    expect(normalizeRule({
      name: "CRM-RULE-001",
      rule_id: "CRM-RULE-001",
      group_code: "lead_assignment",
      rule_name: "Lead đủ dữ liệu",
      feature_scope: "all",
      rule_type: "ELIGIBILITY",
      outcome: "PASS",
      precedence: 100,
      action: "ALLOW_ASSIGNMENT",
      target_actions: '["ASSIGN"]',
      conditions: JSON.stringify({ all: [{ fact: "student.stage", op: "eq", value: "new" }] }),
      status: "testing",
      enabled: 0,
      revision: 0,
    })).toMatchObject({
      ruleId: "CRM-RULE-001",
      ruleGroup: "lead_assignment",
      targetActions: ["ASSIGN"],
      gateOutcome: "PASS",
      priority: 100,
      condition: { all: [{ fact: "student.stage", op: "eq", value: "new" }] },
      status: "testing",
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
      await createCrmRule({ versionName: "NBA-V1", expectedVersionRevision: 2, ruleId: "CRM-RULE-001", ruleGroup: "lead_assignment", ruleName: "Lead đủ dữ liệu", featureScope: "all", ruleType: "ELIGIBILITY", gateOutcome: "PASS", priority: 100, action: "ALLOW_ASSIGNMENT", targetActions: ["ASSIGN"], condition: { all: [{ fact: "student.stage", op: "eq", value: "new" }] }, businessReasonTemplate: "{action} phù hợp với {rule_name}.", salesNextStepTemplate: "Gọi lại trong ngày." }, { baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock.mock.calls[0][0]).toContain("/api/method/crm.api.rule_engine.create_rule");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({ version_name: "NBA-V1", expected_version_revision: 2, rule_id: "CRM-RULE-001", condition: { all: [{ fact: "student.stage" }] }, business_reason_template: "{action} phù hợp với {rule_name}.", sales_next_step_template: "Gọi lại trong ngày." });
  });

  it("sends status transition with both optimistic revisions", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: { name: "CRM-RULE-VERSION-001", version_id: "NBA-V1", status: "active", revision: 4, settings_revision: 8, is_active: 1 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      await updateCrmRuleVersion({ name: "CRM-RULE-VERSION-001", expectedRevision: 3, status: "active", expectedSettingsRevision: 8, changeNote: "QA approved" }, { baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock.mock.calls[0][0]).toContain("/api/method/crm.api.rule_engine.update_rule_version");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "PUT" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({ name: "CRM-RULE-VERSION-001", expected_revision: 3, status: "active", expected_settings_revision: 8, change_note: "QA approved" });
  });

  it("uses version-scoped group CRUD endpoints", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { group: { code: "CONSENT", label: "Consent", rule_count: 0 } } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { group: { code: "CONSENT", label: "Consent updated", rule_count: 0 } } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: { code: "CONSENT", deleted: true } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      await createCrmRuleGroup({ versionName: "NBA-V1", expectedVersionRevision: 2, code: "CONSENT" }, { baseUrl: "http://frappe:8000" });
      await updateCrmRuleGroup({ versionName: "NBA-V1", expectedVersionRevision: 3, code: "CONSENT", label: "Consent updated" }, { baseUrl: "http://frappe:8000" });
      await deleteCrmRuleGroup({ versionName: "NBA-V1", expectedVersionRevision: 4, code: "CONSENT" }, { baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      expect.stringContaining("/api/method/crm.api.rule_engine.create_rule_group"),
      expect.stringContaining("/api/method/crm.api.rule_engine.update_rule_group"),
      expect.stringContaining("/api/method/crm.api.rule_engine.delete_rule_group"),
    ]);
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: "DELETE" });
  });

  it("toggles draft rule enablement through the dedicated endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: { name: "CRM-RULE-001", rule_id: "CRM-RULE-001", group_code: "lead_assignment", rule_name: "Lead đủ dữ liệu", feature: "all", rule_type: "ELIGIBILITY", outcome: "PASS", precedence: 100, action: "ASSIGN", target_actions: ["ASSIGN"], conditions: [], status: "draft", enabled: 0 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      await setCrmRuleEnabled({ name: "CRM-RULE-001", expectedVersionRevision: 4, enabled: false }, { baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock.mock.calls[0][0]).toContain("/api/method/crm.api.rule_engine.set_rule_enabled");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "PUT" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({ name: "CRM-RULE-001", expected_version_revision: 4, enabled: false });
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
