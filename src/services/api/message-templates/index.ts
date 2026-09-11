import { getCsrfToken } from "../auth";
import type {
  DeleteMessageTemplateResponse,
  ListMessageTemplatesParams,
  ListMessageTemplatesResponse,
  ListMessageTemplatePreviewContactsResponse,
  MessageTemplateDraft,
  MessageTemplateRecord,
  MessageTemplatePreviewResponse,
} from "./types";

export type * from "./types";

const METHODS = {
  LIST: "crm.api.message_templates.list_message_templates",
  LIBRARY: "crm.api.message_templates.list_message_template_library",
  ADMIN_LIBRARY: "crm.api.message_templates.list_admin_message_template_library",
  GET: "crm.api.message_templates.get_message_template",
  CREATE: "crm.api.message_templates.create_message_template",
  CREATE_LIBRARY: "crm.api.message_templates.create_message_template_library",
  UPDATE: "crm.api.message_templates.update_message_template",
  UPDATE_LIBRARY: "crm.api.message_templates.update_message_template_library",
  DELETE: "crm.api.message_templates.delete_message_template",
  DELETE_LIBRARY: "crm.api.message_templates.delete_message_template_library",
  PREVIEW_CONTACTS: "crm.api.message_templates.list_message_template_preview_contacts",
  PREVIEW: "crm.api.message_templates.preview_message_template",
} as const;

const DEFAULT_FRAPPE_URL = "http://localhost:8001";

export class MessageTemplatesApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "MessageTemplatesApiError";
  }
}

function baseUrl(value?: string): string {
  return (value ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? DEFAULT_FRAPPE_URL).replace(
    /\/+$/,
    "",
  );
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

  return directMessage || `Thao tác mẫu email thất bại (HTTP ${status}).`;
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

  const isWrite = Boolean(options.body);
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
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new MessageTemplatesApiError(
      503,
      "MESSAGE_TEMPLATES_UNAVAILABLE",
      "Không thể kết nối đến máy chủ CRM.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new MessageTemplatesApiError(
      response.status,
      `HTTP_${response.status}`,
      errorMessage(payload, response.status),
    );
  }
  return unwrapMessage(payload) as T;
}

export async function listMessageTemplates(
  params: ListMessageTemplatesParams = {},
  options: { baseUrl?: string } = {},
): Promise<ListMessageTemplatesResponse> {
  return request<ListMessageTemplatesResponse>(METHODS.LIST, {
    ...options,
    query: { search: params.search?.trim(), owner: params.owner?.trim() },
  });
}

export async function listMessageTemplateLibrary(
  options: { baseUrl?: string } = {},
): Promise<ListMessageTemplatesResponse> {
  return request<ListMessageTemplatesResponse>(METHODS.LIBRARY, options);
}

export async function listAdminMessageTemplateLibrary(
  options: { baseUrl?: string } = {},
): Promise<ListMessageTemplatesResponse> {
  return request<ListMessageTemplatesResponse>(METHODS.ADMIN_LIBRARY, options);
}

export async function listMessageTemplatePreviewContacts(
  params: { search?: string; pageLength?: number } = {},
  options: { baseUrl?: string } = {},
): Promise<ListMessageTemplatePreviewContactsResponse> {
  return request<ListMessageTemplatePreviewContactsResponse>(METHODS.PREVIEW_CONTACTS, {
    ...options,
    query: {
      search: params.search?.trim(),
      page_length: params.pageLength ? String(params.pageLength) : undefined,
    },
  });
}

export async function previewMessageTemplate(
  leadId: string,
  draft: Pick<MessageTemplateDraft, "subject" | "body">,
  options: { baseUrl?: string } = {},
): Promise<MessageTemplatePreviewResponse> {
  return request<MessageTemplatePreviewResponse>(METHODS.PREVIEW, {
    ...options,
    body: { lead_id: leadId, data: draft },
  });
}

export async function getMessageTemplate(
  name: string,
  options: { baseUrl?: string } = {},
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.GET, {
    ...options,
    query: { name },
  });
}

export async function createMessageTemplate(
  draft: MessageTemplateDraft,
  options: { baseUrl?: string } = {},
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.CREATE, {
    ...options,
    body: { data: draft },
  });
}

export async function createMessageTemplateLibrary(
  draft: MessageTemplateDraft,
  options: { baseUrl?: string } = {},
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.CREATE_LIBRARY, {
    ...options,
    body: { data: { name: draft.name, subject: draft.subject, body: draft.body } },
  });
}

export async function updateMessageTemplate(
  name: string,
  draft: MessageTemplateDraft,
  expectedModified?: string,
  options: { baseUrl?: string } = {},
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.UPDATE, {
    ...options,
    body: { name, data: draft, expected_modified: expectedModified },
  });
}

export async function updateMessageTemplateLibrary(
  name: string,
  draft: MessageTemplateDraft,
  expectedModified?: string,
  options: { baseUrl?: string } = {},
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.UPDATE_LIBRARY, {
    ...options,
    body: {
      name,
      data: { name: draft.name, subject: draft.subject, body: draft.body },
      expected_modified: expectedModified,
    },
  });
}

export async function deleteMessageTemplate(
  name: string,
  expectedModified?: string,
  options: { baseUrl?: string } = {},
): Promise<DeleteMessageTemplateResponse> {
  return request<DeleteMessageTemplateResponse>(METHODS.DELETE, {
    ...options,
    body: { name, expected_modified: expectedModified },
  });
}

export async function deleteMessageTemplateLibrary(
  name: string,
  expectedModified?: string,
  options: { baseUrl?: string } = {},
): Promise<DeleteMessageTemplateResponse> {
  return request<DeleteMessageTemplateResponse>(METHODS.DELETE_LIBRARY, {
    ...options,
    body: { name, expected_modified: expectedModified },
  });
}
