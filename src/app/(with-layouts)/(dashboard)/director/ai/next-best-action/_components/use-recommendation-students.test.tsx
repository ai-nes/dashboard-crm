import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { DirectorNbaRecommendation } from "@/services/api/nba";
import { useRecommendationStudents } from "./use-recommendation-students";

const studentId = "student-record-id";
vi.mock("@tanstack/react-query", () => ({
  useQueries: () => [
    { data: { student: { name: "Nguyễn An", code: "HS-2026-014" } } },
  ],
}));
vi.mock("@/hooks/use-students-queries", () => ({
  studentsKeys: { student360: (id: string) => ["student-360", id] },
}));

const recommendations = [
  { studentId, studentName: null },
] as DirectorNbaRecommendation[];

function LookupResult() {
  const students = useRecommendationStudents(recommendations);
  return (
    <output>
      {students.studentNameById.get(studentId)}|
      {students.studentCodeById.get(studentId)}
    </output>
  );
}

describe("recommendation student lookup", () => {
  it("exposes the business code from the existing Student 360 lookup", () => {
    const html = renderToStaticMarkup(<LookupResult />);

    expect(html).toContain("Nguyễn An|HS-2026-014");
  });
});
