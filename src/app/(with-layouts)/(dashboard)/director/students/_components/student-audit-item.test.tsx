import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { StudentAuditLog } from "@/services/api/student-audit";
import StudentAuditItem from "./student-audit-item";

const event: StudentAuditLog = {
  eventId: "audit-1",
  action: "updated",
  changeType: "changed",
  doctype: "CRM Student Admission Profile",
  docname: "profile-1",
  fieldname: null,
  fieldLabel: null,
  oldValue: null,
  newValue: null,
  owner: "user-1",
  ownerFullName: "Lead Sales",
  occurredAt: "2026-10-10T04:01:00Z",
  source: "Student Audit Event",
  sourceName: "profile-1",
  eventType: "admission_profile_updated",
  category: "record",
  subject: "Hồ sơ xét tuyển",
  metadata: {
    before: { grade12Gpa: null, examCandidateNumber: null, priorityScore: 2 },
    after: { grade12Gpa: 10, examCandidateNumber: "112", priorityScore: 0 },
    changes: [
      {
        fieldname: "grade12Gpa",
        fieldLabel: "Điểm trung bình lớp 12",
        oldValue: null,
        newValue: 10,
      },
      {
        fieldname: "examCandidateNumber",
        fieldLabel: "Số báo danh",
        oldValue: null,
        newValue: "112",
      },
      {
        fieldname: "priorityScore",
        fieldLabel: "Điểm ưu tiên",
        oldValue: 2,
        newValue: 0,
      },
    ],
  },
};
const text = (log: StudentAuditLog) =>
  renderToStaticMarkup(<StudentAuditItem event={log} />)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

describe("Student audit diary content", () => {
  it("renders one actor and readable field changes instead of raw audit JSON", () => {
    expect(
      renderToStaticMarkup(<StudentAuditItem event={event} />),
    ).not.toContain("<table");
    const content = text(event);
    expect(content).toContain("Lead Sales đã cập nhật Hồ sơ xét tuyển");
    expect(content).toContain(
      "Điểm trung bình lớp 12 từ Chưa có giá trị tới 10",
    );
    expect(content).toContain("Số báo danh từ Chưa có giá trị tới 112");
    expect(content).toContain("Điểm ưu tiên từ 2 tới 0");
    expect(content).toContain("Chưa có giá trị");
    expect(content).not.toMatch(
      /Before|After|Changes|grade12Gpa|oldValue|CRM Student Admission Profile|Student Audit Event/,
    );
    expect(content).not.toContain("Nhân viên Sale");
  });

  it("keeps legacy single-field logs and shows removed or boolean values clearly", () => {
    const content = text({
      ...event,
      doctype: "CRM Student",
      subject: "Thí sinh",
      fieldname: "isOptedOut",
      fieldLabel: "Từ chối liên hệ",
      oldValue: true,
      newValue: false,
      metadata: null,
    });
    expect(content).toContain("Từ chối liên hệ từ Có tới Không");
    expect(
      text({
        ...event,
        fieldname: "email",
        fieldLabel: "Email",
        oldValue: "student@example.test",
        newValue: null,
        metadata: null,
      }),
    ).toContain("Email từ student@example.test tới Chưa có giá trị");
  });

  it("identifies created and deleted child data and presents snapshots without JSON", () => {
    const created = text({
      ...event,
      action: "created",
      doctype: "CRM Note",
      subject: "Ghi chú",
      content: "Đã gọi phụ huynh",
      metadata: {
        after: { title: "Cuộc gọi", content: "Đã gọi phụ huynh" },
        fieldLabels: { title: "Tiêu đề", content: "Nội dung" },
      },
    });
    expect(created).toContain("Lead Sales đã tạo Ghi chú");
    expect(created).toContain("Đã gọi phụ huynh");
    expect(created).not.toContain("After");
    const deleted = text({
      ...event,
      action: "deleted",
      doctype: "File",
      subject: "Tệp đính kèm",
      metadata: {
        before: { fileName: "Học bạ.pdf" },
        fieldLabels: { fileName: "Tên tệp" },
      },
    });
    expect(deleted).toContain("Lead Sales đã xóa Tệp đính kèm");
    expect(deleted).toContain("Học bạ.pdf");
    expect(deleted).not.toContain("Before");
  });

  it("uses resolved reference labels while retaining the underlying field values", () => {
    const content = text({
      ...event,
      fieldname: "highSchoolId",
      fieldLabel: "Trường THPT",
      oldValue: "old-school-id",
      newValue: "new-school-id",
      metadata: {
        changes: [
          {
            fieldname: "highSchoolId",
            fieldLabel: "Trường THPT",
            oldValue: "old-school-id",
            newValue: "new-school-id",
            oldValueLabel: "THPT Nguyễn Trãi",
            newValueLabel: "THPT Lê Quý Đôn",
          },
        ],
      },
    });
    expect(content).toContain(
      "Trường THPT từ THPT Nguyễn Trãi tới THPT Lê Quý Đôn",
    );
    expect(content).not.toContain("old-school-id");
    expect(content).not.toContain("new-school-id");
  });

  it("keeps attachment links and extra content alongside field details", () => {
    const markup = renderToStaticMarkup(
      <StudentAuditItem
        event={{
          ...event,
          action: "created",
          content: "Học bạ đã xác minh",
          metadata: {
            file_url: "/api/v1/files/file-1/content",
            changes: [
              {
                fieldname: "fileName",
                fieldLabel: "Tên tệp",
                oldValue: null,
                newValue: "Học bạ.pdf",
              },
            ],
          },
        }}
      />,
    );
    expect(markup).toContain('href="/api/v1/files/file-1/content"');
    expect(markup).toContain("Học bạ đã xác minh");
  });
});
