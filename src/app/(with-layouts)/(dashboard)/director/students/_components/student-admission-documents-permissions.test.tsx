import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { computeStudent360 } from "@/services/api/students";
import StudentAdmissionDocumentsMockup from "./student-admission-documents-mockup";
import StudentAdmissionTabs from "./student-admission-tabs";
import StudentEnglishCertificateFields from "./student-english-certificate-fields";

const permission = vi.hoisted(() => ({
  studentRead: true,
  studentWrite: false,
  profileRead: true,
  documentCreate: true,
  paymentAccountRead: false,
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: { user: "u1" } }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  getCrmPermissions: () => ({
    student: {
      canRead: permission.studentRead,
      canWrite: permission.studentWrite,
      readScope: "all",
    },
  }),
  canAccessStudent: () => permission.studentRead,
  canPerformStudentAction: () => permission.studentWrite,
  getCrmDoctypePermissions: (_user: unknown, documentType: string) => {
    if (documentType === "CRM Student Admission Profile") {
      return { canRead: permission.profileRead };
    }
    if (documentType === "CRM Student Document") {
      return { canCreate: permission.documentCreate };
    }
    if (documentType === "CRM Student Payment Account") {
      return { canRead: permission.paymentAccountRead };
    }
    return {};
  },
}));

describe("student document and certificate permissions", () => {
  it("allows document upload from its own create grant without Student write", () => {
    permission.studentRead = true;
    permission.studentWrite = false;
    permission.profileRead = true;
    permission.documentCreate = true;
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
    expect(html.includes("Tải tài liệu")).toBe(true);
  });

  it("hides upload when document create is denied even if Student write is allowed", () => {
    permission.studentRead = true;
    permission.studentWrite = true;
    permission.profileRead = true;
    permission.documentCreate = false;
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
    expect(html.includes("Tải tài liệu")).toBe(false);
  });

  it("hides payment invoice tab when payment-account read is denied", () => {
    permission.paymentAccountRead = false;
    const data = computeStudent360("nguyen-minh-an");
    if (!data) throw new Error("Missing student fixture");
    const html = renderToStaticMarkup(<StudentAdmissionTabs data={data} />);
    expect(html.includes("Hóa đơn thanh toán")).toBe(false);
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
