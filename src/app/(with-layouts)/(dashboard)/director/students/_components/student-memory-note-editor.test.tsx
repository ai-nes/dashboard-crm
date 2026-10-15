import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import StudentMemoryNoteEditor from "./student-memory-note-editor";
vi.mock("@/hooks/use-student-ai", () => ({
  useStudentMemoryActions: () => ({
    edit: { isPending: false },
    close: { isPending: false },
  }),
}));
const item = {
  id: "M",
  type: "concern",
  subject: "parent" as const,
  text: "Cần dự toán học phí",
  due: null,
  status: "open" as const,
  source: "ai" as const,
  valid_from: "2026-10-14T09:00:00Z",
  updated_at: "2026-10-14T09:00:00Z",
};
it("only offers editing of tracked notes with effective write access", () => {
  expect(
    renderToStaticMarkup(
      <StudentMemoryNoteEditor studentId="S" item={item} canEdit />,
    ),
  ).toContain("Chỉnh sửa ghi chú");
  expect(
    renderToStaticMarkup(
      <StudentMemoryNoteEditor studentId="S" item={item} canEdit={false} />,
    ),
  ).not.toContain("Chỉnh sửa ghi chú");
});
it("offers completion and dismissal only for open notes with write access", () => {
  const html = renderToStaticMarkup(
    <StudentMemoryNoteEditor studentId="S" item={item} canEdit />,
  );
  expect(html).toContain("Hoàn tất");
  expect(html).toContain("Loại bỏ");
  expect(
    renderToStaticMarkup(
      <StudentMemoryNoteEditor
        studentId="S"
        item={{ ...item, status: "done" }}
        canEdit
      />,
    ),
  ).not.toContain("Chỉnh sửa ghi chú");
});
