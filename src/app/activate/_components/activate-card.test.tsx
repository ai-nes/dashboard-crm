import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ActivateCard } from "./activate-card";

const auth = vi.hoisted(() => ({ user: null as unknown }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: { status: "NOT_ACTIVATED" } }),
  useQueryClient: () => ({
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  AUTH_QUERY_KEY: ["auth"],
  useAuth: () => ({ user: auth.user }),
}));
vi.mock("@/services/api/auth", () => ({ logout: vi.fn() }));

describe("activation card", () => {
  it("lets an administrator enter the license key", () => {
    auth.user = { email: "admin@example.com", crm_is_administrator: true };
    const html = renderToStaticMarkup(<ActivateCard />);

    expect(html).toContain('name="licenseKey"');
    expect(html).toContain("Đăng xuất");
  });

  it("tells other users to contact an administrator, without a key field", () => {
    auth.user = { email: "sale@example.com", crm_is_administrator: false };
    const html = renderToStaticMarkup(<ActivateCard />);

    expect(html).not.toContain('name="licenseKey"');
    expect(html).toContain("liên hệ quản trị viên");
  });
});
