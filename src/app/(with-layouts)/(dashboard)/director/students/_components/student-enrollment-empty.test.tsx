import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import StudentAdmissionManagementMockup from "./student-admission-management-mockup";
import StudentPaymentInvoicesMockup from "./student-payment-invoices-mockup";

describe("Student enrollment without recorded data", () => {
  it("does not manufacture enrollment, student number or fees", () => {
    const html = renderToStaticMarkup(<StudentAdmissionManagementMockup />);
    expect(html).not.toContain("SE220398");
    expect(html).not.toContain("Đã hoàn thành hồ sơ");
    expect(html).not.toContain("13446650");
  });
  it("does not manufacture bank transactions", () => {
    const html = renderToStaticMarkup(<StudentPaymentInvoicesMockup />);
    expect(html).not.toContain("VIETINBANK");
    expect(html).not.toContain("21,306,650");
    expect(html).toContain("Chưa có hóa đơn thanh toán");
  });
  it("shows the enrollment and profile statuses recorded for this student", () => {
    const html = renderToStaticMarkup(
      <StudentAdmissionManagementMockup
        profile={{ enrollmentStatus: "Eligible", profileStatus: "Active" }}
      />,
    );
    expect(html).toContain("Đủ điều kiện nhập học");
    expect(html).toContain("Đang hoàn thiện hồ sơ");
    expect(html).not.toContain("SE220398");
  });
});
