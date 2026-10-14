import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import StudentHeader from "./student-header";

vi.mock("./student-copy-badge", () => ({ default: () => null }));
vi.mock("./student-gauge-chart", () => ({ default: () => null }));
vi.mock("./student-owner-cell", () => ({ default: () => null }));
vi.mock("./student-tags-cell", () => ({ default: () => null }));
vi.mock("./student-status-workflow", () => ({ default: () => null }));
vi.mock("./student-stage-border", () => ({ default: () => null }));

const data = {
  student: { name: "Nguyễn Minh Anh", initials: "NMA" },
  insight: {},
} as never;

describe("StudentHeader return navigation", () => {
  it("returns to the segment carried by the detail URL", () => {
    const html = renderToStaticMarkup(
      <StudentHeader
        data={data}
        studentId="student-internal-id"
        returnTo="/lead-sale/segments/SEG-001?tab=overview&page=2"
      />,
    );

    expect(html).toContain(
      'href="/lead-sale/segments/SEG-001?tab=overview&amp;page=2"',
    );
  });

  it("keeps direct navigation on the existing student-list fallback for unsafe paths", () => {
    const html = renderToStaticMarkup(
      <StudentHeader
        data={data}
        studentId="student-internal-id"
        returnTo="https://external.example/segments/SEG-001"
      />,
    );

    expect(html).toContain('href="/director/students"');
    expect(html).not.toContain("external.example");
  });
});
