/**
 * Translates the Frappe whitelisted method calls used by the message template
 * and snippet screens into NestJS REST calls, so those services keep their
 * own request shape and only swap transport.
 */
import { NestApiError, nestRequest } from "./nest-client";

const TEMPLATES = "/api/v1/message-templates";
const SNIPPETS = "/api/v1/snippets";

type Query = Record<string, string | undefined>;
type Body = Record<string, unknown> | undefined;

interface Route {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  /** Pick the payload out of the Nest envelope. */
  select?: (payload: never) => unknown;
}

const pickTemplate = (payload: { template: unknown }) => payload.template;
const deleted = (payload: { deleted?: string }) => ({
  name: payload.deleted ?? "",
  deleted: true,
});

function dataOf(body: Body): Record<string, unknown> {
  const data = body?.data;
  return data && typeof data === "object"
    ? (data as Record<string, unknown>)
    : {};
}

function route(method: string, query: Query, body: Body): Route | null {
  const name = String(body?.name ?? query.name ?? "");
  const id = encodeURIComponent(name);
  const expected =
    typeof body?.expected_modified === "string"
      ? body.expected_modified
      : undefined;

  switch (method.split(".").pop()) {
    case "list_message_templates":
      return { path: TEMPLATES, query };
    case "list_message_template_library":
      return { path: `${TEMPLATES}/library` };
    case "list_message_template_tokens":
      return { path: `${TEMPLATES}/tokens` };
    case "list_admin_message_template_library":
      return { path: `${TEMPLATES}/library/admin`, query };
    case "get_message_template":
      return { path: `${TEMPLATES}/${id}`, select: pickTemplate };
    case "create_message_template":
      return {
        path: TEMPLATES,
        method: "POST",
        body: dataOf(body),
        select: pickTemplate,
      };
    case "create_message_template_library":
      return {
        path: `${TEMPLATES}/library`,
        method: "POST",
        body: dataOf(body),
        select: pickTemplate,
      };
    case "update_message_template":
      return {
        path: `${TEMPLATES}/${id}`,
        method: "PATCH",
        body: { ...dataOf(body), expectedModified: expected },
        select: pickTemplate,
      };
    case "update_message_template_library":
      return {
        path: `${TEMPLATES}/library/${id}`,
        method: "PATCH",
        body: { ...dataOf(body), expectedModified: expected },
        select: pickTemplate,
      };
    case "delete_message_template":
      return {
        path: `${TEMPLATES}/${id}`,
        method: "DELETE",
        query: { expectedModified: expected },
        select: deleted,
      };
    case "delete_message_template_library":
      return {
        path: `${TEMPLATES}/library/${id}`,
        method: "DELETE",
        query: { expectedModified: expected },
        select: deleted,
      };
    case "list_message_template_preview_contacts":
      return {
        path: `${TEMPLATES}/preview-contacts`,
        query: {
          search: query.search,
          context: query.context,
          limit: query.page_length,
        },
      };
    case "preview_message_template":
      return {
        path: `${TEMPLATES}/preview`,
        method: "POST",
        body: {
          recordId: String(body?.record_id ?? body?.lead_id ?? ""),
          context: typeof body?.context === "string" ? body.context : "lead",
          data: body?.data,
        },
      };
    case "list_snippets":
      return { path: SNIPPETS, query };
    case "get_snippet":
      return { path: `${SNIPPETS}/${id}` };
    case "create_snippet":
      return {
        path: SNIPPETS,
        method: "POST",
        body: dataOf(body),
      };
    case "update_snippet":
      return {
        path: `${SNIPPETS}/${id}`,
        method: "PATCH",
        query: { expectedModified: expected },
        body: dataOf(body),
      };
    case "delete_snippet":
      return {
        path: `${SNIPPETS}/${id}`,
        method: "DELETE",
        query: { expectedModified: expected },
        select: deleted,
      };
    default:
      return null;
  }
}

export async function nestContentRequest<T>(
  method: string,
  options: { query?: Query; body?: Body },
): Promise<T> {
  const target = route(method, options.query ?? {}, options.body);
  if (!target) {
    throw new NestApiError(501, "NOT_PORTED", `${method} is not available.`);
  }
  const payload = await nestRequest<never>(target.path, {
    method: target.method ?? "GET",
    query: target.query,
    body: target.body,
  });
  return (target.select ? target.select(payload) : payload) as T;
}
