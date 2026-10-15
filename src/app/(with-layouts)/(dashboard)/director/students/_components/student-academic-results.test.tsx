import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import StudentAcademicResults, {
  StudentAcademicResultsTable,
} from "./student-academic-results";
const query = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-query", () => ({
  useQuery: query,
  useQueryClient: () => ({}),
  useMutation: () => ({ isPending: false }),
}));
it("does not fetch academic data without read access", () => {
  expect(
    renderToStaticMarkup(
      <StudentAcademicResults studentId="S" canRead={false} />,
    ),
  ).toBe("");
  expect(query).not.toHaveBeenCalled();
});
it("shows the academic edit action only with update access", () => {
  query.mockReturnValue({
    data: [
      {
        id: "12",
        school_year: "2025-2026",
        grade: "12",
        gpa: 8.8,
        academic_rank: "Giỏi",
      },
    ],
  });
  expect(
    renderToStaticMarkup(
      <StudentAcademicResults studentId="S" canRead canEdit />,
    ),
  ).toContain("Chỉnh sửa");
  expect(
    renderToStaticMarkup(
      <StudentAcademicResults studentId="S" canRead canEdit={false} />,
    ),
  ).not.toContain("Chỉnh sửa");
});
it("can add the first academic year when the transcript is empty", () => {
  query.mockReturnValue({ data: [] });
  expect(
    renderToStaticMarkup(
      <StudentAcademicResults studentId="S" canRead canEdit />,
    ),
  ).toContain("Thêm năm học");
  expect(
    renderToStaticMarkup(
      <StudentAcademicResults studentId="S" canRead canEdit={false} />,
    ),
  ).not.toContain("Thêm năm học");
});
it("only shows delete for users with delete access", () => {
  const results = [
    {
      id: "12",
      school_year: "2025-2026",
      grade: "12",
      gpa: 8.8,
      academic_rank: "Giỏi",
    },
  ];
  expect(
    renderToStaticMarkup(
      <StudentAcademicResultsTable results={results} studentId="S" canDelete />,
    ),
  ).toContain("Xóa năm học 2025-2026");
  expect(
    renderToStaticMarkup(
      <StudentAcademicResultsTable
        results={results}
        studentId="S"
        canEdit
        canDelete={false}
      />,
    ),
  ).not.toContain("Xóa năm học");
});
it("shows all three school years without inventing missing grades", () => {
  const html = renderToStaticMarkup(
    <StudentAcademicResultsTable
      results={[
        {
          id: "12",
          school_year: "2025-2026",
          grade: "12",
          gpa: 8.8,
          academic_rank: "Giỏi",
        },
        {
          id: "10",
          school_year: "2023-2024",
          grade: "10",
          gpa: 8.4,
          academic_rank: "Giỏi",
        },
        {
          id: "11",
          school_year: "2024-2025",
          grade: "11",
          gpa: null,
          academic_rank: null,
        },
      ]}
    />,
  );
  expect(html.indexOf("2023-2024")).toBeLessThan(html.indexOf("2025-2026"));
  expect(html).toContain("8,8");
  expect(html).toContain("Giỏi");
  expect(html).toContain("—");
});
