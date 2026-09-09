import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSegment,
  getSegmentAnalysis,
  getSegmentByCode,
  getSegmentFilterOptions,
  previewSegment,
} from "./index";

describe("Segment API service", () => {
  const originalFetch = globalThis.fetch;
  const baseUrl = "http://crm-test.local:8000";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("creates a segment with the Frappe data envelope", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            name: "a1b2c3d4",
            segment_code: "SEG-260909-7K4P2Q",
            title: "Tiềm năng cao",
          },
        }),
        { status: 200 },
      ),
    );

    const filters = {
      logic: "OR" as const,
      groups: [
        {
          logic: "AND" as const,
          name: "Tiềm năng cao",
          conditions: [
            {
              field: "potential" as const,
              operator: "=" as const,
              value: "HIGH",
            },
          ],
        },
      ],
    };
    const result = await createSegment(
      {
        title: "Tiềm năng cao",
        purpose: "Ưu tiên chăm sóc",
        category: "potential",
        segment_type: "dynamic",
        is_public: 0,
        filters,
      },
      { baseUrl },
    );

    expect(result.name).toBe("a1b2c3d4");
    expect(result.segment_code).toBe("SEG-260909-7K4P2Q");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/method/crm.api.student_segment.create_segment`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          data: {
            title: "Tiềm năng cao",
            purpose: "Ưu tiên chăm sóc",
            category: "potential",
            segment_type: "dynamic",
            is_public: 0,
            filters,
          },
        }),
      }),
    );
  });

  it("previews draft filters through the Frappe query contract", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            total: 2,
            total_students: 12,
            start: 0,
            page_length: 25,
            students: [],
          },
        }),
        { status: 200 },
      ),
    );

    const filters = {
      logic: "OR" as const,
      groups: [
        {
          logic: "AND" as const,
          conditions: [
            {
              field: "tag" as const,
              operator: "in" as const,
              value: ["TAG-OPEN-DAY"],
            },
          ],
        },
      ],
    };
    const result = await previewSegment(
      { filters, pageLength: 25 },
      { baseUrl },
    );

    expect(result.total).toBe(2);
    expect(result.total_students).toBe(12);
    const requestUrl = new URL(
      String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0]),
    );
    expect(requestUrl.pathname).toBe(
      "/api/method/crm.api.student_segment.preview_segment",
    );
    expect(JSON.parse(requestUrl.searchParams.get("filters") ?? "{}")).toEqual(
      filters,
    );
  });

  it("loads a segment directly by its immutable segment code", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            name: "a1b2c3d4",
            segment_code: "SEG-260909-7K4P2Q",
            title: "Tiềm năng cao",
            revision: 0,
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getSegmentByCode("SEG-260909-7K4P2Q", { baseUrl });

    expect(result.name).toBe("a1b2c3d4");
    const requestUrl = new URL(
      String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0]),
    );
    expect(requestUrl.pathname).toBe(
      "/api/method/crm.api.student_segment.get_segment_by_code",
    );
    expect(requestUrl.searchParams.get("segment_code")).toBe(
      "SEG-260909-7K4P2Q",
    );
  });

  it("loads permission-scoped segment analysis with selected codes", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            summary: { total: 2, active: 1, inactive: 0, archive: 0, draft: 1 },
            segments: [],
            selected_segments: [],
            overlap: { cells: [] },
            attention: [],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getSegmentAnalysis(["SEG-260909-7K4P2Q"], { baseUrl });

    expect(result.summary.total).toBe(2);
    const requestUrl = new URL(
      String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0]),
    );
    expect(requestUrl.pathname).toBe(
      "/api/method/crm.api.student_segment.get_segment_analysis",
    );
    expect(
      JSON.parse(requestUrl.searchParams.get("selected_segment_codes") ?? "[]"),
    ).toEqual(["SEG-260909-7K4P2Q"]);
  });

  it("loads fields and live Need/Tag dictionaries", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: [
              {
                fieldname: "potential",
                label: "Potential",
                fieldtype: "Select",
                options: "HIGH\nMEDIUM\nLOW",
                operators: ["=", "in"],
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: [] }), { status: 200 }),
      );

    const result = await getSegmentFilterOptions({ baseUrl });

    expect(result.fields[0]?.fieldname).toBe("potential");
    expect(result.needs).toEqual([]);
    expect(result.tags).toEqual([]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });
});
