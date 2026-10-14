import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import AccountPage from "./page";

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    user: {
      full_name: "Local Admin",
      email: "admin@example.test",
      user_image: null,
    },
  }),
}));

describe("account profile details", () => {
  it("shows the signed-in identity in Vietnamese and hides unsupported settings", () => {
    const html = renderToStaticMarkup(<AccountPage />);

    expect(html).toContain('value="Local Admin"');
    expect(html).toContain('value="admin@example.test"');
    expect(html).not.toContain("Jhon Smith");
    expect(html).not.toContain("jhon@example.com");
    expect(html).toContain("Thông tin tài khoản");
    expect(html).toContain("Họ và tên");
    expect(html).toContain("Địa chỉ email");
    expect(html).not.toContain('type="file"');
    expect(html).toContain("Đổi mật khẩu");
    expect(html).toContain('name="currentPassword"');
    expect(html).toContain('name="newPassword"');
    expect(html).toContain('name="confirmPassword"');
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('minLength="6"');
    expect(html).toContain('maxLength="128"');
    for (const unsupportedName of [
      "phone",
      "website",
      "address",
      "country",
      "bio",
    ]) {
      expect(html).not.toContain(`name="${unsupportedName}"`);
    }
    expect(html).not.toContain("Sign Out");
    expect(html).not.toContain("Delete Account");
  });
});
