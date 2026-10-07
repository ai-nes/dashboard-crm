import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function respond(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("CRM Rule REST adapter", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("lists versions through the Nest REST contract", async () => {
    fetchMock.mockImplementation(() =>
      respond({ versions: [], total: 0, start: 0, page_length: 50 }),
    );
    const { listCrmRuleVersions } = await import(".");

    await expect(
      listCrmRuleVersions({ activeOnly: true, pageLength: 50 }),
    ).resolves.toMatchObject({ versions: [], total: 0 });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/rule-engine/versions?active_only=true&start=0&page_length=50",
    );
  });

  it("maps version-scoped writes and publish to REST resources", async () => {
    fetchMock
      .mockImplementationOnce(() =>
        respond({
          rule_id: "RULE_001",
          version_id: "NBA_V1",
          rule_group: "eligibility",
          rule_name: "Eligible",
          feature_scope: "nba",
          rule_type: "GUARDRAIL",
          gate_outcome: "PASS",
          target_actions: ["CALL"],
          condition: { fact: "student.stage", op: "eq", value: "New" },
          status: "draft",
          enabled: true,
        }),
      )
      .mockImplementationOnce(() =>
        respond({
          version_id: "NBA_V1",
          version_name: "NBA v1",
          status: "active",
          revision: 4,
          settings_revision: 2,
          is_active: true,
        }),
      );
    const { createCrmRule, updateCrmRuleVersion } = await import(".");

    await createCrmRule({
      versionName: "NBA_V1",
      expectedVersionRevision: 3,
      ruleId: "RULE_001",
      ruleGroup: "eligibility",
      ruleName: "Eligible",
      featureScope: "nba",
      ruleType: "GUARDRAIL",
      gateOutcome: "PASS",
      priority: 10,
      action: "CALL",
      targetActions: ["CALL"],
      condition: { fact: "student.stage", op: "eq", value: "New" },
    });
    await updateCrmRuleVersion({
      name: "NBA_V1",
      expectedRevision: 3,
      status: "active",
      expectedSettingsRevision: 2,
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/rule-engine/rules",
    );
    expect(
      JSON.parse(fetchMock.mock.calls[0]?.[1].body as string),
    ).toMatchObject({
      version_name: "NBA_V1",
      expected_version_revision: 3,
    });
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://api.test/api/v1/rule-engine/versions/NBA_V1/publish",
    );
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: "POST" });
  });
});
