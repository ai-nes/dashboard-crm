/**
 * Maps the segment and need/tag classification methods onto the NestJS
 * API, including the per-student classification calls.
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
    default:
      return nestClassificationRequest<T>(method, query, body);
  }
}

type Kind = "need" | "tag";
const CLASSIFICATION = "/api/v1/classification";

/** `""` means "any status" to the legacy operations; Nest spells it `all`. */
const statusOf = (value: unknown) => (value ? String(value) : "all");

function kindOf(method: string): Kind | null {
  if (/need/.test(method)) return "need";
  if (/tag/.test(method)) return "tag";
  return null;
}

async function nestClassificationRequest<T>(
  method: string,
  query: Query,
  body: Body,
): Promise<T> {
  const action = method.split(".").pop() ?? "";
  const kind = kindOf(action);
  const send = (path: string, init: Parameters<typeof nestRequest>[1] = {}) =>
    nestRequest<unknown>(path, init) as Promise<T>;
  const paging = {
    status: statusOf(query.status),
    group: query.group as string | undefined,
    start: query.start,
    page_length: query.page_length,
  };
  const name = encodeURIComponent(String(body?.name ?? ""));
  const revisionBody = (extra: Record<string, unknown> = {}) => ({
    expectedRevision: Number(body?.expected_revision),
    ...extra,
  });

  if (!kind) {
    throw new NestApiError(501, "NOT_PORTED", `${action} is not available.`);
  }
  const isGroup = /group/.test(action);

  // Reads.
  if (action.startsWith("list_")) {
    if (action === "list_tag_groups") {
      return send(`${CLASSIFICATION}/tag-groups`, { query: paging });
    }
    if (isGroup) {
      const page = (await nestRequest<{ groups: unknown[] }>(
        `${CLASSIFICATION}/groups/${kind}`,
        { query: paging },
      )) as { groups: unknown[] } & Record<string, unknown>;
      return (action.endsWith("_page") ? page : page.groups) as T;
    }
    const page = (await nestRequest<{ terms: unknown[] }>(
      `${CLASSIFICATION}/terms/${kind}`,
      { query: paging },
    )) as { terms: unknown[]; total: number };
    if (action.endsWith("_page")) {
      return {
        [kind === "need" ? "needs" : "tags"]: page.terms,
        total: page.total,
        start: Number(query.start ?? 0),
        page_length: Number(query.page_length ?? 20),
      } as T;
    }
    return page.terms as T;
  }

  const base = `${CLASSIFICATION}/${isGroup ? "groups" : "terms"}/${kind}`;
  if (action.startsWith("create_")) {
    return send(base, { method: "POST", body: { data: body?.data } });
  }
  if (action.startsWith("update_")) {
    return send(`${base}/${name}`, {
      method: "PATCH",
      body: revisionBody({ data: body?.data }),
    });
  }
  if (action.startsWith("transition_")) {
    return send(`${base}/${name}/transition`, {
      method: "POST",
      body: revisionBody({ status: body?.status }),
    });
  }
  if (action.startsWith("delete_")) {
    return send(`${base}/${name}`, {
      method: "DELETE",
      query: { expectedRevision: Number(body?.expected_revision) },
    });
  }
  throw new NestApiError(501, "NOT_PORTED", `${action} is not available.`);
}

/** Per-student classification calls (`crm.api.student_classification.*`). */
export async function nestStudentClassificationRequest<T>(
  method: string,
  params: Record<string, string | undefined>,
): Promise<T> {
  const action = method.split(".").pop() ?? "";
  const student = encodeURIComponent(params.student ?? "");
  const expected = params.expected_modified ?? "";
  const send = (path: string, init: Parameters<typeof nestRequest>[1] = {}) =>
    nestRequest<unknown>(path, init) as Promise<T>;

  switch (action) {
    case "get_classifications":
      return send(`/api/v1/students/${student}/classifications`);
    case "list_tag_groups":
      return send(`${CLASSIFICATION}/tag-groups`, {
        query: {
          status: statusOf(params.status),
          page_length: params.page_length,
        },
      });
    case "add_student_tag":
      return send(`/api/v1/students/${student}/tags`, {
        method: "POST",
        body: { tag: params.tag, expectedModified: expected },
      });
    case "remove_student_tag":
      return send(
        `/api/v1/students/${student}/tags/${encodeURIComponent(params.tag ?? "")}`,
        { method: "DELETE", query: { expectedModified: expected } },
      );
    case "update_student_tag":
      return send(
        `/api/v1/students/${student}/tags/${encodeURIComponent(params.tag ?? "")}`,
        {
          method: "PATCH",
          body: { newTagId: params.new_tag, expectedModified: expected },
        },
      );
    default:
      throw new NestApiError(501, "NOT_PORTED", `${action} is not available.`);
  }
}
