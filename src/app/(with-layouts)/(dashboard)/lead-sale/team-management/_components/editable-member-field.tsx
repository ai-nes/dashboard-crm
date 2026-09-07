"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";

interface EditableMemberFieldProps {
  value: string;
  label: string;
  type?: "text" | "email";
  readOnly?: boolean;
  onSave: (value: string) => string | null;
}

export default function EditableMemberField({
  value,
  label,
  type = "text",
  readOnly = false,
  onSave,
}: EditableMemberFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const finish = () => {
    setEditing(false);
    requestAnimationFrame(() =>
      triggerRef.current?.querySelector("button")?.focus(),
    );
  };
  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError(
        type === "email" ? "Vui lòng nhập email." : "Vui lòng nhập tên.",
      );
      return;
    }
    if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Email không hợp lệ.");
      return;
    }
    const message = trimmed === value ? null : onSave(trimmed);
    if (message) {
      setError(message);
      return;
    }
    finish();
  };
  if (editing)
    return (
      <div className="min-w-0">
        <Input
          autoFocus
          aria-label={label}
          type={type}
          value={draft}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              finish();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            }
          }}
          className="h-9 w-full px-2 text-sm"
        />
        <div className="mt-1 flex gap-1">
          <Button size="xs" appearance="ghost" onPress={save}>
            Lưu
          </Button>
          <Button size="xs" appearance="ghost" onPress={finish}>
            Hủy
          </Button>
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-xs text-badge-error-text"
          >
            {error}
          </p>
        )}
      </div>
    );
  if (readOnly) {
    return (
      <span
        className="block truncate px-2 py-2 font-normal text-text-secondary"
        title={value}
      >
        {value || "—"}
      </span>
    );
  }
  return (
    <span ref={triggerRef} className="block min-w-0 flex-1">
      <Button
        appearance="ghost"
        onPress={() => {
          setDraft(value);
          setError(null);
          setEditing(true);
        }}
        aria-label={label}
        className={`h-auto w-full min-w-0 justify-start px-2 py-2 text-left hover:bg-background-gray-secondary ${type === "email" ? "font-normal text-text-secondary" : "text-text-primary"}`}
      >
        <span className="truncate" title={value}>
          {value}
        </span>
      </Button>
    </span>
  );
}
