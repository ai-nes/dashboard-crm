import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import MessageTemplateTable from "./message-template-table";

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
});
