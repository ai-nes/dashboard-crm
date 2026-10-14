import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ResetPasswordForm from "./reset-password-form";

vi.mock("@/services/api/auth", () => ({ resetPassword: vi.fn() }));

describe("reset password form", () => {
  it("requires a token and matching-strength password fields", () => {
    const html = renderToStaticMarkup(
      <ResetPasswordForm token="reset-token" />,
    );
    expect(html).toContain('name="password"');
    expect(html).toContain('name="confirmPassword"');
    expect(html).toContain('minLength="12"');
  });

  it("offers a fresh request when the token is missing or invalid", () => {
    const html = renderToStaticMarkup(<ResetPasswordForm token="" />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('href="/forgot-password"');
    expect(html).toContain("Yêu cầu liên kết mới");
  });
});
