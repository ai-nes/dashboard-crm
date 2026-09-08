"use client";

import { Pencil1 } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";

interface SegmentFilterGroupNameProps {
  name: string;
  onChange: (name: string) => void;
}

export function SegmentFilterGroupName({
  name,
  onChange,
}: SegmentFilterGroupNameProps) {
  const [draftName, setDraftName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setDraftName(name);
    setIsEditing(true);
  };

  const saveName = () => {
    const nextName = draftName.trim();
    if (nextName) onChange(nextName);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setDraftName(name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        aria-label="Tên nhóm bộ lọc"
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={saveName}
        onKeyDown={(event) => {
          if (event.key === "Enter") saveName();
          if (event.key === "Escape") cancelEditing();
        }}
        className="h-auto w-56 rounded-none border-0 bg-transparent px-1 py-1 text-base leading-6 font-semibold text-text-secondary shadow-none outline-none ring-0 focus:border-0 focus:ring-0"
      />
    );
  }

  return (
    <Button
      variant="primary"
      appearance="ghost"
      size="sm"
      aria-label={`Đổi tên ${name}`}
      className="group/name h-auto max-w-full justify-start gap-2 px-1 py-1 text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
      onPress={startEditing}
    >
      <span className="truncate text-left text-base font-semibold">{name}</span>
      <Pencil1
        size={15}
        aria-hidden="true"
        className="shrink-0 text-text-tertiary opacity-60 transition-opacity sm:opacity-0 sm:group-hover/name:opacity-100 sm:group-focus-visible/name:opacity-100"
      />
    </Button>
  );
}
