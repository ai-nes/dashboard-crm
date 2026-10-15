import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import StudentNotesTab from "./student-notes-tab";
vi.mock("@/hooks/use-student-ai", () => ({
  useStudentMemoryActions: () => ({
    edit: { isPending: false },
    close: { isPending: false },
  }),
}));
it("keeps tracked-note actions visible while the card is collapsed", () => {
  const html = renderToStaticMarkup(
    <StudentNotesTab
      studentName="Minh Anh"
      studentId="S"
      canEditMemory
      notes={[]}
      memoryItems={[
        {
          id: "M",
          type: "concern",
          subject: "parent",
          text: "Học phí",
          due: null,
          status: "open",
          source: "ai",
          valid_from: "2026-10-14T09:00:00Z",
          updated_at: "2026-10-14T09:00:00Z",
        },
      ]}
      onCreateNote={async () => {}}
      onUpdateNote={() => {}}
      canCreateFollowUpTask={false}
    />,
  );
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain("Chỉnh sửa ghi chú");
  expect(html).toContain("Hoàn tất");
  expect(html).toContain("Loại bỏ");
});
it("shows manual notes and tracked memory in a single notes list as plain text", () => {
  const html = renderToStaticMarkup(
    <StudentNotesTab
      studentName="Minh Anh"
      notes={[
        {
          id: "N",
          author: "Tư vấn viên",
          date: "2026-10-14",
          content: "Ghi chú thủ công",
        },
      ]}
      memoryItems={[
        {
          id: "M",
          type: "concern",
          subject: "parent",
          text: "Phụ huynh cần <b>dự toán</b> học phí",
          due: "2026-10-16",
          status: "open",
          source: "ai",
          valid_from: "2026-10-14T09:00:00Z",
          updated_at: "2026-10-14T09:00:00Z",
        },
      ]}
      onCreateNote={async () => {}}
      onUpdateNote={() => {}}
      canCreateFollowUpTask={false}
    />,
  );
  expect(html).toContain("Ghi chú thủ công");
  expect(html).toContain("Phụ huynh cần &lt;b&gt;dự toán&lt;/b&gt; học phí");
  expect(html).not.toContain("Thông tin ghi nhớ");
  expect(html).toContain("AI ghi nhận");
});
