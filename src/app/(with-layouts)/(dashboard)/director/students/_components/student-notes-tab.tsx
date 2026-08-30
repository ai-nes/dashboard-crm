"use client";

import { Message1, Plus } from "@tailgrids/icons";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";

import { notes } from "./student-tab-data";
import type { Student360SectionProps } from "./types";

export default function StudentNotesTab({ data }: Student360SectionProps) {
  const noteList = data.notes ?? notes;

  return (
    <Card className="p-5">
      <CardHeader className="mb-5">
        <CardTitle>Ghi chú tư vấn</CardTitle>
        <Button size="sm" onPress={() => toast.success(`Đã tạo ghi chú cho ${data.student.name}.`)}><Plus size={16} />Thêm ghi chú</Button>
      </CardHeader>
      {noteList.length === 0 ? (
        <p className="py-2 text-xs text-text-tertiary">Chưa có ghi chú nào cho học sinh này.</p>
      ) : (
        <ol className="space-y-4">
          {noteList.filter((note) => note.author !== "AI Student Insight").map((note) => (
            <li key={`${note.author}-${note.date}`} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><Message1 size={16} /></span>
              <div className="min-w-0 flex-1 rounded-lg border border-card-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">{note.author}</p>
                  <span className="text-xs text-text-tertiary">{formatDateTime(note.date)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{note.content}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
