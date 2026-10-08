import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCrmRule,
  createCrmRuleGroup,
  CrmRulesApiError,
  deleteCrmRuleGroup,
  listCrmFactCatalog,
  listCrmRules,
  listCrmRuleVersions,
  setCrmRuleEnabled,
  updateCrmRuleGroup,
  updateCrmRuleVersion,
} from ".";
import {
  normalizeCondition,
  normalizeRule,
  normalizeRuleVersionDetail,
} from "./normalizers";

const API = "http://localhost:3001";
const RULES = "/api/v1/rule-engine";
const fetchMock = vi.fn();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  return {
    url: new URL(url),
    method: init?.method ?? "GET",
    body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
  };
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("CRM Rule API", () => {
  it("normalizes snake_case rules and nested conditions", () => {
    expect(
      normalizeRule({
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
        conditions: JSON.stringify({
          all: [{ fact: "student.stage", op: "eq", value: "new" }],
        }),
        status: "testing",
        enabled: 0,
        revision: 0,
      }),
    ).toMatchObject({
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
    expect(
      normalizeCondition({
        not: { fact: "student.is_opted_out", op: "is_true" },
      }),
    ).toEqual({ not: { fact: "student.is_opted_out", op: "is_true" } });
  });

  it("sends the version-scoped rule payload", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        name: "CRM-RULE-001",
        rule_id: "CRM-RULE-001",
        rule_group: "lead_assignment",
        rule_name: "Lead đủ dữ liệu",
        feature_scope: "all",
        rule_type: "ELIGIBILITY",
        gate_outcome: "PASS",
        action: "ALLOW_ASSIGNMENT",
        condition: { all: [{ fact: "student.stage", op: "eq", value: "new" }] },
        status: "draft",
      }),
    );

    await createCrmRule({
      versionName: "NBA-V1",
      expectedVersionRevision: 2,
      ruleId: "CRM-RULE-001",
      ruleGroup: "lead_assignment",
      ruleName: "Lead đủ dữ liệu",
      featureScope: "all",
      ruleType: "ELIGIBILITY",
      gateOutcome: "PASS",
      priority: 100,
      action: "ALLOW_ASSIGNMENT",
      targetActions: ["ASSIGN"],
      condition: { all: [{ fact: "student.stage", op: "eq", value: "new" }] },
      businessReasonTemplate: "{action} phù hợp với {rule_name}.",
      salesNextStepTemplate: "Gọi lại trong ngày.",
    });

    const call = lastCall();
    expect(call.url.pathname).toBe(`${RULES}/rules`);
    expect(call.method).toBe("POST");
    expect(call.body).toMatchObject({
      version_name: "NBA-V1",
      expected_version_revision: 2,
      rule_id: "CRM-RULE-001",
      condition: { all: [{ fact: "student.stage" }] },
      business_reason_template: "{action} phù hợp với {rule_name}.",
      sales_next_step_template: "Gọi lại trong ngày.",
    });
  });

  it("publishes a version with both optimistic revisions", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        name: "CRM-RULE-VERSION-001",
        version_id: "NBA-V1",
        status: "active",
        revision: 4,
        settings_revision: 8,
        is_active: 1,
      }),
    );

    await updateCrmRuleVersion({
      name: "CRM-RULE-VERSION-001",
      expectedRevision: 3,
      status: "active",
      expectedSettingsRevision: 8,
      changeNote: "QA approved",
    });

    const call = lastCall();
    expect(call.url.pathname).toBe(
      `${RULES}/versions/CRM-RULE-VERSION-001/publish`,
    );
    expect(call.method).toBe("POST");
    expect(call.body).toMatchObject({
      name: "CRM-RULE-VERSION-001",
      expected_revision: 3,
      status: "active",
      expected_settings_revision: 8,
      change_note: "QA approved",
    });
  });

  it("uses version-scoped group CRUD endpoints", async () => {
    fetchMock.mockImplementation(async () =>
      json({ group: { code: "CONSENT", label: "Consent", rule_count: 0 } }),
    );

    await createCrmRuleGroup({
      versionName: "NBA-V1",
      expectedVersionRevision: 2,
      code: "CONSENT",
    });
    expect(lastCall().method).toBe("POST");
    expect(lastCall().url.pathname).toBe(`${RULES}/versions/NBA-V1/groups`);

    await updateCrmRuleGroup({
      versionName: "NBA-V1",
      expectedVersionRevision: 3,
      code: "CONSENT",
      label: "Consent updated",
    });
    expect(lastCall().method).toBe("PATCH");
    expect(lastCall().url.pathname).toBe(
      `${RULES}/versions/NBA-V1/groups/CONSENT`,
    );

    fetchMock.mockImplementation(async () =>
      json({ code: "CONSENT", deleted: true }),
    );
    await expect(
      deleteCrmRuleGroup({
        versionName: "NBA-V1",
        expectedVersionRevision: 4,
        code: "CONSENT",
      }),
    ).resolves.toEqual({ code: "CONSENT", deleted: true });
    expect(lastCall().method).toBe("DELETE");
  });

  it("toggles draft rule enablement through the dedicated endpoint", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        name: "CRM-RULE-001",
        rule_id: "CRM-RULE-001",
        group_code: "lead_assignment",
        rule_name: "Lead đủ dữ liệu",
        feature: "all",
        rule_type: "ELIGIBILITY",
        outcome: "PASS",
        precedence: 100,
        action: "ASSIGN",
        target_actions: ["ASSIGN"],
        conditions: [],
        status: "draft",
        enabled: 0,
      }),
    );

    await setCrmRuleEnabled({
      name: "CRM-RULE-001",
      expectedVersionRevision: 4,
      enabled: false,
    });

    const call = lastCall();
    expect(call.url.pathname).toBe(`${RULES}/rules/CRM-RULE-001/enabled`);
    expect(call.method).toBe("PATCH");
    expect(call.body).toMatchObject({
      name: "CRM-RULE-001",
      expected_version_revision: 4,
      enabled: false,
    });
  });

  it("normalizes a version detail and lists version query params", async () => {
    fetchMock.mockImplementation(async () =>
      json({ versions: [], total: 0, start: 0, page_length: 50 }),
    );
    expect(
      normalizeRuleVersionDetail({
        version_id: "NBA-V1",
        version_name: "NBA v1",
        groups: [{ group_id: "CONSENT", count: 2 }],
      }),
    ).toMatchObject({
      versionId: "NBA-V1",
      groups: [{ groupId: "CONSENT", count: 2 }],
    });

    await listCrmRuleVersions({ activeOnly: true, pageLength: 50 });

    const call = lastCall();
    expect(call.url.pathname).toBe(`${RULES}/versions`);
    expect(call.url.searchParams.get("active_only")).toBe("true");
  });

  it("lists rules and facts through separate contracts", async () => {
    fetchMock
      .mockImplementationOnce(async () =>
        json({ rules: [], start: 0, page_length: 200 }),
      )
      .mockImplementationOnce(async () =>
        json({
          schema_version: "crm-rule-v1",
          facts: [{ fact: "student.stage", type: "string" }],
        }),
      );

    await listCrmRules({ pageLength: 200 });
    await listCrmFactCatalog();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastCall().url.pathname).toBe(`${RULES}/fact-catalog`);
  });

  it("maps API errors to the rules error type", async () => {
    fetchMock.mockImplementation(async () =>
      json({ error: { code: "STALE_RULE_VERSION", message: "stale" } }, 409),
    );

    await expect(listCrmFactCatalog()).rejects.toBeInstanceOf(CrmRulesApiError);
    await expect(listCrmFactCatalog()).rejects.toMatchObject({
      status: 409,
      code: "STALE_RULE_VERSION",
    });
  });
});
