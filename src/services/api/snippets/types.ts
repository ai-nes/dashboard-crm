export type SnippetSharing = "public" | "private";

export interface SnippetRecord {
  id: string;
  code: string;
  internalName: string;
  snippetText: string;
  shortcut: string;
  ownerId: string;
  owner: string;
  sharing: SnippetSharing;
  createdAt: string;
  modifiedAt: string;
  canEdit: boolean;
}

export interface SnippetDraft {
  internalName: string;
  snippetText: string;
  shortcut: string;
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
  totalAll: number;
  totalMine: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ListSnippetsParams {
  search?: string;
  owner?: string;
  sharing?: SnippetSharing;
  scope?: "all" | "mine";
  page?: number;
  pageSize?: number;
}

export interface DeleteSnippetResponse {
  name: string;
  deleted: boolean;
}
