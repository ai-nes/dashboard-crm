import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import MessageTemplateTable from "./message-template-table";
import type { MessageTemplateRecord } from "./message-template-data";

const template: MessageTemplateRecord = {
  id: "MSG-001",
  code: "MSG-001",
  name: "Template One",
  ownerId: "owner@example.test",
  owner: "Owner",
  sharing: "private",
  createdAt: "2026-01-01T00:00:00Z",
  modifiedAt: "2026-01-01T00:00:00Z",
  subject: "Subject",
  body: "Body",
  customValues: {},
  description: "",
  libraryCategory: "",
  isSystemTemplate: false,
  isActive: true,
  canEdit: true,
};

describe("MessageTemplateTable", () => {
  it("hiển thị 10 dòng skeleton trong lúc tải dữ liệu", () => {
    const html = renderToStaticMarkup(
      <MessageTemplateTable
        templates={[]}
        totalCount={0}
        isLoading
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Đang tải danh sách mẫu email");
    expect(html.match(/<tr[^>]*aria-hidden="true"/g)).toHaveLength(10);
    expect(html).not.toContain("Chưa có mẫu tin nhắn nào");
  });

  it("ẩn thao tác sửa và xóa khi không có quyền tương ứng", () => {
    const html = renderToStaticMarkup(
      <MessageTemplateTable
        templates={[template]}
        totalCount={1}
        canCreate={false}
        canUpdate={false}
        canDelete={false}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(html).toContain("Template One");
    expect(html).not.toContain('aria-label="Chỉnh sửa Template One"');
    expect(html).not.toContain('aria-label="Nhân bản Template One"');
    expect(html).not.toContain('aria-label="Xóa Template One"');
  });

  it("hiển thị thao tác được cấp và chỉ cho phép sửa record có canEdit", () => {
    const html = renderToStaticMarkup(
      <MessageTemplateTable
        templates={[template, { ...template, id: "MSG-002", name: "Other", canEdit: false }]}
        totalCount={2}
        canCreate
        canUpdate
        canDelete
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(html).toContain('aria-label="Chỉnh sửa Template One"');
    expect(html).toContain('aria-label="Nhân bản Template One"');
    expect(html).toContain('aria-label="Xóa Template One"');
    expect(html).not.toContain('aria-label="Chỉnh sửa Other"');
    expect(html).not.toContain('aria-label="Xóa Other"');
  });
});
