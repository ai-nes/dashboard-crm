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
  it("shows the signed-in identity and a real image picker instead of sample data", () => {
    const html = renderToStaticMarkup(<AccountPage />);

    expect(html).toContain('value="Local Admin"');
    expect(html).toContain('value="admin@example.test"');
    expect(html).not.toContain("Jhon Smith");
    expect(html).not.toContain("jhon@example.com");
    expect(html).toContain('type="file"');
    expect(html).toContain('accept="image/png,image/jpeg,image/gif"');
    expect(html).toContain("Change Avatar");
    expect(html).not.toContain('alt="United States"');
    expect(html).toContain("Thông tin hồ sơ chưa thể lưu");
    expect(html).toMatch(
      /<button[^>]*aria-disabled="true"[^>]*>Save Changes<\/button>/,
    );
  });
});
