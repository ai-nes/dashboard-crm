import { NestApiError } from "../nest/nest-client";
import { nestActivityRequest } from "../nest/nest-activity-router";
import type {
  CreateNotePayload,
  CRMNote,
  ListNotesParams,
  ListNotesResponse,
  UpdateNotePayload,
} from "./types";

export type * from "./types";

const METHODS = {
  LIST_NOTES: "crm.api.note.list_notes",
  GET_NOTE: "crm.api.note.get_note",
  CREATE_NOTE: "crm.api.note.create_note",
  UPDATE_NOTE: "crm.api.note.update_note",
  DELETE_NOTE: "crm.api.note.delete_note",
} as const;

export class CrmNoteApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CrmNoteApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeCRMNote(raw: unknown): CRMNote {
  const obj = asRecord(raw) || {};
  return {
    name: String(obj.name || ""),
    content: String(obj.content || ""),
    referenceDoctype: (obj.reference_doctype ||
      obj.referenceDoctype ||
      "CRM Lead") as CRMNote["referenceDoctype"],
    referenceDocname: String(
      obj.reference_docname || obj.referenceDocname || "",
    ),
    modified: obj.modified ? String(obj.modified) : undefined,
    creation: obj.creation ? String(obj.creation) : undefined,
    owner: obj.owner ? String(obj.owner) : undefined,
    ownerFullName:
      obj.owner_full_name || obj.ownerFullName
        ? String(obj.owner_full_name || obj.ownerFullName)
        : undefined,
    modifiedBy:
      obj.modified_by || obj.modifiedBy
        ? String(obj.modified_by || obj.modifiedBy)
        : undefined,
  };
}

async function callNoteApi<T>(
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  try {
    return await nestActivityRequest<T>(method, body);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new CrmNoteApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

/**
 * Lấy danh sách ghi chú của CRM Student hoặc CRM Student
 */
export async function listNotes(
  params: ListNotesParams,
): Promise<ListNotesResponse> {
  const body: Record<string, unknown> = {
    reference_doctype: params.referenceDoctype,
    reference_docname: params.referenceDocname,
    start: params.start ?? 0,
    page_length: params.pageLength ?? 20,
  };
  if (params.search) {
    body.search = params.search;
  }

  const raw = await callNoteApi<{
    total?: number;
    start?: number;
    page_length?: number;
    notes?: unknown[];
  }>(METHODS.LIST_NOTES, body);

  const rawNotes = Array.isArray(raw?.notes) ? raw.notes : [];
  return {
    total: typeof raw?.total === "number" ? raw.total : rawNotes.length,
    start: typeof raw?.start === "number" ? raw.start : (params.start ?? 0),
    pageLength:
      typeof raw?.page_length === "number"
        ? raw.page_length
        : (params.pageLength ?? 20),
    notes: rawNotes.map(normalizeCRMNote),
  };
}

/**
 * Lấy chi tiết một ghi chú theo ID/name
 */
export async function getNote(name: string): Promise<CRMNote> {
  const raw = await callNoteApi<unknown>(METHODS.GET_NOTE, { name });
  return normalizeCRMNote(raw);
}

/**
 * Tạo mới ghi chú cho Student hoặc Contact
 */
export async function createNote(payload: CreateNotePayload): Promise<CRMNote> {
  const body: Record<string, unknown> = {
    reference_doctype: payload.referenceDoctype,
    reference_docname: payload.referenceDocname,
  };
  if (payload.content !== undefined) {
    body.content = payload.content;
  }

  const raw = await callNoteApi<unknown>(METHODS.CREATE_NOTE, body);
  return normalizeCRMNote(raw);
}

/**
 * Cập nhật nội dung ghi chú
 */
export async function updateNote(payload: UpdateNotePayload): Promise<CRMNote> {
  const body: Record<string, unknown> = {
    name: payload.name,
  };
  if (payload.content !== undefined) {
    body.content = payload.content;
  }

  const raw = await callNoteApi<unknown>(METHODS.UPDATE_NOTE, body);
  return normalizeCRMNote(raw);
}

/**
 * Xóa ghi chú
 */
export async function deleteNote(name: string): Promise<{ success: boolean }> {
  await callNoteApi<unknown>(METHODS.DELETE_NOTE, { name });
  return { success: true };
}
