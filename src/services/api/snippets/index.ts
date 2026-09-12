import { getCsrfToken } from "../auth";
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

const DEFAULT_FRAPPE_URL = "http://localhost:8001";
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

function baseUrl(value?: string): string {
  return (
    value ??
    process.env.NEXT_PUBLIC_FRAPPE_URL ??
    DEFAULT_FRAPPE_URL
  ).replace(/\/+$/, "");
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

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message ?? value;
}

function errorMessage(payload: unknown, status: number): string {
  const root = asRecord(payload);
  const error = asRecord(root?.error);
  const message = asRecord(root?.message);
  const directMessage =
    (typeof error?.message === "string" && error.message) ||
    (typeof message?.message === "string" && message.message) ||
    (typeof root?.message === "string" && root.message) ||
    (typeof root?.exception === "string" && root.exception);

  return directMessage || `Thao tác snippet thất bại (HTTP ${status}).`;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function request<T>(
  method: string,
  options: {
    baseUrl?: string;
    query?: Record<string, string | undefined>;
    body?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const root = baseUrl(options.baseUrl);
  const url = new URL(`${root}/api/method/${method}`);
  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  });

  const isWrite = options.body !== undefined;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isWrite ? { "Content-Type": "application/json" } : {}),
  };
  if (isWrite) {
    const csrfToken = await getCsrfToken(root);
    if (csrfToken) headers["X-Frappe-CSRF-Token"] = csrfToken;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: isWrite ? "POST" : "GET",
      credentials: "include",
      headers,
      ...(isWrite ? { body: JSON.stringify(options.body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new SnippetsApiError(
      503,
      "SNIPPETS_UNAVAILABLE",
      "Không thể kết nối đến máy chủ CRM.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new SnippetsApiError(
      response.status,
      `HTTP_${response.status}`,
      errorMessage(payload, response.status),
    );
  }
  return unwrapMessage(payload) as T;
}

export async function listSnippets(
  params: ListSnippetsParams = {},
  options: { baseUrl?: string } = {},
): Promise<ListSnippetsResponse> {
  const response = await request<unknown>(METHODS.LIST, {
    ...options,
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

export async function getSnippet(
  name: string,
  options: { baseUrl?: string } = {},
): Promise<SnippetRecord> {
  const response = await request<unknown>(METHODS.GET, {
    ...options,
    query: { name },
  });
  return normalizeSnippet(response);
}

export async function createSnippet(
  draft: SnippetDraft,
  options: { baseUrl?: string } = {},
): Promise<SnippetRecord> {
  const response = await request<unknown>(METHODS.CREATE, {
    ...options,
    body: { data: draft },
  });
  return normalizeSnippet(response);
}

export async function updateSnippet(
  name: string,
  draft: SnippetDraft,
  expectedModified?: string,
  options: { baseUrl?: string } = {},
): Promise<SnippetRecord> {
  const response = await request<unknown>(METHODS.UPDATE, {
    ...options,
    body: { name, data: draft, expected_modified: expectedModified },
  });
  return normalizeSnippet(response);
}

export async function deleteSnippet(
  name: string,
  expectedModified?: string,
  options: { baseUrl?: string } = {},
): Promise<DeleteSnippetResponse> {
  return request<DeleteSnippetResponse>(METHODS.DELETE, {
    ...options,
    body: { name, expected_modified: expectedModified },
  });
}
