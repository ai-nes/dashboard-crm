"use client";

import { useMemo, useState } from "react";

import type { SnippetRecord } from "@/services/api/snippets";

import SnippetListToolbar from "./snippet-list-toolbar";
import SnippetTable from "./snippet-table";

interface SnippetListProps {
  snippets: SnippetRecord[];
  currentUserId?: string;
  isLoading?: boolean;
  onDuplicate: (snippet: SnippetRecord) => void;
  onDelete: (snippet: SnippetRecord) => void;
  onEdit: (snippet: SnippetRecord) => void;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export default function SnippetList({
  snippets,
  currentUserId,
  isLoading = false,
  onDuplicate,
  onDelete,
  onEdit,
}: SnippetListProps) {
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [sharing, setSharing] = useState<"all" | "public" | "private">("all");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("all");
  const mineSnippets = useMemo(() => {
    const normalizedUserId = currentUserId?.trim().toLowerCase();
    if (!normalizedUserId) return [];
    return snippets.filter(
      (snippet) => snippet.ownerId.trim().toLowerCase() === normalizedUserId,
    );
  }, [currentUserId, snippets]);
  const scopedSnippets = scope === "mine" ? mineSnippets : snippets;
  const owners = useMemo(
    () => [...new Set(scopedSnippets.map((snippet) => snippet.owner))],
    [scopedSnippets],
  );
  const filteredSnippets = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());

    return scopedSnippets.filter((snippet) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeSearch(
          `${snippet.code} ${snippet.name} ${snippet.content} ${snippet.owner}`,
        ).includes(normalizedSearch);
      const matchesOwner = owner === "all" || snippet.owner === owner;
      const matchesSharing = sharing === "all" || snippet.sharing === sharing;

      return matchesSearch && matchesOwner && matchesSharing;
    });
  }, [owner, search, scopedSnippets, sharing]);

  return (
    <section
      aria-label="Quản lý snippet"
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
    >
      <SnippetListToolbar
        showOwnershipTabs={Boolean(currentUserId)}
        scope={scope}
        allCount={snippets.length}
        mineCount={mineSnippets.length}
        search={search}
        owner={owner}
        owners={owners}
        sharing={sharing}
        resultCount={filteredSnippets.length}
        totalCount={scopedSnippets.length}
        onScopeChange={setScope}
        onSearchChange={setSearch}
        onOwnerChange={setOwner}
        onSharingChange={setSharing}
        onReset={() => {
          setScope("all");
          setSearch("");
          setOwner("all");
          setSharing("all");
        }}
      />
      <SnippetTable
        snippets={filteredSnippets}
        totalCount={snippets.length}
        isLoading={isLoading}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </section>
  );
}
