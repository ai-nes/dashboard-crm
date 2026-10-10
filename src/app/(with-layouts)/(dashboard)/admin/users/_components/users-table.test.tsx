import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { CrmUser } from "@/services/api/user-management";

import UsersTable from "./users-table";

vi.mock("./role-select-dropdown", () => ({
  default: ({ value, disabled }: { value: string; disabled: boolean }) => (
    <button aria-label="Đổi vai trò" disabled={disabled}>
      {value}
    </button>
  ),
}));

const systemManager: CrmUser = {
  name: "manager@example.test",
  email: "manager@example.test",
  fullName: "System Manager",
  userImage: null,
  enabled: true,
  role: "System Manager",
  crmRoleState: null,
  sessionUser: false,
};

function renderTable(canManageUsers: boolean, isMutating = false) {
  return renderToStaticMarkup(
    <UsersTable
      users={[systemManager]}
      total={1}
      isLoading={false}
      canManageUsers={canManageUsers}
      isMutating={isMutating}
      onChangeRole={vi.fn()}
      onEdit={vi.fn()}
      onRemove={vi.fn()}
      currentPage={1}
      totalPages={1}
      onPageChange={vi.fn()}
    />,
  );
}

describe("System Manager role editing", () => {
  it("omits the retired capacity column", () => {
    expect(renderTable(true)).not.toContain("Capacity");
  });
  it("shows an enabled role control when user management is permitted", () => {
    expect(renderTable(true)).toContain(
      '<button aria-label="Đổi vai trò">System Manager</button>',
    );
  });

  it("hides the role control and row actions when permission is denied", () => {
    const html = renderTable(false);
    expect(html).not.toContain('aria-label="Đổi vai trò"');
    expect(html).not.toContain('aria-label="Sửa System Manager"');
    expect(html).not.toContain('aria-label="Gỡ System Manager khỏi CRM"');
    expect(html).toContain("System Manager");
  });

  it("temporarily disables the role control while saving", () => {
    expect(renderTable(true, true)).toContain(
      '<button aria-label="Đổi vai trò" disabled="">System Manager</button>',
    );
  });
});
