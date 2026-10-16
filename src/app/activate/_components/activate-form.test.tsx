import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ActivateForm } from "./activate-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
}));

describe("activation form", () => {
  it("asks only for the license key", () => {
    const html = renderToStaticMarkup(<ActivateForm />);

    expect(html).toContain('name="licenseKey"');
    expect(html).toContain("Kích hoạt");
    expect(html).not.toContain('name="password"');
  });
});
