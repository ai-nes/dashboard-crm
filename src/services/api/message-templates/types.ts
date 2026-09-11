export type MessageTemplateSharing = "public" | "private";

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
}

export interface MessageTemplateOwner {
  id: string;
  name: string;
}

export interface ListMessageTemplatesResponse {
  templates: MessageTemplateRecord[];
  owners: MessageTemplateOwner[];
  total: number;
}

export interface ListMessageTemplatesParams {
  search?: string;
  owner?: string;
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
}

export interface ListMessageTemplatePreviewContactsResponse {
  contacts: MessageTemplatePreviewContact[];
  total: number;
}

export interface MessageTemplatePreviewResponse {
  lead: MessageTemplatePreviewContact;
  subject: string;
  body: string;
  missingTokens: string[];
}
