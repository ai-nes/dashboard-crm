import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OwnAssignmentHistory from "./own-assignment-history";

const access = vi.hoisted(() => ({ capability: true }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {}, isLoading: false }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  hasCrmCapability: (_user: unknown, capability: string) =>
    capability === "lead.support" && access.capability,
}));
vi.mock(
  "../../student-assignment/_components/assignment-batch-history",
  () => ({
    default: () => null,
  }),
);
vi.mock("../lead-support-queue/lead-support-queue", () => ({
  default: () => null,
}));

describe("OwnAssignmentHistory", () => {
  beforeEach(() => {
    access.capability = true;
  });

  it("shows the support queue tab to users who can complete leads", () => {
    const html = renderToStaticMarkup(<OwnAssignmentHistory />);
    expect(html).toContain("Lead cần bổ sung");
  });

  it("hides the support queue tab without the capability", () => {
    access.capability = false;
    const html = renderToStaticMarkup(<OwnAssignmentHistory />);
    expect(html).not.toContain("Lead cần bổ sung");
    expect(html).toContain("Lịch sử phân công");
  });
});
