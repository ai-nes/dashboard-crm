import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { SchoolReportData } from "@/services/api/schools/types";
import SchoolReportDashboard from "./school-report-dashboard";
const grants = vi.hoisted(() => ({ read: true, create: false }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    user: {
      crm_doctype_permissions: {
        "CRM High School": { read: grants.read, create: grants.create },
        "CRM Student": { read: true, row_scope: "all" },
      },
    },
  }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("./regional-distribution-chart", () => ({ default: () => null }));
vi.mock("./province-ranking-chart", () => ({ default: () => null }));
const data: SchoolReportData = {
  totalSchools: 0,
  totalProvinces: 0,
  prioritySchools: 0,
  averagePotential: 0,
  regions: [],
  provinces: [],
  priorityList: [],
};
function render() {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <SchoolReportDashboard data={data} />
    </QueryClientProvider>,
  );
}
describe("school report create permission", () => {
  it("shows create only with both report read and school create grants", () => {
    grants.read = true;
    grants.create = false;
    expect(render()).not.toContain("Thêm trường");
    grants.create = true;
    expect(render()).toContain("Thêm trường");
    grants.read = false;
    expect(render()).toBe("");
  });
});
