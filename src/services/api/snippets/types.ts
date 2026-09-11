export type SnippetSharing = "public" | "private";

export interface SnippetRecord {
  id: string;
  code: string;
  name: string;
  ownerId: string;
  owner: string;
  sharing: SnippetSharing;
  createdAt: string;
  modifiedAt: string;
  content: string;
  canEdit: boolean;
}

export interface SnippetDraft {
  name: string;
  content: string;
  sharing: SnippetSharing;
}

export interface SnippetOwner {
  id: string;
  name: string;
}

export interface ListSnippetsResponse {
  snippets: SnippetRecord[];
  owners: SnippetOwner[];
  total: number;
}

export interface ListSnippetsParams {
  search?: string;
  owner?: string;
  sharing?: SnippetSharing;
}

export interface DeleteSnippetResponse {
  name: string;
  deleted: boolean;
}
