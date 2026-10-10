import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/services/api/auth";

import ScoreTemplatePanel from "./score-template-panel";

const state = vi.hoisted(() => ({
  user: {
    user: "director@example.test",
    email: "director@example.test",
    full_name: "Director",
    user_image: null,
    roles: ["Admissions Director"],
    crm_profile: "admissions_director" as string | null,
    crm_role: "Admissions Director",
    crm_capabilities: [],
    crm_doctype_permissions: {} as CurrentUser["crm_doctype_permissions"],
  },
  queryCalls: 0,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: state.user }),
}));
vi.mock("@/components/common/delete-record-dialog", () => ({
  ConfirmDialog: () => null,
}));
vi.mock("@/hooks/use-admin-catalog-queries", () => ({
  useScoreTemplatesQuery: () => {
    state.queryCalls += 1;
    return {
      data: {
        templates: [
          {
            name: "template-1",
            template_name: "Director template",
            status: "Active",
            modified: "2026-10-10T08:00:00Z",
            policy_revision: 1,
          },
        ],
        total: 1,
      },
      isPending: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    };
  },
  useDeleteScoreTemplateMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

function renderPanel() {
  return renderToStaticMarkup(<ScoreTemplatePanel />);
}

function grant(overrides: {
  read?: boolean;
  write?: boolean;
  create?: boolean;
  delete?: boolean;
} = {}) {
  return {
    row_scope: "no_case_scope",
    read: overrides.read ?? true,
    write: overrides.write ?? false,
    create: overrides.create ?? false,
    delete: overrides.delete ?? false,
    export: false,
  };
}

describe("Score Template list permissions", () => {
  beforeEach(() => {
    state.user.roles = ["Admissions Director"];
    state.user.crm_profile = "admissions_director";
    state.user.crm_doctype_permissions = {};
    state.queryCalls = 0;
  });

  it("does not fetch or display templates without a read grant", () => {
    state.user.roles = ["System Manager"];

    expect(renderPanel()).toContain("Bạn không có quyền xem Score Template.");
    expect(state.queryCalls).toBe(0);
  });

  it("lets read-only users view rows without create, edit, or delete actions", () => {
    state.user.crm_doctype_permissions = {
      "CRM Score Template": grant({ read: true }),
    };

    const html = renderPanel();
    expect(html).toContain("Director template");
    expect(html).not.toContain("Thêm template");
    expect(html).not.toContain('aria-label="Sửa"');
    expect(html).not.toContain('aria-label="Xóa"');
    expect(state.queryCalls).toBe(1);
  });

  it("renders only the create and delete actions granted by the server", () => {
    state.user.crm_doctype_permissions = {
      "CRM Score Template": grant({
        read: true,
        create: true,
        delete: true,
      }),
    };

    const html = renderPanel();
    expect(html).toContain("Thêm template");
    expect(html).toContain('aria-label="Xóa"');
    expect(html).not.toContain('aria-label="Sửa"');
  });
});
