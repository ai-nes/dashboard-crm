import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { computeStudent360 } from "@/services/api/students";
import StudentAdmissionDocumentsMockup from "./student-admission-documents-mockup";
import StudentEnglishCertificateFields from "./student-english-certificate-fields";

const permission = vi.hoisted(() => ({ allowed: false }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: { user: "u1" } }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  getCrmPermissions: () => ({ student: {} }),
  canPerformStudentAction: () => permission.allowed,
}));

describe("student document and certificate permissions", () => {
  it.each([true, false])("shows upload only when allowed: %s", (allowed) => {
    permission.allowed = allowed;
    const data = computeStudent360("nguyen-minh-an");
    if (!data) throw new Error("Missing student fixture");
    data.admissionProfiles = [
      {
        id: "p1",
        student: "s1",
        profileTemplate: "t1",
        admissionYear: "2026",
        attemptNumber: 1,
        profileStatus: "Draft",
        enrollmentStatus: "Not Started",
        revision: 1,
        requirements: [
          {
            sectionCode: "basic_admission",
            documentType: "d1",
            documentCode: "ID",
            documentLabel: "Identity",
            requirementGroup: "identity",
            requirementMode: "ALL",
            isRequired: true,
            minimumRequired: 1,
            quantity: 1,
            orderDisplay: 1,
            documents: [],
            hasDocument: false,
          },
        ],
      },
    ];
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <StudentAdmissionDocumentsMockup data={data} />
      </QueryClientProvider>,
    );
    expect(html.includes("Tải tài liệu")).toBe(allowed);
  });
  it.each([true, false])(
    "keeps certificate inputs read-only without editing permission: %s",
    (allowed) => {
      const client = new QueryClient();
      client.setQueryData(["student-english-certificate", "s1"], {
        id: "c1",
        certificate_name: "IELTS",
        score_level: "7.5",
        issue_date: "2026-01-01",
        expiry_date: "2028-01-01",
      });
      const html = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <StudentEnglishCertificateFields studentId="s1" canEdit={allowed} />
        </QueryClientProvider>,
      );
      expect(html.includes('value="IELTS"')).toBe(true);
      expect(html.includes('readOnly=""')).toBe(!allowed);
    },
  );
});
