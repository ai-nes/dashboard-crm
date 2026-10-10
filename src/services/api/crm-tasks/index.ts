import { NestApiError } from "../nest/nest-client";
import { nestActivityRequest } from "../nest/nest-activity-router";
import type {
  CRMTask,
  CRMTaskPriority,
  CRMTaskStatus,
  CreateTaskPayload,
  DeleteTaskResponse,
  ListTasksParams,
  ListTasksResponse,
  UpdateTaskPayload,
} from "./types";

export type * from "./types";
export * from "./presentation";

const METHODS = {
  LIST_TASKS: "crm.api.task.list_tasks",
  GET_TASK: "crm.api.task.get_task",
  CREATE_TASK: "crm.api.task.create_task",
  UPDATE_TASK: "crm.api.task.update_task",
  DELETE_TASK: "crm.api.task.delete_task",
} as const;

export class CrmTaskApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CrmTaskApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizePriority(value: unknown): CRMTaskPriority | undefined {
  return value === "Low" || value === "Medium" || value === "High"
    ? value
    : undefined;
}

function normalizeStatus(value: unknown): CRMTaskStatus | undefined {
  return value === "Backlog" ||
    value === "Todo" ||
    value === "In Progress" ||
    value === "Done" ||
    value === "Canceled"
    ? value
    : undefined;
}

function optionalString(value: unknown): string | undefined {
  return value === null || value === undefined || value === ""
    ? undefined
    : String(value);
}

function normalizeCRMTask(raw: unknown): CRMTask {
  const obj = asRecord(raw) || {};
  return {
    name: String(obj.name || ""),
    title: String(obj.title || ""),
    description: optionalString(obj.description),
    actionCode: optionalString(obj.action_code ?? obj.actionCode),
    student: optionalString(obj.student),
    linkedInteraction: optionalString(
      obj.linked_interaction ?? obj.linkedInteraction,
    ),
    priority: normalizePriority(obj.priority),
    startDate: optionalString(obj.start_date ?? obj.startDate),
    assignedTo: optionalString(obj.assigned_to ?? obj.assignedTo),
    status: normalizeStatus(obj.status),
    dueDate: optionalString(obj.due_date ?? obj.dueDate),
    referenceDoctype: (obj.reference_doctype ||
      obj.referenceDoctype ||
      "CRM Student") as CRMTask["referenceDoctype"],
    referenceDocname: String(
      obj.reference_docname || obj.referenceDocname || "",
    ),
    owner: optionalString(obj.owner),
    creation: optionalString(obj.creation),
    modified: optionalString(obj.modified),
  };
}

async function callTaskApi<T>(
  method: string,
  query: Record<string, string | number | undefined> = {},
  body?: Record<string, unknown>,
): Promise<T> {
  try {
    return await nestActivityRequest<T>(method, { ...query, ...body });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new CrmTaskApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

function toCreateBody(payload: CreateTaskPayload): Record<string, unknown> {
  return {
    reference_doctype: payload.referenceDoctype,
    reference_docname: payload.referenceDocname,
    title: payload.title,
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
    ...(payload.actionCode !== undefined
      ? { action_code: payload.actionCode }
      : {}),
    ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
    ...(payload.startDate !== undefined
      ? { start_date: payload.startDate }
      : {}),
    ...(payload.assignedTo !== undefined
      ? { assigned_to: payload.assignedTo }
      : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.dueDate !== undefined ? { due_date: payload.dueDate } : {}),
    ...(payload.linkedInteraction !== undefined
      ? { linked_interaction: payload.linkedInteraction }
      : {}),
  };
}

function toUpdateBody(payload: UpdateTaskPayload): Record<string, unknown> {
  return {
    name: payload.name,
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
    ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
    ...(payload.startDate !== undefined
      ? { start_date: payload.startDate }
      : {}),
    ...(payload.assignedTo !== undefined
      ? { assigned_to: payload.assignedTo }
      : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.dueDate !== undefined ? { due_date: payload.dueDate } : {}),
    ...(payload.linkedInteraction !== undefined
      ? { linked_interaction: payload.linkedInteraction }
      : {}),
  };
}

export async function listTasks(
  params: ListTasksParams,
): Promise<ListTasksResponse> {
  const raw = await callTaskApi<{
    total?: number;
    start?: number;
    page_length?: number;
    tasks?: unknown[];
  }>(METHODS.LIST_TASKS, {
    reference_doctype: params.referenceDoctype,
    reference_docname: params.referenceDocname,
    search: params.search,
    status: params.status,
    start: params.start ?? 0,
    page_length: params.pageLength ?? 20,
  });

  const rawTasks = Array.isArray(raw?.tasks) ? raw.tasks : [];
  return {
    total: typeof raw?.total === "number" ? raw.total : rawTasks.length,
    start: typeof raw?.start === "number" ? raw.start : (params.start ?? 0),
    pageLength:
      typeof raw?.page_length === "number"
        ? raw.page_length
        : (params.pageLength ?? 20),
    tasks: rawTasks.map(normalizeCRMTask),
  };
}

export async function getTask(name: string): Promise<CRMTask> {
  const raw = await callTaskApi<unknown>(METHODS.GET_TASK, { name });
  return normalizeCRMTask(raw);
}

export async function createTask(payload: CreateTaskPayload): Promise<CRMTask> {
  const raw = await callTaskApi<unknown>(
    METHODS.CREATE_TASK,
    {},
    toCreateBody(payload),
  );
  return normalizeCRMTask(raw);
}

export async function updateTask(payload: UpdateTaskPayload): Promise<CRMTask> {
  const raw = await callTaskApi<unknown>(
    METHODS.UPDATE_TASK,
    {},
    toUpdateBody(payload),
  );
  return normalizeCRMTask(raw);
}

export async function deleteTask(name: string): Promise<DeleteTaskResponse> {
  const raw = await callTaskApi<{ deleted?: unknown }>(METHODS.DELETE_TASK, {
    name,
  });
  return { deleted: String(raw?.deleted ?? name) };
}
