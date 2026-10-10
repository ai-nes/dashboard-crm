/**
 * Notes (`crm.api.note.*`) and tasks (`crm.api.task.*`) served by the Nest API.
 * Parameters arrive in snake_case form and leave as REST calls.
 */
import { NestApiError, nestRequest } from "./nest-client";

type Params = Record<string, unknown>;

const NOTES = "/api/v1/notes";
const TASKS = "/api/v1/tasks";

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value !== "" ? value : undefined;
const number = (value: unknown): number | undefined =>
  value === undefined || value === null || value === ""
    ? undefined
    : Number(value);

function id(params: Params): string {
  return encodeURIComponent(String(params.name ?? ""));
}

/** Task body: only the fields that were actually sent, in the Nest spelling. */
function taskBody(params: Params, keys: Record<string, string>) {
  const body: Record<string, unknown> = {};
  for (const [source, target] of Object.entries(keys)) {
    if (params[source] !== undefined) body[target] = params[source];
  }
  return body;
}

const TASK_FIELDS = {
  title: "title",
  description: "description",
  priority: "priority",
  status: "status",
  start_date: "startDate",
  due_date: "dueDate",
  assigned_to: "assignedTo",
};

export async function nestActivityRequest<T>(
  method: string,
  params: Params,
): Promise<T> {
  const action = method.split(".").pop() ?? "";
  const send = (path: string, init: Parameters<typeof nestRequest>[1] = {}) =>
    nestRequest<unknown>(path, init) as Promise<T>;

  switch (action) {
    case "list_notes":
      return send(NOTES, {
        query: {
          referenceDoctype: text(params.reference_doctype),
          referenceDocname: text(params.reference_docname),
          search: text(params.search),
          start: number(params.start),
          pageLength: number(params.page_length),
        },
      });
    case "get_note":
      return send(`${NOTES}/${id(params)}`);
    case "create_note":
      return send(NOTES, {
        method: "POST",
        body: {
          referenceDoctype: params.reference_doctype,
          referenceDocname: params.reference_docname,
          content: params.content ?? "",
        },
      });
    case "update_note":
      return send(`${NOTES}/${id(params)}`, {
        method: "PATCH",
        body: { content: params.content },
      });
    case "delete_note":
      return send(`${NOTES}/${id(params)}`, { method: "DELETE" });

    case "list_tasks":
      return send(TASKS, {
        query: {
          referenceDoctype: text(params.reference_doctype),
          referenceDocname: text(params.reference_docname),
          search: text(params.search),
          status: text(params.status),
          start: number(params.start),
          pageLength: number(params.page_length),
        },
      });
    case "get_task":
      return send(`${TASKS}/${id(params)}`);
    case "create_task":
      return send(TASKS, {
        method: "POST",
        body: {
          referenceDoctype: params.reference_doctype,
          referenceDocname: params.reference_docname,
          actionCode: params.action_code,
          ...taskBody(params, TASK_FIELDS),
        },
      });
    case "update_task":
      return send(`${TASKS}/${id(params)}`, {
        method: "PATCH",
        body: taskBody(params, TASK_FIELDS),
      });
    case "delete_task":
      return send(`${TASKS}/${id(params)}`, { method: "DELETE" });
    default:
      throw new NestApiError(501, "NOT_PORTED", `${action} is not available.`);
  }
}
