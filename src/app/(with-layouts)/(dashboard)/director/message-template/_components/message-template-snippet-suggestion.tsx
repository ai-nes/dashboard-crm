"use client";

import { createPortal } from "react-dom";

import type { SnippetRecord } from "@/services/api/snippets";

export interface SnippetSuggestionPosition {
  top: number;
  left: number;
}

export function filterSnippetSuggestions(
  snippets: SnippetRecord[],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return snippets;

  return snippets.filter((snippet) => {
    const shortcut = (snippet.shortcut ?? "").toLocaleLowerCase();
    const internalName = (snippet.internalName ?? "").toLocaleLowerCase();
    return (
      shortcut.startsWith(normalizedQuery) ||
      internalName.includes(normalizedQuery)
    );
  });
}

interface MessageTemplateSnippetSuggestionProps {
  snippets: SnippetRecord[];
  query: string;
  position: SnippetSuggestionPosition;
  selectedIndex: number;
  isLoading: boolean;
  error?: string | null;
  onActiveChange: (index: number) => void;
  onSelect: (snippet: SnippetRecord) => void;
}

export default function MessageTemplateSnippetSuggestion({
  snippets,
  query,
  position,
  selectedIndex,
  isLoading,
  error = null,
  onActiveChange,
  onSelect,
}: MessageTemplateSnippetSuggestionProps) {
  if (typeof document === "undefined") return null;

  const viewportWidth = window.innerWidth;
  const left = Math.max(8, Math.min(position.left, viewportWidth - 328));

  return createPortal(
    <div
      className="fixed z-50 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-card-border bg-background-white-primary shadow-lg"
      style={{ left, top: position.top }}
      role="listbox"
      aria-label="Gợi ý snippet"
    >
      <div className="border-b border-card-border px-3 py-2 text-xs font-semibold text-text-secondary">
        Snippet
        {query ? <span className="ml-1 font-normal">#{query}</span> : null}
      </div>

      {isLoading ? (
        <div className="px-3 py-3 text-sm text-text-secondary">
          Đang tải snippet...
        </div>
      ) : error ? (
        <div className="px-3 py-3 text-sm text-button-error-outline-text">
          Không thể tải snippet.
        </div>
      ) : snippets.length === 0 ? (
        <div className="px-3 py-3 text-sm text-text-secondary">
          Không tìm thấy snippet phù hợp.
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto p-1.5">
          {snippets.map((snippet, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={snippet.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors duration-150 hover:bg-background-gray-secondary focus-visible:bg-background-gray-secondary focus-visible:ring-2 focus-visible:ring-primary-500 data-[selected=true]:bg-background-gray-secondary"
                data-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => onActiveChange(index)}
                onClick={() => onSelect(snippet)}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {snippet.internalName || "Snippet không tên"}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-text-secondary">
                    #{snippet.shortcut}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>,
    document.body,
  );
}
