import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSegment,
  deleteClassificationTerm,
  getSegmentAnalysis,
  getSegmentByCode,
  getSegmentFilterOptions,
  previewSegment,
  SegmentApiError,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("Segment API service", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("creates a segment with the data envelope", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        name: "a1b2c3d4",
        segment_code: "SEG-260909-7K4P2Q",
        title: "Tiềm năng cao",
      }),
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
    const data = {
      title: "Tiềm năng cao",
      purpose: "Ưu tiên chăm sóc",
      category: "potential",
      segment_type: "dynamic" as const,
      is_public: 0,
      filters,
    };

    const result = await createSegment(data);

    expect(result.name).toBe("a1b2c3d4");
    expect(result.segment_code).toBe("SEG-260909-7K4P2Q");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/segments`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ data });
  });

  it("previews draft filters", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        total: 2,
        total_students: 12,
        start: 0,
        page_length: 25,
        students: [],
      }),
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

    const result = await previewSegment({
      filters,
      search: "Classification",
      pageLength: 25,
    });

    expect(result.total).toBe(2);
    expect(result.total_students).toBe(12);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(new URL(url).pathname).toBe("/api/v1/segments/preview");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({
      filters,
      search: "Classification",
      pageLength: 25,
    });
  });

  it("loads a segment directly by its immutable segment code", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        name: "a1b2c3d4",
        segment_code: "SEG-260909-7K4P2Q",
        title: "Tiềm năng cao",
        revision: 0,
      }),
    );

    const result = await getSegmentByCode("SEG-260909-7K4P2Q");

    expect(result.name).toBe("a1b2c3d4");
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/segments/by-code/SEG-260909-7K4P2Q`,
    );
  });

  it("loads permission-scoped segment analysis with selected codes", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        summary: { total: 2, active: 1, inactive: 0, archive: 0, draft: 1 },
        segments: [],
        selected_segments: [],
        overlap: { cells: [] },
        attention: [],
      }),
    );

    const result = await getSegmentAnalysis(["SEG-260909-7K4P2Q"]);

    expect(result.summary.total).toBe(2);
    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/segments/analysis");
    expect(url.searchParams.get("selectedCodes")).toBe("SEG-260909-7K4P2Q");
  });

  it("loads fields and live need/tag dictionaries", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/segments/fields")
        ? json([
            {
              fieldname: "potential",
              label: "Potential",
              fieldtype: "Select",
              options: "HIGH\nMEDIUM\nLOW",
              operators: ["=", "in"],
            },
          ])
        : json({ terms: [], total: 0 }),
    );

    const result = await getSegmentFilterOptions();

    expect(result.fields[0]?.fieldname).toBe("potential");
    expect(result.needs).toEqual([]);
    expect(result.tags).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("surfaces the API reason for delete failures", async () => {
    fetchMock.mockImplementation(async () =>
      json(
        {
          error: {
            code: "INVALID_INPUT",
            message:
              "Need đang được học sinh sử dụng; hãy lưu trữ thay vì xoá.",
          },
        },
        409,
      ),
    );

    const failure = deleteClassificationTerm("need", {
      name: "NEED_TEST",
      expectedRevision: 1,
    });

    await expect(failure).rejects.toBeInstanceOf(SegmentApiError);
    await expect(failure).rejects.toMatchObject({
      status: 409,
      message: "Need đang được học sinh sử dụng; hãy lưu trữ thay vì xoá.",
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("DELETE");
    expect(new URL(url).pathname).toBe(
      "/api/v1/classification/terms/need/NEED_TEST",
    );
    expect(new URL(url).searchParams.get("expectedRevision")).toBe("1");
  });
});
