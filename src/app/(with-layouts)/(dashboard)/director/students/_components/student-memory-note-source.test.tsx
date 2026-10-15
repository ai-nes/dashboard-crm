import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import StudentMemoryNoteSource, {
  memorySourceLabel,
} from "./student-memory-note-source";
import type { AiMemoryItem } from "@/services/api/student-ai";
const item: AiMemoryItem = {
  id: "M",
  type: "concern",
  subject: "parent",
  text: "Dự toán học phí",
  due: null,
  status: "open",
  source: "sale",
  valid_from: "2026-10-14T09:00:00Z",
  updated_at: "2026-10-15T09:00:00Z",
  provenance: {
    created_by: "ai",
    source_notes: [
      {
        id: "N",
        content: "<p>Mẹ cần dự toán học phí.</p>",
        created_at: "2026-10-14T09:00:00Z",
      },
    ],
  },
};
it("keeps the AI origin visible after a user correction and links to the original note", () => {
  expect(memorySourceLabel(item)).toBe("AI trích từ ghi chú");
  expect(
    renderToStaticMarkup(
      <StudentMemoryNoteSource
        item={item}
        availableNoteIds={["N"]}
        onOpenSource={() => {}}
      />,
    ),
  ).toContain('href="#student-note-N"');
});
it("can show an older source without adding its content as HTML", () => {
  const html = renderToStaticMarkup(
    <StudentMemoryNoteSource
      item={item}
      availableNoteIds={[]}
      onOpenSource={() => {}}
    />,
  );
  expect(html).toContain("Mẹ cần dự toán học phí.");
  expect(html).not.toContain("<p>Mẹ cần dự toán học phí.</p>");
});
it("does not invent evidence for a manual seed", () => {
  const manual = { ...item, source: "manual" as const, provenance: undefined };
  expect(
    renderToStaticMarkup(
      <StudentMemoryNoteSource
        item={manual}
        availableNoteIds={[]}
        onOpenSource={() => {}}
      />,
    ),
  ).toContain("chưa có nguồn được liên kết");
});
