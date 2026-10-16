import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LicenseGate } from "./license-gate";

const navigation = vi.hoisted(() => ({ pathname: "/sale", replace: vi.fn() }));
const query = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => query.current,
}));

function render(pathname: string, state: Record<string, unknown>) {
  navigation.pathname = pathname;
  query.current = { isPending: false, isError: false, ...state };
  return renderToStaticMarkup(
    <LicenseGate>
      <p>CRM content</p>
    </LicenseGate>,
  );
}

beforeEach(() => navigation.replace.mockReset());

describe("LicenseGate", () => {
  it("shows the dashboard with an active license", () => {
    expect(render("/sale", { data: { status: "ACTIVE" } })).toContain(
      "CRM content",
    );
  });

  it("hides every dashboard screen without a license", () => {
    const html = render("/sale", { data: { status: "NOT_ACTIVATED" } });

    expect(html).not.toContain("CRM content");
  });

  it("renders only the activation page without a license", () => {
    expect(
      render("/activate", { data: { status: "LICENSE_EXPIRED" } }),
    ).toContain("CRM content");
  });

  it("does not show the activation page once licensed", () => {
    expect(render("/activate", { data: { status: "ACTIVE" } })).not.toContain(
      "CRM content",
    );
  });

  it("offers a retry when the backend cannot be reached", () => {
    const html = render("/sale", { isError: true, data: undefined });

    expect(html).toContain("Không kết nối được máy chủ CRM");
    expect(html).not.toContain("CRM content");
  });
});
