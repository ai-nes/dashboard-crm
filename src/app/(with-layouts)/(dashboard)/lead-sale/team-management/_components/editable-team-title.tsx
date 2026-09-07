"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";

interface EditableTeamTitleProps {
  name: string;
  onSave: (name: string) => void;
  isDisabled?: boolean;
}

export default function EditableTeamTitle({
  name,
  onSave,
  isDisabled = false,
}: EditableTeamTitleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState(false);
  const errorId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const close = () => {
    setEditing(false);
    requestAnimationFrame(() =>
      rootRef.current?.querySelector("button")?.focus(),
    );
  };

  return (
    <div ref={rootRef} className="min-w-0">
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) {
              setError(true);
              return;
            }
            if (draft.trim() !== name) onSave(draft.trim());
            close();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
        >
          <Input
            autoFocus
            aria-label={`Tên ${name}`}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? errorId : undefined}
            className="h-9 w-full px-2 text-lg font-semibold"
          />
          {error && (
            <p
              id={errorId}
              role="alert"
              className="mt-1 text-xs text-badge-error-text"
            >
              Vui lòng nhập tên.
            </p>
          )}
          <div className="mt-1 flex gap-1">
            <Button type="submit" size="xs" appearance="ghost">
              Lưu
            </Button>
            <Button type="button" size="xs" appearance="ghost" onPress={close}>
              Hủy
            </Button>
          </div>
        </form>
      ) : isDisabled ? (
        <h2 className="text-lg font-semibold text-text-primary">
          <span className="text-balance break-words">{name}</span>
        </h2>
      ) : (
        <h2>
          <Button
            appearance="ghost"
            aria-label={`Đổi tên ${name}`}
            onPress={() => {
              setDraft(name);
              setError(false);
              setEditing(true);
            }}
            className="h-auto w-full justify-start px-0 py-0 text-left text-lg font-semibold text-text-primary hover:bg-background-gray-secondary"
          >
            <span className="text-balance break-words">{name}</span>
          </Button>
        </h2>
      )}
    </div>
  );
}
