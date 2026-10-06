/**
 * Maps the Frappe segment methods onto the NestJS segment API. Need/tag
 * classification is not ported yet, so term lists are empty and their
 * management calls report that they are unavailable.
 */
import { NestApiError, nestRequest } from "./nest-client";

const SEGMENTS = "/api/v1/segments";

type Query = Record<string, string | number | undefined>;
type Body = Record<string, unknown> | undefined;

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return undefined;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

export async function nestSegmentRequest<T>(
  method: string,
  query: Query,
  body: Body,
): Promise<T> {
  const name = encodeURIComponent(String(body?.name ?? query.name ?? ""));
  const send = (path: string, init: Parameters<typeof nestRequest>[1] = {}) =>
    nestRequest<unknown>(path, init) as Promise<T>;

  switch (method.split(".").pop()) {
    case "get_fields":
      return send(`${SEGMENTS}/fields`);
    case "list_segments_page":
      return send(SEGMENTS, { query });
    case "list_segments": {
      const page = (await nestRequest<{ segments: unknown[] }>(SEGMENTS, {
        query,
      })) as { segments: unknown[] };
      return page.segments as T;
    }
    case "get_segment":
      return send(`${SEGMENTS}/${name}`);
    case "get_segment_by_code":
      return send(
        `${SEGMENTS}/by-code/${encodeURIComponent(String(query.segment_code ?? ""))}`,
      );
    case "get_segment_analysis": {
      const codes = parseJson(query.selected_segment_codes);
      return send(`${SEGMENTS}/analysis`, {
        query: {
          selectedCodes: Array.isArray(codes) ? codes.join(",") : undefined,
        },
      });
    }
    case "preview_segment":
      return send(`${SEGMENTS}/preview`, {
        method: "POST",
        body: {
          segment: query.segment,
          filters: parseJson(query.filters),
          search: query.search,
          start: Number(query.start ?? 0),
          pageLength: Number(query.page_length ?? 25),
        },
      });
    case "create_segment":
      return send(SEGMENTS, { method: "POST", body: { data: body?.data } });
    case "update_segment":
      return send(`${SEGMENTS}/${name}`, {
        method: "PATCH",
        body: {
          expectedRevision: Number(body?.expected_revision),
          data: body?.data,
        },
      });
    case "transition_segment":
      return send(`${SEGMENTS}/${name}/transition`, {
        method: "POST",
        body: {
          status: body?.status,
          expectedRevision: Number(body?.expected_revision),
        },
      });
    case "delete_segment":
      return send(`${SEGMENTS}/${name}`, {
        method: "DELETE",
        query: { expectedRevision: Number(body?.expected_revision) },
      });
    case "list_needs":
    case "list_tags":
      return [] as T;
    default:
      throw new NestApiError(
        501,
        "NOT_PORTED",
        "Chức năng phân loại nhu cầu/thẻ chưa có trên backend mới.",
      );
  }
}
