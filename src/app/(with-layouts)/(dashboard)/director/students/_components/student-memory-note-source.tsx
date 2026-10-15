"use client";
import type { AiMemoryItem } from "@/services/api/student-ai";
import { formatDateTime } from "@/utils/format-date";

export const memoryStatusLabels = {
  open: "Đang theo dõi",
  done: "Đã hoàn tất",
  contradicted: "Đã loại bỏ",
  superseded: "Đã thay thế",
};
export function memorySourceLabel(item: AiMemoryItem) {
  if (item.provenance?.source_notes.length) return "AI trích từ ghi chú";
  return item.provenance?.created_by === "ai" || item.source === "ai"
    ? "AI ghi nhận"
    : "Theo dõi tư vấn";
}
export default function StudentMemoryNoteSource({
  item,
  availableNoteIds,
  onOpenSource,
}: {
  item: AiMemoryItem;
  availableNoteIds: string[];
  onOpenSource: (id: string) => void;
}) {
  const sources = item.provenance?.source_notes ?? [];
  if (!sources.length)
    return (
      <p className="text-xs text-text-tertiary">
        {item.provenance?.created_by === "ai" || item.source === "ai"
          ? "Ghi nhận từ trao đổi; chưa có ghi chú gốc được liên kết."
          : "Ghi nhận thủ công; chưa có nguồn được liên kết."}
      </p>
    );
  return (
    <div className="space-y-2 text-sm">
      {sources.map((note) =>
        availableNoteIds.includes(note.id) ? (
          <a
            key={note.id}
            href={`#student-note-${encodeURIComponent(note.id)}`}
            className="inline-block text-primary-500 underline underline-offset-2"
            onClick={(event) => {
              event.preventDefault();
              onOpenSource(note.id);
            }}
          >
            Xem ghi chú gốc · {formatDateTime(note.created_at)}
          </a>
        ) : (
          <details
            key={note.id}
            className="rounded-lg border border-card-border p-3"
          >
            <summary className="cursor-pointer text-primary-500">
              Xem ghi chú gốc · {formatDateTime(note.created_at)}
            </summary>
            <p className="mt-2 whitespace-pre-line text-text-secondary">
              {note.content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")}
            </p>
          </details>
        ),
      )}
    </div>
  );
}
