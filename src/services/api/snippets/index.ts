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
  return request<ListSnippetsResponse>(METHODS.LIST, {
    ...options,
    query: {
      search: params.search?.trim(),
      owner: params.owner?.trim(),
      sharing: params.sharing,
    },
  });
}

export async function getSnippet(
  name: string,
  options: { baseUrl?: string } = {},
): Promise<SnippetRecord> {
  return request<SnippetRecord>(METHODS.GET, {
    ...options,
    query: { name },
  });
}

export async function createSnippet(
  draft: SnippetDraft,
  options: { baseUrl?: string } = {},
): Promise<SnippetRecord> {
  return request<SnippetRecord>(METHODS.CREATE, {
    ...options,
    body: { data: draft },
  });
}

export async function updateSnippet(
  name: string,
  draft: SnippetDraft,
  expectedModified?: string,
  options: { baseUrl?: string } = {},
): Promise<SnippetRecord> {
  return request<SnippetRecord>(METHODS.UPDATE, {
    ...options,
    body: { name, data: draft, expected_modified: expectedModified },
  });
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
