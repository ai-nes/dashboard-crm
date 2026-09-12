"use client";

import { useEffect, useState } from "react";

import { Pagination } from "@/components/tailgrids/core/pagination";
import type {
  ListSnippetsParams,
  ListSnippetsResponse,
  SnippetRecord,
} from "@/services/api/snippets";

import SnippetListToolbar from "./snippet-list-toolbar";
import SnippetTable from "./snippet-table";

const PAGE_SIZE = 5;

interface SnippetListProps {
  snippets: SnippetRecord[];
  listResponse: ListSnippetsResponse;
  listParams: ListSnippetsParams;
  currentUserId?: string;
  isLoading?: boolean;
  onListParamsChange: (params: ListSnippetsParams) => void;
  onDuplicate: (snippet: SnippetRecord) => void;
  onDelete: (snippet: SnippetRecord) => void;
  onEdit: (snippet: SnippetRecord) => void;
}

export default function SnippetList({
  snippets,
  listResponse,
  listParams,
  currentUserId,
  isLoading = false,
  onListParamsChange,
  onDuplicate,
  onDelete,
  onEdit,
}: SnippetListProps) {
  const [search, setSearch] = useState(listParams.search ?? "");
  const scope = listParams.scope ?? "all";
  const owner = listParams.owner ?? "all";
  const totalCount =
    scope === "mine" ? listResponse.totalMine : listResponse.totalAll;

  useEffect(() => {
    const nextSearch = search.trim();
    const currentSearch = listParams.search?.trim() ?? "";
    if (nextSearch === currentSearch) return;

    const timer = window.setTimeout(() => {
      onListParamsChange({
        ...listParams,
        search: nextSearch || undefined,
        page: 1,
        pageSize: PAGE_SIZE,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [listParams, onListParamsChange, search]);

  useEffect(() => {
    if (isLoading || listResponse.page <= listResponse.totalPages) return;
    onListParamsChange({
      ...listParams,
      page: listResponse.totalPages,
      pageSize: PAGE_SIZE,
    });
  }, [
    isLoading,
    listParams,
    listResponse.page,
    listResponse.totalPages,
    onListParamsChange,
  ]);

  return (
    <section
      aria-label="Quản lý snippet"
      aria-busy={isLoading}
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
    >
      <SnippetListToolbar
        showOwnershipTabs={Boolean(currentUserId)}
        scope={scope}
        allCount={listResponse.totalAll}
        mineCount={listResponse.totalMine}
        search={search}
        owner={owner}
        owners={listResponse.owners}
        resultCount={listResponse.total}
        totalCount={totalCount}
        onScopeChange={(nextScope) => {
          onListParamsChange({
            ...listParams,
            scope: nextScope,
            owner: undefined,
            page: 1,
            pageSize: PAGE_SIZE,
          });
        }}
        onSearchChange={setSearch}
        onOwnerChange={(nextOwner) => {
          onListParamsChange({
            ...listParams,
            scope: "all",
            owner: nextOwner === "all" ? undefined : nextOwner,
            page: 1,
            pageSize: PAGE_SIZE,
          });
        }}
        onReset={() => {
          setSearch("");
          onListParamsChange({
            ...listParams,
            scope: "all",
            owner: undefined,
            search: undefined,
            page: 1,
            pageSize: PAGE_SIZE,
          });
        }}
      />
      <SnippetTable
        snippets={snippets}
        totalCount={totalCount}
        isLoading={isLoading}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      {listResponse.totalPages > 1 ? (
        <div className="border-t border-card-border px-5 py-4">
          <Pagination
            currentPage={listResponse.page}
            totalPages={listResponse.totalPages}
            onPageChange={(nextPage) =>
              onListParamsChange({
                ...listParams,
                page: nextPage,
                pageSize: PAGE_SIZE,
              })
            }
            isDisabled={isLoading}
          />
        </div>
      ) : null}
    </section>
  );
}
