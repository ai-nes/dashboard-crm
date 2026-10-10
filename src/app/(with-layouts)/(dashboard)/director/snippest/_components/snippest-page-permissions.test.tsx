import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SnippestPage from "./snippest-page";

const session = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: session.user, isLoading: false }),
}));

function userWithSnippetPermissions(grants: {
  read: boolean;
  create: boolean;
  write: boolean;
  delete: boolean;
}) {
  return {
    user: "director@example.test",
    crm_user_id: "user-director-1",
    email: "director@example.test",
    full_name: "Director",
    user_image: null,
    roles: ["Admissions Director"],
    crm_profile: "admissions_director",
    crm_role: "Admissions Director",
    crm_capabilities: [],
    crm_doctype_permissions: {
      "CRM Snippet": {
        ...grants,
        export: false,
        row_scope: "all",
      },
    },
  };
}

describe("Director snippet permissions", () => {
  it("hides the page and stops rendering snippet actions without read access", () => {
    session.user = userWithSnippetPermissions({
      read: false,
      create: true,
      write: true,
      delete: true,
    });

    const html = renderToStaticMarkup(<SnippestPage />);

    expect(html).toContain("Bạn không có quyền xem snippet.");
    expect(html).not.toContain("Quản lý snippet");
    expect(html).not.toContain("Tạo snippet");
  });

  it("uses the session create grant to show creation and keep read-only view available", () => {
    session.user = userWithSnippetPermissions({
      read: true,
      create: false,
      write: false,
      delete: false,
    });

    const html = renderToStaticMarkup(<SnippestPage />);

    expect(html).toContain("Snippet");
    expect(html).not.toContain("Tạo snippet");
  });
});
