import { nestContentRequest } from "../nest/nest-content-router";
import { NestApiError } from "../nest/nest-client";
import type {
  DeleteMessageTemplateResponse,
  ListMessageTemplatesParams,
  ListMessageTemplatesResponse,
  ListMessageTemplatePreviewContactsResponse,
  ListMessageTemplateTokensResponse,
  MessageTemplateDraft,
  MessageTemplateRecord,
  MessageTemplatePreviewResponse,
  MessageTemplatePreviewContext,
} from "./types";

export type * from "./types";

const METHODS = {
  LIST: "crm.api.message_templates.list_message_templates",
  LIBRARY: "crm.api.message_templates.list_message_template_library",
  TOKENS: "crm.api.message_templates.list_message_template_tokens",
  ADMIN_LIBRARY:
    "crm.api.message_templates.list_admin_message_template_library",
  GET: "crm.api.message_templates.get_message_template",
  CREATE: "crm.api.message_templates.create_message_template",
  CREATE_LIBRARY: "crm.api.message_templates.create_message_template_library",
  UPDATE: "crm.api.message_templates.update_message_template",
  UPDATE_LIBRARY: "crm.api.message_templates.update_message_template_library",
  DELETE: "crm.api.message_templates.delete_message_template",
  DELETE_LIBRARY: "crm.api.message_templates.delete_message_template_library",
  PREVIEW_CONTACTS:
    "crm.api.message_templates.list_message_template_preview_contacts",
  PREVIEW: "crm.api.message_templates.preview_message_template",
} as const;

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
      throw new MessageTemplatesApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

export async function listMessageTemplates(
  params: ListMessageTemplatesParams = {},
): Promise<ListMessageTemplatesResponse> {
  return request<ListMessageTemplatesResponse>(METHODS.LIST, {
    query: {
      search: params.search?.trim(),
      owner: params.owner?.trim(),
    },
  });
}

export async function listMessageTemplateLibrary(): Promise<ListMessageTemplatesResponse> {
  return request<ListMessageTemplatesResponse>(METHODS.LIBRARY);
}

export async function listMessageTemplateTokens(): Promise<ListMessageTemplateTokensResponse> {
  return request<ListMessageTemplateTokensResponse>(METHODS.TOKENS);
}

export async function listAdminMessageTemplateLibrary(
  params: ListMessageTemplatesParams = {},
): Promise<ListMessageTemplatesResponse> {
  const result = await request<ListMessageTemplatesResponse>(
    METHODS.ADMIN_LIBRARY,
    {
      query: {
        search: params.search?.trim(),
        owner: params.owner?.trim(),
        start: params.start === undefined ? undefined : String(params.start),
        page_length:
          params.pageLength === undefined
            ? undefined
            : String(params.pageLength),
      },
    },
  );
  if (params.start === undefined && params.pageLength === undefined) {
    return result;
  }
  return {
    ...result,
    total: Number(result.total ?? result.templates.length),
    start: Number(result.start ?? params.start ?? 0),
    pageLength: Number(
      result.pageLength ??
        (result as ListMessageTemplatesResponse & { page_length?: number })
          .page_length ??
        params.pageLength ??
        20,
    ),
  };
}

export async function listMessageTemplatePreviewContacts(
  params: {
    search?: string;
    pageLength?: number;
    context?: MessageTemplatePreviewContext;
  } = {},
): Promise<ListMessageTemplatePreviewContactsResponse> {
  return request<ListMessageTemplatePreviewContactsResponse>(
    METHODS.PREVIEW_CONTACTS,
    {
      query: {
        search: params.search?.trim(),
        page_length: params.pageLength ? String(params.pageLength) : undefined,
        context: params.context,
      },
    },
  );
}

export async function previewMessageTemplate(
  recordId: string,
  draft: Pick<MessageTemplateDraft, "subject" | "body" | "customValues">,
  options: { context?: MessageTemplatePreviewContext } = {},
): Promise<MessageTemplatePreviewResponse> {
  const { context } = options;
  return request<MessageTemplatePreviewResponse>(METHODS.PREVIEW, {
    body: context
      ? { record_id: recordId, context, data: draft }
      : { lead_id: recordId, data: draft },
  });
}

export async function getMessageTemplate(
  name: string,
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.GET, {
    query: { name },
  });
}

export async function createMessageTemplate(
  draft: MessageTemplateDraft,
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.CREATE, {
    body: { data: draft },
  });
}

export async function createMessageTemplateLibrary(
  draft: MessageTemplateDraft,
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.CREATE_LIBRARY, {
    body: {
      data: {
        name: draft.name,
        subject: draft.subject,
        body: draft.body,
        customValues: draft.customValues,
      },
    },
  });
}

export async function updateMessageTemplate(
  name: string,
  draft: MessageTemplateDraft,
  expectedModified?: string,
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.UPDATE, {
    body: { name, data: draft, expected_modified: expectedModified },
  });
}

export async function updateMessageTemplateLibrary(
  name: string,
  draft: MessageTemplateDraft,
  expectedModified?: string,
): Promise<MessageTemplateRecord> {
  return request<MessageTemplateRecord>(METHODS.UPDATE_LIBRARY, {
    body: {
      name,
      data: {
        name: draft.name,
        subject: draft.subject,
        body: draft.body,
        customValues: draft.customValues,
      },
      expected_modified: expectedModified,
    },
  });
}

export async function deleteMessageTemplate(
  name: string,
  expectedModified?: string,
): Promise<DeleteMessageTemplateResponse> {
  return request<DeleteMessageTemplateResponse>(METHODS.DELETE, {
    body: { name, expected_modified: expectedModified },
  });
}

export async function deleteMessageTemplateLibrary(
  name: string,
  expectedModified?: string,
): Promise<DeleteMessageTemplateResponse> {
  return request<DeleteMessageTemplateResponse>(METHODS.DELETE_LIBRARY, {
    body: { name, expected_modified: expectedModified },
  });
}
