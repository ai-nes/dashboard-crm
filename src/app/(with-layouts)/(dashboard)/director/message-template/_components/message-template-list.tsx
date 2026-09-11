"use client";

import { useMemo, useState } from "react";

import MessageTemplateListToolbar from "./message-template-list-toolbar";
import type { MessageTemplateRecord } from "./message-template-data";
import MessageTemplateTable from "./message-template-table";

interface MessageTemplateListProps {
  templates: MessageTemplateRecord[];
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

export default function MessageTemplateList({
  templates,
  onDuplicate,
  onDelete,
  onEdit,
}: MessageTemplateListProps) {
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("all");
  const owners = useMemo(
    () => [...new Set(templates.map((template) => template.owner))],
    [templates],
  );
  const filteredTemplates = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());

    return templates.filter((template: MessageTemplateRecord) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeSearch(`${template.code} ${template.name} ${template.owner}`).includes(
          normalizedSearch,
        );
      const matchesOwner = owner === "all" || template.owner === owner;

      return matchesSearch && matchesOwner;
    });
  }, [owner, search, templates]);

  return (
    <section
      aria-label="Quản lý mẫu tin nhắn"
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
    >
      <MessageTemplateListToolbar
        search={search}
        owner={owner}
        owners={owners}
        resultCount={filteredTemplates.length}
        totalCount={templates.length}
        onSearchChange={setSearch}
        onOwnerChange={setOwner}
        onReset={() => {
          setSearch("");
          setOwner("all");
        }}
      />
      <MessageTemplateTable
        templates={filteredTemplates}
        totalCount={templates.length}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </section>
  );
}
