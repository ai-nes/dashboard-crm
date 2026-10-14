import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ForgotPasswordForm from "./forgot-password-form";

vi.mock("@/services/api/auth", () => ({ requestPasswordReset: vi.fn() }));

describe("forgot password form", () => {
  it("asks for an email and explains that account existence is kept private", () => {
    const html = renderToStaticMarkup(<ForgotPasswordForm />);
    expect(html).toContain('type="email"');
    expect(html).toContain('name="email"');
    expect(html).toContain("Gửi liên kết đặt lại");
    expect(html).toContain(
      "thông báo sẽ giống nhau để bảo vệ thông tin tài khoản",
    );
  });
});
