import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DashboardHeader from "./dashboard-header";
import type { LeadSaleDashboardData } from "./lead-sale-dashboard.types";

describe("Lead Sale dashboard update time", () => {
  it("renders an ISO instant in Vietnam time with seconds", () => {
    const html = renderToStaticMarkup(
      <DashboardHeader
        data={
          {
            asOf: "2026-10-13T03:15:01.261Z",
            teamName: "QA",
            periodLabel: "2026",
            scopeLabel: "QA",
          } as LeadSaleDashboardData
        }
      />,
    );
    expect(html).toContain("10:15:01 · 13/10/2026");
    expect(html).not.toContain("2026-10-13T03:15:01.261Z");
  });
  it.each(["", "invalid"])("shows a useful fallback for %j", (asOf) => {
    const html = renderToStaticMarkup(
      <DashboardHeader
        data={
          {
            asOf,
            teamName: "QA",
            periodLabel: "2026",
            scopeLabel: "QA",
          } as LeadSaleDashboardData
        }
      />,
    );
    expect(html).toContain("Chưa cập nhật");
    expect(html).not.toContain("Invalid Date");
  });
});
