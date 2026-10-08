import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AdminCatalogApiError,
  createAdmissionYear,
  deleteAdmissionOffering,
  listAdmissionYears,
  listCampaignChannelTypes,
  listGovernedValues,
  listScoreSignals,
  transitionAdmissionOffering,
  updateScoreTemplate,
} from "./admin-catalog";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("admin catalog API", () => {
  it("loads searchable score signals with active-only filtering", async () => {
    fetchMock.mockResolvedValue(
      json({
        signals: [
          {
            name: "GRADE_12_GPA",
            signal_key: "GRADE_12_GPA",
            label: "Điểm TB lớp 12",
            category: "Fit",
            signal_type: "property",
            is_active: 1,
          },
        ],
        total: 1,
      }),
    );

    await expect(
      listScoreSignals({
        search: "gpa",
        activeOnly: true,
        start: 0,
        pageLength: 25,
      }),
    ).resolves.toMatchObject({
      signals: [{ name: "GRADE_12_GPA", is_active: true }],
      total: 1,
    });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/score-config/signals");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      search: "gpa",
      start: "0",
      page_length: "25",
      active_only: "true",
    });
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      credentials: "include",
    });
  });

  it("maps admission years from reference data", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: [
          {
            id: "year-1",
            name: "2026",
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: null,
            isActive: true,
          },
        ],
        meta: { pagination: { total: 1 } },
      }),
    );

    await expect(listAdmissionYears({ search: "2026" })).resolves.toEqual({
      years: [
        {
          name: "year-1",
          year_name: "2026",
          start_date: "2026-01-01",
          end_date: null,
          is_active: 1,
        },
      ],
      total: 1,
    });
    expect(new URL(fetchMock.mock.calls[0]![0]).pathname).toBe(
      "/api/v1/reference-data/admission-years",
    );
  });

  it("creates an admission year", async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          data: {
            id: "year-2",
            name: "2027",
            startDate: null,
            endDate: null,
            isActive: false,
          },
        },
        201,
      ),
    );

    await expect(
      createAdmissionYear({ year_name: "2027", is_active: false }),
    ).resolves.toMatchObject({ name: "year-2", year_name: "2027" });
    expect(fetchMock.mock.calls[0]![1].method).toBe("POST");
  });

  it("sends the record version on transitions and deletes", async () => {
    fetchMock.mockImplementation(async () => json({ name: "OFF-1" }));

    await transitionAdmissionOffering(
      "OFF-1",
      "Active",
      "2026-10-08T10:00:00.000Z",
    );
    await deleteAdmissionOffering("OFF-1", "2026-10-08T10:00:00.000Z");

    const [transition, remove] = fetchMock.mock.calls;
    expect(transition![0]).toBe(
      `${API}/api/v1/admission-offerings/OFF-1/transition`,
    );
    expect(JSON.parse(transition![1].body)).toEqual({
      status: "Active",
      expectedModified: "2026-10-08T10:00:00.000Z",
    });
    expect(remove![1].method).toBe("DELETE");
    expect(new URL(remove![0]).searchParams.get("expectedModified")).toBe(
      "2026-10-08T10:00:00.000Z",
    );
  });

  it("updates a score template with the record version", async () => {
    fetchMock.mockResolvedValue(
      json({ name: "TPL-1", template_name: "Mặc định" }),
    );

    await updateScoreTemplate("TPL-1", { template_name: "Mặc định" }, "v1");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/score-config/templates/TPL-1`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      data: { template_name: "Mặc định" },
      expected_modified: "v1",
    });
  });

  it("maps channel types to the dashboard shape", async () => {
    fetchMock.mockResolvedValue(
      json({
        channelTypes: [
          {
            code: "FACEBOOK",
            displayName: "Facebook",
            modes: ["ONLINE"],
            enabled: true,
            sortOrder: 1,
            description: "",
          },
        ],
        total: 1,
      }),
    );

    await expect(listCampaignChannelTypes()).resolves.toMatchObject({
      channel_types: [
        { code: "FACEBOOK", is_online: 1, is_offline: 0, enabled: 1 },
      ],
      total: 1,
    });
  });

  it("lists governed values of one catalog", async () => {
    fetchMock.mockResolvedValue(json({ records: [{ name: "HN" }], total: 1 }));

    await expect(listGovernedValues("CRM Campus")).resolves.toEqual({
      records: [{ name: "HN" }],
      total: 1,
    });
    expect(new URL(fetchMock.mock.calls[0]![0]).pathname).toBe(
      "/api/v1/governed-values/campus",
    );
  });

  it("surfaces API errors as admin catalog errors", async () => {
    fetchMock.mockResolvedValue(
      json(
        { error: { code: "REVISION_CONFLICT", message: "Đã thay đổi." } },
        409,
      ),
    );

    await expect(deleteAdmissionOffering("OFF-1", "old")).rejects.toEqual(
      expect.objectContaining<Partial<AdminCatalogApiError>>({
        name: "AdminCatalogApiError",
        status: 409,
        code: "REVISION_CONFLICT",
      }),
    );
  });
});
