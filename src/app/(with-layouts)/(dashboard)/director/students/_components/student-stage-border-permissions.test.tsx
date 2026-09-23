import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { computeStudent360 } from "@/services/api/students";
import StudentHeader from "./student-header";

vi.mock("./student-stage-border", () => ({
  default: () => <div>stage-history-mounted</div>,
}));
vi.mock("./student-owner-cell", () => ({ default: () => null }));
vi.mock("./student-tags-cell", () => ({ default: () => null }));
vi.mock("./student-gauge-chart", () => ({ default: () => null }));

describe("student stage history visibility", () => {
  it.each([
    { allowed: true, canonicalId: "STUDENT-1", visible: true },
    { allowed: false, canonicalId: "STUDENT-1", visible: false },
    { allowed: true, canonicalId: null, visible: false },
  ])(
    "mounts history only with permission and a canonical student: $allowed / $canonicalId",
    ({ allowed, canonicalId, visible }) => {
      const data = computeStudent360("nguyen-minh-an");
      expect(data).not.toBeNull();
      if (!data) throw new Error("Missing student fixture");
      const html = renderToStaticMarkup(
        <StudentHeader
          data={data}
          studentId="legacy-id"
          tagStudentId={canonicalId}
          status="Connected"
          canViewStageHistory={allowed}
        />,
      );
      expect(html.includes("stage-history-mounted")).toBe(visible);
    },
  );
});
