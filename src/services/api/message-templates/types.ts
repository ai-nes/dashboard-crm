export type MessageTemplateSharing = "public" | "private";
export type MessageTemplatePreviewContext = "lead" | "student";
export type MessageTemplateTokenSourceType =
  | "database"
  | "admin_value"
  | "user_value"
  | "context";

export interface MessageTemplateTokenDefinition {
  id: string;
  value: string;
  label: string;
  group: string;
  groupLabel: string;
  sourceType: MessageTemplateTokenSourceType;
  sourceDoctype?: string;
  sourceField?: string;
  adminValue?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputDescription?: string;
  inputType?: "text" | "url";
}

export interface MessageTemplateRecord {
  id: string;
  code: string;
  name: string;
  ownerId: string;
  owner: string;
  sharing: MessageTemplateSharing;
  createdAt: string;
  modifiedAt: string;
  subject: string;
  body: string;
  customValues: Record<string, string>;
  description: string;
  libraryCategory: string;
  isSystemTemplate: boolean;
  isActive: boolean;
  canEdit: boolean;
}

export interface MessageTemplateDraft {
  name: string;
  subject: string;
  body: string;
  sharing: MessageTemplateSharing;
  customValues: Record<string, string>;
}

export interface MessageTemplateOwner {
  id: string;
  name: string;
}

export interface ListMessageTemplatesResponse {
  templates: MessageTemplateRecord[];
  owners: MessageTemplateOwner[];
  total: number;
  start?: number;
  pageLength?: number;
}

export interface ListMessageTemplateTokensResponse {
  tokens: MessageTemplateTokenDefinition[];
  total: number;
}

export interface ListMessageTemplatesParams {
  search?: string;
  owner?: string;
  start?: number;
  pageLength?: number;
}

export interface DeleteMessageTemplateResponse {
  name: string;
  deleted: boolean;
}

export interface MessageTemplatePreviewContact {
  id: string;
  label: string;
  email: string;
  phone: string;
  contextType?: MessageTemplatePreviewContext;
}

export interface ListMessageTemplatePreviewContactsResponse {
  contacts: MessageTemplatePreviewContact[];
  total: number;
}

export interface MessageTemplatePreviewResponse {
  lead: MessageTemplatePreviewContact;
  record?: MessageTemplatePreviewContact;
  contextType?: MessageTemplatePreviewContext;
  subject: string;
  body: string;
  missingTokens: string[];
}
