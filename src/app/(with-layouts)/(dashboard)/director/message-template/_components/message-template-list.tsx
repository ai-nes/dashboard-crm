"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "@/components/tailgrids/core/pagination";

import MessageTemplateListToolbar from "./message-template-list-toolbar";
import type { MessageTemplateRecord } from "./message-template-data";
import MessageTemplateTable from "./message-template-table";

const PAGE_SIZE = 8;

interface MessageTemplateListProps {
  templates: MessageTemplateRecord[];
  canCreate?: boolean;
  canDelete?: boolean;
  currentUserId?: string;
  isLoading?: boolean;
  onDuplicate: (template: MessageTemplateRecord) => void;
  onDelete: (template: MessageTemplateRecord) => void;
  onEdit: (template: MessageTemplateRecord) => void;
  serverPagination?: {
    total: number;
    currentPage: number;
    totalPages: number;
    isDisabled?: boolean;
    owners?: Array<{ id: string; name: string }>;
    onPageChange: (page: number) => void;
    onFiltersChange: (filters: { search: string; owner: string }) => void;
  };
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default function MessageTemplateList({
  templates,
  canCreate = true,
  canDelete = true,
  currentUserId,
  isLoading = false,
  onDuplicate,
  onDelete,
  onEdit,
  serverPagination,
}: MessageTemplateListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [owner, setOwner] = useState("all");
  const requestedPage = parsePage(searchParams.get("page"));
  const searchParam = searchParams.get("search")?.trim() ?? "";
  const onServerFiltersChange = serverPagination?.onFiltersChange;
  const updateQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(changes).forEach(([key, value]) => {
        if (!value) nextParams.delete(key);
        else nextParams.set(key, value);
      });

      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (serverPagination) return;
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim();
      if (nextSearch === searchParam) return;
      updateQuery({ search: nextSearch || undefined, page: undefined });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, searchParam, updateQuery, serverPagination]);

  useEffect(() => {
    if (!onServerFiltersChange) return;
    const timer = window.setTimeout(() => {
      onServerFiltersChange({ search: search.trim(), owner });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [owner, search, onServerFiltersChange]);

  const mineTemplates = useMemo(() => {
    const normalizedUserId = currentUserId?.trim().toLowerCase();
    if (!normalizedUserId) return [];
    return templates.filter(
      (template) => template.ownerId.trim().toLowerCase() === normalizedUserId,
    );
  }, [currentUserId, templates]);
  const scopedTemplates = scope === "mine" ? mineTemplates : templates;
  const localOwners = useMemo(
    () =>
      [...new Set(templates.map((template) => template.owner))].map((name) => ({
        id: name,
        name,
      })),
    [templates],
  );
  const owners = serverPagination?.owners ?? localOwners;
  const filteredTemplates = useMemo(() => {
    if (serverPagination) return scopedTemplates;
    const normalizedSearch = normalizeSearch(search.trim());

    return scopedTemplates.filter((template: MessageTemplateRecord) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeSearch(
          `${template.code} ${template.name} ${template.owner}`,
        ).includes(normalizedSearch);
      const matchesOwner = owner === "all" || template.owner === owner;

      return matchesSearch && matchesOwner;
    });
  }, [owner, search, scopedTemplates, serverPagination]);
  const totalPages =
    serverPagination?.totalPages ??
    Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const currentPage =
    serverPagination?.currentPage ?? Math.min(requestedPage, totalPages);
  const paginatedTemplates = useMemo(() => {
    if (serverPagination) return filteredTemplates;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTemplates.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredTemplates, serverPagination]);

  useEffect(() => {
    if (serverPagination || isLoading || requestedPage <= totalPages) return;
    updateQuery({ page: totalPages === 1 ? undefined : String(totalPages) });
  }, [isLoading, requestedPage, totalPages, updateQuery, serverPagination]);

  const resetPage = () => {
    updateQuery({ page: undefined });
  };

  return (
    <section
      aria-label="Quản lý mẫu tin nhắn"
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
    >
      <MessageTemplateListToolbar
        showOwnershipTabs={Boolean(currentUserId)}
        scope={scope}
        allCount={serverPagination?.total ?? templates.length}
        mineCount={mineTemplates.length}
        search={search}
        owner={owner}
        owners={owners}
        resultCount={filteredTemplates.length}
        totalCount={serverPagination?.total ?? scopedTemplates.length}
        onScopeChange={(nextScope) => {
          setScope(nextScope);
          if (nextScope === "mine") setOwner("all");
          if (!serverPagination) resetPage();
        }}
        onSearchChange={(value) => {
          setSearch(value);
          if (serverPagination) return;
          if (requestedPage !== 1) updateQuery({ page: undefined });
        }}
        onOwnerChange={(nextOwner) => {
          setOwner(nextOwner);
          setScope("all");
          if (!serverPagination) resetPage();
        }}
        onReset={() => {
          setScope("all");
          setSearch("");
          setOwner("all");
          if (serverPagination) {
            serverPagination.onFiltersChange({ search: "", owner: "all" });
          } else {
            updateQuery({ search: undefined, page: undefined });
          }
        }}
      />
      <MessageTemplateTable
        templates={paginatedTemplates}
        totalCount={serverPagination?.total ?? scopedTemplates.length}
        canCreate={canCreate}
        canDelete={canDelete}
        isLoading={isLoading}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      {totalPages > 1 ? (
        <div className="flex justify-end border-t border-card-border px-5 py-4">
          <div className="w-fit">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(nextPage) => {
                if (serverPagination) {
                  serverPagination.onPageChange(nextPage);
                } else {
                  updateQuery({
                    page: nextPage === 1 ? undefined : String(nextPage),
                  });
                }
              }}
              variant="compact"
              isDisabled={isLoading || serverPagination?.isDisabled}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
