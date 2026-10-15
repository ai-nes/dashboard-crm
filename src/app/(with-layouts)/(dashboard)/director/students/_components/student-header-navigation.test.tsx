import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import StudentHeader from "./student-header";

vi.mock("./student-copy-badge", () => ({ default: () => null }));
vi.mock("./student-gauge-chart", () => ({ default: () => null }));
vi.mock("./student-owner-cell", () => ({ default: () => null }));
vi.mock("./student-tags-cell", () => ({ default: () => null }));
vi.mock("./student-status-workflow", () => ({
  default: ({
    currentStatusLabel,
    onTransition,
    value,
  }: {
    currentStatusLabel?: string;
    onTransition?: (status: string) => void;
    value: string;
  }) =>
    onTransition ? (
      <div>
        <span>{currentStatusLabel ?? value}</span>
        <button>Đã kết nối</button>
      </div>
    ) : null,
}));
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

  it("shows the legacy status and transition action when CRM Student exists", () => {
    const html = renderToStaticMarkup(
      <StudentHeader
        data={
          {
            student: {
              name: "Nguyễn Minh Anh",
              initials: "NMA",
              studentStage: "Attempting",
            },
            insight: {},
          } as never
        }
        studentId="student-internal-id"
        status="Attempting"
        statusLabel="Đã liên hệ"
        onStatusChange={vi.fn()}
      />,
    );

    expect(html).toContain("Đã liên hệ");
    expect(html).toContain("Đã kết nối");
    expect(html).not.toContain("Chưa có CRM Student");
  });
});
