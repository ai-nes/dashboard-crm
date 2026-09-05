"use client";

import { Pencil1 } from "@tailgrids/icons";
import { useState } from "react";

import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";

interface StudentOwnerCellProps {
  owner: string;
  editable: boolean;
  onChange: (owner: string) => void;
}

export default function StudentOwnerCell({
  owner,
  editable,
  onChange,
}: StudentOwnerCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(owner);

  if (!editable) {
    return (
      <p
        className="truncate text-sm font-medium text-text-primary"
        title={owner || undefined}
      >
        {owner || "-"}
      </p>
    );
  }

  if (isEditing) {
    const commit = () => {
      onChange(draft.trim());
      setIsEditing(false);
    };

    return (
      <TextField
        aria-label="Người phụ trách"
        value={draft}
        onChange={setDraft}
        onClick={(event) => event.stopPropagation()}
      >
        <Input
          autoFocus
          placeholder="Nhập tên người phụ trách"
          className="h-8 w-full px-2 py-1 text-sm"
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              setDraft(owner);
              setIsEditing(false);
            }
          }}
        />
      </TextField>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDraft(owner);
        setIsEditing(true);
      }}
      className="group/owner flex min-w-0 max-w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-left text-sm font-medium text-text-primary hover:bg-background-soft-50"
      title={owner ? `Sửa người phụ trách: ${owner}` : "Thêm người phụ trách"}
    >
      <span className="truncate">{owner || "Chưa có người phụ trách"}</span>
      <Pencil1
        size={12}
        className="shrink-0 text-icon-tertiary opacity-0 transition group-hover/owner:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
}
