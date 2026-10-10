import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import StudentHighSchoolScoreMockup from "./student-high-school-score-mockup";

const permissions = vi.hoisted(() => ({ admissionProfileRead: false }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    user: {
      user: "u1",
      roles: [],
      crm_doctype_permissions: {
        "CRM Student": { read: true, write: true, row_scope: "all" },
        "CRM Student Admission Profile": {
          read: permissions.admissionProfileRead,
        },
      },
    },
  }),
}));

describe("student high-school profile score permissions", () => {
  it("hides admission-profile fields while retaining Student score fields", () => {
    permissions.admissionProfileRead = false;
    const client = new QueryClient();
    client.setQueryData(["student-high-school-score", "s1", "2026"], {
      doctype: "CRM Student",
      name: "s1",
      admission_profile: "profile-1",
      admission_year: "2026",
      fields: {
        grade_12_gpa: 8.5,
        exam_candidate_number: "A123",
        transcript_score: 9,
        total_score: 26,
      },
    });

    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <StudentHighSchoolScoreMockup
          data={{ student: { admissionYear: "2026" } }}
          studentId="s1"
          canEdit
        />
      </QueryClientProvider>,
    );

    expect(html).not.toContain("Điểm TB lớp 12");
    expect(html).not.toContain("Số báo danh");
    expect(html).toContain("Điểm học bạ CRM tính (TB điểm)");
    expect(html).toContain("Tổng điểm xét tuyển");
  });
});
