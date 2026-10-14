import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SegmentStudentTable } from "./segment-student-table";

const currentRoute = vi.hoisted(() => ({
  pathname: "/lead-sale/segments/SEG-001",
  search: "tab=overview&page=2",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentRoute.pathname,
  useSearchParams: () => new URLSearchParams(currentRoute.search),
}));

vi.mock("@/components/common/table-row-link-actions", () => ({
  TableRowLinkActions: ({ label, href }: { label: string; href: string }) => (
    <a href={href}>{label}</a>
  ),
}));

describe("segment student detail navigation", () => {
  it("carries the exact current segment route and query into the detail link", () => {
    const html = renderToStaticMarkup(
      <SegmentStudentTable
        students={[
          {
            id: "student-internal-id",
            code: "HS-2026-0001",
            name: "Nguyễn Minh Anh",
            phone: "",
            stage: "",
            major: "",
            potential: "",
            intent: "",
            owner: "",
          },
        ]}
      />,
    );

    expect(html).toContain(
      'href="/director/students/HS-2026-0001?returnTo=%2Flead-sale%2Fsegments%2FSEG-001%3Ftab%3Doverview%26page%3D2"',
    );
  });
});
