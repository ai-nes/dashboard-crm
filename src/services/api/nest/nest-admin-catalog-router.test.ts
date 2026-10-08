import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { nestAdminCatalogRequest } from "./nest-admin-catalog-router";
import { nestGeographyHandler } from "./nest-geography-router";
import { operationCaller } from "./nest-test-support";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

const OPS = "http://ops.test/operations";

describe("admin catalog operations routed to Nest", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("serves admission years from reference data in the dashboard shape", async () => {
    fetchMock.mockImplementation(() =>
      json({
        data: [
          {
            id: "y1",
            name: "2026",
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: null,
            isActive: true,
          },
        ],
        meta: { pagination: { total: 1 } },
      }),
    );
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    const result = await request(
      `${OPS}/crm.api.admin_catalog.list_admission_years?search=26&page_length=10`,
    );
    expect(result).toMatchObject({
      total: 1,
      years: [
        {
          name: "y1",
          year_name: "2026",
          start_date: "2026-01-01",
          is_active: 1,
        },
      ],
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/reference-data/admission-years?q=26&pageSize=10",
    );
  });

  it("maps offering approval to the transition endpoint", async () => {
    fetchMock.mockImplementation(() => json({ name: "o1", status: "Active" }));
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    await request(
      `${OPS}/crm.api.admin_catalog.transition_admission_offering`,
      {
        method: "POST",
        body: JSON.stringify({
          name: "o1",
          status: "Active",
          expected_modified: "m1",
        }),
      },
    );
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "http://api.test/api/v1/admission-offerings/o1/transition",
    );
    expect(JSON.parse(init.body as string)).toEqual({
      status: "Active",
      expectedModified: "m1",
    });
  });

  it("keeps the Nest error status and code", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "ACTIVE_IMMUTABLE", message: "No." } }, 409),
    );
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    await expect(
      request(`${OPS}/crm.api.admin_catalog.delete_admission_offering`, {
        method: "POST",
        body: JSON.stringify({ name: "o1" }),
      }),
    ).rejects.toMatchObject({ status: 409, code: "ACTIVE_IMMUTABLE" });
  });

  it("fails fast with 501 for methods the Nest backend lacks", async () => {
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    await expect(
      request(`${OPS}/crm.api.admin_catalog.list_unknown_catalog`),
    ).rejects.toMatchObject({ status: 501, code: "FEATURE_NOT_MIGRATED" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("serves the geography catalog and channel types from Nest", async () => {
    fetchMock.mockImplementation(() =>
      json({ provinces: [], total: 0, channelTypes: [], start: 0 }),
    );
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    await request(
      `${OPS}/crm.api.geography_catalog.list_provinces?search=a&page_length=5`,
    );
    await request(
      `${OPS}/crm.api.campaign_channel_type.list_campaign_channel_types`,
    );
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/geography-catalog/provinces?search=a&page_length=5",
    );
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "/api/v1/campaign-channel-types",
    );
  });
  it("routes the score template and signal calls to the score config", async () => {
    fetchMock.mockImplementation(() => json({ templates: [], total: 0 }));
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    await request(
      `${OPS}/crm.api.admin_catalog.list_score_templates?search=a&start=0&page_length=20`,
    );
    await request(
      `${OPS}/crm.api.admin_catalog.list_score_signals?active_only=true`,
    );
    await request(`${OPS}/crm.api.admin_catalog.update_score_template`, {
      method: "POST",
      body: JSON.stringify({
        name: "SCT-1",
        data: { status: "Draft" },
        expected_modified: "2026-01-01T00:00:00.000Z",
      }),
    });
    const calls = fetchMock.mock.calls.map((call) => [
      String(call[0]),
      (call[1] as RequestInit | undefined)?.method ?? "GET",
    ]);
    expect(calls).toEqual([
      [
        "http://api.test/api/v1/score-config/templates?search=a&start=0&page_length=20",
        "GET",
      ],
      ["http://api.test/api/v1/score-config/signals?active_only=true", "GET"],
      ["http://api.test/api/v1/score-config/templates/SCT-1", "PATCH"],
    ]);
  });
  it("serves governed values and their change workflow from Nest", async () => {
    fetchMock.mockImplementation(() => json({ records: [], changes: [] }));
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    await request(
      `${OPS}/crm.api.admin_catalog.list_governed_values?doctype=CRM%20Lead%20Source&include_retired=true&page_length=20`,
    );
    await request(`${OPS}/crm.api.admin_catalog.create_governed_value`, {
      method: "POST",
      body: JSON.stringify({
        doctype: "CRM Platform",
        data: { platform_name: "Zalo OA", lead_source: "Social" },
      }),
    });
    await request(`${OPS}/crm.api.admin_catalog.propose_governed_change`, {
      method: "POST",
      body: JSON.stringify({
        doctype: "CRM Campus",
        docname: "FPTU HCM",
        action: "Retire",
        reason: "Closed",
        expected_version: 2,
      }),
    });
    await request(
      `${OPS}/crm.api.admin_catalog.list_governed_changes?doctype=CRM%20Campus`,
    );
    await request(`${OPS}/crm.api.admin_catalog.approve_governed_change`, {
      method: "POST",
      body: JSON.stringify({ change_log_name: "MDC-2026-00015" }),
    });
    const calls = fetchMock.mock.calls.map((call) => [
      String(call[0]),
      (call[1] as RequestInit | undefined)?.method ?? "GET",
    ]);
    expect(calls).toEqual([
      [
        "http://api.test/api/v1/governed-values/lead-source?page_length=20&include_retired=true",
        "GET",
      ],
      ["http://api.test/api/v1/governed-values/platform", "POST"],
      ["http://api.test/api/v1/governed-values/campus/changes", "POST"],
      ["http://api.test/api/v1/governed-values/campus/changes", "GET"],
      [
        "http://api.test/api/v1/governed-values/changes/MDC-2026-00015/approve",
        "POST",
      ],
    ]);
    const created = JSON.parse(
      String((fetchMock.mock.calls[1][1] as RequestInit).body),
    );
    expect(created).toMatchObject({
      value: "Zalo OA",
      lead_source: "Social",
    });
  });

  it("serves the academic year config from Nest", async () => {
    fetchMock.mockImplementation(() => json({ configs: [], total: 0 }));
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    await request(
      `${OPS}/crm.api.admin_catalog.list_academic_year_configs?search=26`,
    );
    await request(`${OPS}/crm.api.admin_catalog.update_academic_year_config`, {
      method: "POST",
      body: JSON.stringify({
        name: "cfg-1",
        data: { notes: "x" },
        expected_modified: "2026-01-01T00:00:00.000Z",
      }),
    });
    const calls = fetchMock.mock.calls.map((call) => [
      String(call[0]),
      (call[1] as RequestInit | undefined)?.method ?? "GET",
    ]);
    expect(calls).toEqual([
      ["http://api.test/api/v1/academic-year-configs?search=26", "GET"],
      ["http://api.test/api/v1/academic-year-configs/cfg-1", "PATCH"],
    ]);
  });
  it("writes channel types through the Nest endpoint and answers in the dashboard shape", async () => {
    fetchMock.mockImplementation(() =>
      json({
        code: "ZALO",
        displayName: "Zalo",
        modes: ["ONLINE"],
        enabled: true,
        sortOrder: 1,
        description: "",
      }),
    );
    const request = operationCaller(
      nestAdminCatalogRequest,
      nestGeographyHandler,
    );
    const created = await request(
      `${OPS}/crm.api.campaign_channel_type.create_campaign_channel_type`,
      {
        method: "POST",
        body: JSON.stringify({ data: { code: "ZALO", display_name: "Zalo" } }),
      },
    );
    expect(created).toMatchObject({
      code: "ZALO",
      display_name: "Zalo",
      is_online: 1,
      is_offline: 0,
      enabled: 1,
    });
    await request(
      `${OPS}/crm.api.campaign_channel_type.delete_campaign_channel_type`,
      { method: "POST", body: JSON.stringify({ name: "ZALO" }) },
    );
    expect(
      fetchMock.mock.calls.map((call) => [
        String(call[0]),
        (call[1] as RequestInit).method,
      ]),
    ).toEqual([
      ["http://api.test/api/v1/campaign-channel-types", "POST"],
      ["http://api.test/api/v1/campaign-channel-types/ZALO", "DELETE"],
    ]);
  });
});
