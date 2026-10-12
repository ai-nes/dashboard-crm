import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentRowActions from "./student-row-actions";
import type { StudentListItem } from "@/services/api/students/types";

const state = vi.hoisted(() => ({ loading: false, write: true, remove: true }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    isLoading: state.loading,
    user: {
      user: "sale@example.test",
      email: "sale@example.test",
      crm_user_id: "owner-id",
      full_name: "Sale",
      roles: [],
      crm_doctype_permissions: {
        "CRM Student": {
          row_scope: "assigned",
          read: true,
          write: state.write,
          delete: state.remove,
          create: false,
          export: false,
          delete_requires_ownership: true,
        },
      },
    },
  }),
}));
vi.mock(
  "@/components/tailgrids/core/dropdown",
  async () => import("@/test-utils/open-dropdown"),
);

const student = {
  id: "student-id",
  studentId: "student-id",
  code: "HS-001",
  name: "Student",
  ownerId: "owner-id",
} as StudentListItem;
function render(row = student) {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <StudentRowActions student={row} />
    </QueryClientProvider>,
  );
}
describe("Student row action permissions", () => {
  beforeEach(() => {
    state.loading = false;
    state.write = true;
    state.remove = true;
  });
  it("offers edit and deletion for a permitted assigned student", () => {
    const html = render();
    expect(html).toContain('aria-label="Chỉnh sửa học sinh HS-001"');
    expect(html).toContain('aria-label="Xóa học sinh HS-001"');
    expect(html).toContain(
      'href="/director/students/HS-001?tab=student-profile&amp;edit=personal"',
    );
  });
  it("keeps only navigation for a read-only grant", () => {
    state.write = false;
    state.remove = false;
    const html = render();
    expect(html).toContain("Xem chi tiết");
    expect(html).not.toContain('aria-label="Chỉnh sửa');
    expect(html).not.toContain('aria-label="Xóa');
  });
  it("does not infer ownership from an identical display name", () => {
    expect(
      render({ ...student, ownerId: "another-owner", owner: "Sale" }),
    ).toBe("");
    expect(render({ ...student, ownerId: null, owner: "Sale" })).toBe("");
  });
  it("hides actions while authentication is loading", () => {
    state.loading = true;
    expect(render()).toBe("");
  });
});
