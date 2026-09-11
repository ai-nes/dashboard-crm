"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "@/components/tailgrids/core/pagination";

import MessageTemplateListToolbar from "./message-template-list-toolbar";
import type { MessageTemplateRecord } from "./message-template-data";
import MessageTemplateTable from "./message-template-table";

const PAGE_SIZE = 10;

interface MessageTemplateListProps {
  templates: MessageTemplateRecord[];
  currentUserId?: string;
  isLoading?: boolean;
  onDuplicate: (template: MessageTemplateRecord) => void;
  onDelete: (template: MessageTemplateRecord) => void;
  onEdit: (template: MessageTemplateRecord) => void;
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
  currentUserId,
  isLoading = false,
  onDuplicate,
  onDelete,
  onEdit,
}: MessageTemplateListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [owner, setOwner] = useState("all");
  const requestedPage = parsePage(searchParams.get("page"));
  const searchParam = searchParams.get("search")?.trim() ?? "";
  const updateQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(changes).forEach(([key, value]) => {
        if (!value) nextParams.delete(key);
        else nextParams.set(key, value);
      });

      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim();
      if (nextSearch === searchParam) return;
      updateQuery({ search: nextSearch || undefined, page: undefined });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, searchParam, updateQuery]);

  const mineTemplates = useMemo(() => {
    const normalizedUserId = currentUserId?.trim().toLowerCase();
    if (!normalizedUserId) return [];
    return templates.filter(
      (template) => template.ownerId.trim().toLowerCase() === normalizedUserId,
    );
  }, [currentUserId, templates]);
  const scopedTemplates = scope === "mine" ? mineTemplates : templates;
  const owners = useMemo(
    () => [...new Set(templates.map((template) => template.owner))],
    [templates],
  );
  const filteredTemplates = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());

    return scopedTemplates.filter((template: MessageTemplateRecord) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeSearch(`${template.code} ${template.name} ${template.owner}`).includes(
          normalizedSearch,
        );
      const matchesOwner = owner === "all" || template.owner === owner;

      return matchesSearch && matchesOwner;
    });
  }, [owner, search, scopedTemplates]);
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTemplates.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredTemplates]);

  useEffect(() => {
    if (isLoading || requestedPage <= totalPages) return;
    updateQuery({ page: totalPages === 1 ? undefined : String(totalPages) });
  }, [isLoading, requestedPage, totalPages, updateQuery]);

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
        allCount={templates.length}
        mineCount={mineTemplates.length}
        search={search}
        owner={owner}
        owners={owners}
        resultCount={filteredTemplates.length}
        totalCount={scopedTemplates.length}
        onScopeChange={(nextScope) => {
          setScope(nextScope);
          if (nextScope === "mine") setOwner("all");
          resetPage();
        }}
        onSearchChange={(value) => {
          setSearch(value);
          if (requestedPage !== 1) updateQuery({ page: undefined });
        }}
        onOwnerChange={(nextOwner) => {
          setOwner(nextOwner);
          setScope("all");
          resetPage();
        }}
        onReset={() => {
          setScope("all");
          setSearch("");
          setOwner("all");
          updateQuery({ search: undefined, page: undefined });
        }}
      />
      <MessageTemplateTable
        templates={paginatedTemplates}
        totalCount={scopedTemplates.length}
        isLoading={isLoading}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      {totalPages > 1 ? (
        <div className="border-t border-card-border px-5 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => {
              updateQuery({ page: nextPage === 1 ? undefined : String(nextPage) });
            }}
            isDisabled={isLoading}
          />
        </div>
      ) : null}
    </section>
  );
}
