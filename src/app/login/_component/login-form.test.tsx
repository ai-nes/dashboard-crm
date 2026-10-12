import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  AUTH_QUERY_KEY: ["auth"],
  useAuth: () => ({ user: null, refetch: vi.fn() }),
}));
vi.mock("@/services/api/auth", () => ({ loginWithPassword: vi.fn() }));

describe("login form password recovery entry point", () => {
  it("links to the forgot-password flow", () => {
    const html = renderToStaticMarkup(<LoginForm />);
    expect(html).toContain('href="/forgot-password"');
    expect(html).toContain("Quên mật khẩu?");
  });
});
