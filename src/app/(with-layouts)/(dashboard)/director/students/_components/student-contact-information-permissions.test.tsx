import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { computeStudent360 } from "@/services/api/students";
import StudentContactInformationMockup from "./student-contact-information-mockup";

const permission = vi.hoisted(() => ({ paymentRead: false, paymentWrite: false }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: { user: "u1" } }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  getCrmDoctypePermissions: (_user: unknown, documentType: string) =>
    documentType === "CRM Student Payment Account"
      ? {
          canRead: permission.paymentRead,
          canUpdate: permission.paymentWrite,
        }
      : { canRead: true, canUpdate: true },
}));
vi.mock("./use-student-profile-update", () => ({
  useStudentProfileUpdate: () => ({
    isPending: false,
    reset: vi.fn(),
    mutateAsync: vi.fn(),
  }),
}));

describe("student payment account fields", () => {
  it("does not reveal bank account values without payment-account read", () => {
    permission.paymentRead = false;
    permission.paymentWrite = true;
    const data = computeStudent360("nguyen-minh-an");
    if (!data) throw new Error("Missing student fixture");
    data.student.profileDetails = {
      ...data.student.profileDetails,
      contact: {
        ...data.student.profileDetails?.contact,
        bankName: "Private Bank",
        accountNumber: "000123456",
        accountHolder: "Private Person",
      },
    };

    const html = renderToStaticMarkup(
      <StudentContactInformationMockup data={data} studentId="s1" />,
    );

    expect(html).not.toContain("Private Bank");
    expect(html).not.toContain("000123456");
    expect(html).not.toContain("Private Person");
  });
});
