import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UserManagementAdminPage from "./user-management-admin-page";

const queryState = vi.hoisted(() => ({ error: null as Error | null }));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: { roles: ["System Manager"] } }),
}));
vi.mock("@/hooks/use-admin-catalog-queries", () => ({
  useGovernedValuesQuery: () => ({
    data: { records: [] },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/hooks/use-user-management-queries", () => ({
  useCrmUsersQuery: () => ({
    data: undefined,
    error: queryState.error,
    isPending: false,
    refetch: vi.fn(),
  }),
  useCreateCrmUserMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveUserMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCrmUserProfileMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateUserRoleMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/components/common/admin/admin-tabs", () => ({
  AdminTabRoot: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AdminTabList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AdminTabContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/tailgrids/core/tabs", () => ({
  TabTrigger: () => null,
}));
vi.mock("./remove-user-confirm-dialog", () => ({ default: () => null }));
vi.mock("./user-form-dialog", () => ({ default: () => null }));
vi.mock("./user-permission-panel", () => ({ default: () => null }));
vi.mock("./users-table", () => ({ default: () => null }));

describe("user-management list error state", () => {
  beforeEach(() => {
    queryState.error = new Error("Vai trò CRM không hợp lệ.");
  });

  it("keeps search and role filters available so the request can be recovered", () => {
    const html = renderToStaticMarkup(<UserManagementAdminPage />);

    expect(html).toContain("Vai trò CRM không hợp lệ.");
    expect(html).toContain('aria-label="Tìm người dùng theo tên hoặc email"');
    expect(html).toContain('aria-label="Lọc theo vai trò"');
    expect(html).toContain("Thử lại");
  });
});
