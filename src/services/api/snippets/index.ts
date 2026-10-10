import { nestContentRequest } from "../nest/nest-content-router";
import { NestApiError } from "../nest/nest-client";
import type {
  DeleteSnippetResponse,
  ListSnippetsParams,
  ListSnippetsResponse,
  SnippetDraft,
  SnippetRecord,
} from "./types";

export type * from "./types";

const METHODS = {
  LIST: "crm.api.snippets.list_snippets",
  GET: "crm.api.snippets.get_snippet",
  CREATE: "crm.api.snippets.create_snippet",
  UPDATE: "crm.api.snippets.update_snippet",
  DELETE: "crm.api.snippets.delete_snippet",
} as const;

const DEFAULT_PAGE_SIZE = 5;

export class SnippetsApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "SnippetsApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeSnippet(value: unknown): SnippetRecord {
  const record = asRecord(value) ?? {};
  const canEdit = record.canEdit;

  return {
    id: String(record.id ?? record.name ?? ""),
    code: String(record.code ?? record.id ?? record.name ?? ""),
    internalName: String(record.internalName ?? record.internal_name ?? ""),
    snippetText: String(
      record.snippetText ?? record.snippet_text ?? record.content ?? "",
    ),
    shortcut: String(record.shortcut ?? ""),
    ownerId: String(record.ownerId ?? record.owner_id ?? ""),
    owner: String(record.owner ?? ""),
    sharing: record.sharing === "private" ? "private" : "public",
    createdAt: String(record.createdAt ?? record.created_at ?? ""),
    modifiedAt: String(record.modifiedAt ?? record.modified_at ?? ""),
    canEdit: canEdit === true || canEdit === 1 || canEdit === "1",
  };
}

function normalizeSnippetOwner(value: unknown): { id: string; name: string } {
  const record = asRecord(value) ?? {};
  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? record.full_name ?? record.id ?? ""),
  };
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function request<T>(
  method: string,
  options: {
    query?: Record<string, string | undefined>;
    body?: Record<string, unknown>;
  } = {},
): Promise<T> {
  try {
    return await nestContentRequest<T>(method, options);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new SnippetsApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

export async function listSnippets(
  params: ListSnippetsParams = {},
): Promise<ListSnippetsResponse> {
  const response = await request<unknown>(METHODS.LIST, {
    query: {
      search: params.search?.trim(),
      owner: params.owner?.trim(),
      sharing: params.sharing,
      scope: params.scope,
      page: params.page ? String(params.page) : undefined,
      pageSize: params.pageSize ? String(params.pageSize) : undefined,
    },
  });
  const record = asRecord(response) ?? {};
  const snippets = Array.isArray(record.snippets)
    ? record.snippets.map(normalizeSnippet)
    : [];
  const owners = Array.isArray(record.owners)
    ? record.owners.map(normalizeSnippetOwner)
    : [];
  const total = Number.isFinite(Number(record.total))
    ? Number(record.total)
    : snippets.length;
  const pageSize = positiveInteger(
    record.pageSize ?? record.page_size ?? params.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const page = positiveInteger(record.page, params.page ?? 1);
  const totalPages = positiveInteger(
    record.totalPages ?? record.total_pages,
    Math.max(1, Math.ceil(total / pageSize)),
  );

  return {
    snippets,
    owners,
    total,
    totalAll: Number.isFinite(Number(record.totalAll))
      ? Number(record.totalAll)
      : total,
    totalMine: Number.isFinite(Number(record.totalMine))
      ? Number(record.totalMine)
      : 0,
    page,
    pageSize,
    totalPages,
    hasNextPage:
      typeof record.hasNextPage === "boolean"
        ? record.hasNextPage
        : page < totalPages,
  };
}

export async function getSnippet(name: string): Promise<SnippetRecord> {
  const response = await request<unknown>(METHODS.GET, {
    query: { name },
  });
  return normalizeSnippet(response);
}

export async function createSnippet(
  draft: SnippetDraft,
): Promise<SnippetRecord> {
  const response = await request<unknown>(METHODS.CREATE, {
    body: { data: draft },
  });
  return normalizeSnippet(response);
}

export async function updateSnippet(
  name: string,
  draft: SnippetDraft,
  expectedModified?: string,
): Promise<SnippetRecord> {
  const response = await request<unknown>(METHODS.UPDATE, {
    body: { name, data: draft, expected_modified: expectedModified },
  });
  return normalizeSnippet(response);
}

export async function deleteSnippet(
  name: string,
  expectedModified?: string,
): Promise<DeleteSnippetResponse> {
  return request<DeleteSnippetResponse>(METHODS.DELETE, {
    body: { name, expected_modified: expectedModified },
  });
}
