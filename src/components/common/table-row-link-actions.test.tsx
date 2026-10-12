import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TableRowLinkActions } from "./table-row-link-actions";

const state = vi.hoisted(() => ({ read: true, route: true, loading: false }));
vi.mock("@/components/common/auth/auth-provider", () => ({ useAuth: () => ({ user: { roles: ["Sale"], crm_capabilities: [] }, isLoading: state.loading }) }));
vi.mock("@/components/common/auth/permissions", () => ({ canReadCrmPath: () => state.read }));
vi.mock("@/components/common/auth/rbac", () => ({ canAccessDashboardPath: () => state.route }));
vi.mock("@/components/tailgrids/core/dropdown", async () => import("@/test-utils/open-dropdown"));

describe("Record navigation row actions", () => {
  beforeEach(() => { state.read = true; state.route = true; state.loading = false; });
  const render = () => renderToStaticMarkup(<TableRowLinkActions label="HS-001" href="/director/students/HS-001" />);
  it("shows the real record link when both permissions allow access", () => {
    expect(render()).toContain('href="/director/students/HS-001"');
  });
  it.each(["read", "route", "loading"] as const)("hides navigation when blocked by %s", (condition) => {
    state[condition] = condition === "loading";
    expect(render()).toBe("");
  });
});
