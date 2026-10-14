import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProfileOptionsTable from "./profile-options-table";

describe("profile catalog row permissions", () => {
  it.each([true, false])(
    "renders mutation actions only with effective grants: %s",
    (allowed) => {
      const html = renderToStaticMarkup(
        createElement(ProfileOptionsTable, {
          rows: [
            {
              id: "test",
              type: "nationality",
              code: "VN",
              name: "Việt Nam",
              isActive: true,
              sortOrder: 0,
            },
          ],
          busy: false,
          isLoading: false,
          currentPage: 1,
          total: 1,
          onPageChange: () => {},
          permissions: {
            canRead: true,
            canCreate: allowed,
            canUpdate: allowed,
            canDelete: allowed,
            canExport: false,
          },
          onEdit: () => {},
          onToggle: () => {},
          onDelete: () => {},
        }),
      );
      expect(html.includes('aria-label="Thao tác Việt Nam"')).toBe(allowed);
      expect(html.includes('aria-label="Sửa Việt Nam"')).toBe(false);
      expect(html.includes('aria-label="Xóa Việt Nam"')).toBe(false);
      expect(html).toContain("Việt Nam");
    },
  );
  it("keeps five table columns while loading and shows the shared pagination range", () => {
    const props = {
      rows: [],
      busy: false,
      permissions: {
        canRead: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canExport: false,
      },
      onEdit: () => {},
      onToggle: () => {},
      onDelete: () => {},
      currentPage: 2,
      total: 9,
      onPageChange: () => {},
    };
    const loading = renderToStaticMarkup(
      createElement(ProfileOptionsTable, { ...props, isLoading: true }),
    );
    expect(loading).toContain('aria-busy="true"');
    expect(loading.match(/<td /g)).toHaveLength(40);
    expect(loading).not.toContain("Chưa có danh mục phù hợp");
    const loaded = renderToStaticMarkup(
      createElement(ProfileOptionsTable, { ...props, isLoading: false }),
    );
    expect(loaded).toContain("Hiển thị 9 đến 9 trong 9");
  });
});
