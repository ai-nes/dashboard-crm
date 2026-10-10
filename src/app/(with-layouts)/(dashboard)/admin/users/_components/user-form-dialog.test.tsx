import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { CrmUser } from "@/services/api/user-management";
import UserFormDialog from "./user-form-dialog";

// SSR has no portal target. Keep the form and its real field components intact.
vi.mock("@/components/tailgrids/core/overlay", () => ({
  Backdrop: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("react-aria-components", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    Modal: ({ children }: { children: ReactNode }) => <>{children}</>,
    Dialog: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

const campus = {
  id: "campus-hcm",
  name: "FPTU Ho Chi Minh Campus",
  code: "HCM",
};
const user: CrmUser = {
  name: "u1",
  email: "sale@example.test",
  fullName: "Sale One",
  userImage: null,
  enabled: true,
  role: "Sale",
  crmRoleState: null,
  sessionUser: false,
  campus,
};
function render(user: CrmUser | null, loading = false) {
  return renderToStaticMarkup(
    <UserFormDialog
      isOpen
      user={user}
      campusOptions={[campus]}
      isCampusLoading={loading}
      onOpenChange={vi.fn()}
      onCreate={vi.fn()}
      onUpdate={vi.fn()}
    />,
  );
}
describe("User form Campus selection", () => {
  it("offers Campus selection when creating a user", () => {
    expect(render(null)).toContain('aria-label="Campus"');
    expect(render(null)).toContain("Chưa có Campus");
  });
  it("prefills the existing Campus when editing a user", () => {
    expect(render(user)).toContain("FPTU Ho Chi Minh Campus");
  });
  it("keeps an assigned Campus visible even when absent from options", () => {
    expect(
      render({ ...user, campus: { ...campus, id: "retired-campus" } }),
    ).toContain(campus.name);
  });
  it("explains that Campus options are loading", () => {
    expect(render(null, true)).toContain("Đang tải Campus…");
  });
});
