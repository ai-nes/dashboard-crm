import { describe, expect, it } from "vitest";

import {
  buildSegmentFilterOptions,
  fromBackendSegmentFilters,
  getClassificationTermLabel,
  getOptionsForSelectedClassificationGroup,
  getSelectedOptionLabels,
  getStudentStageBadgeColor,
  getStudentStageLabel,
  SegmentOperator,
  StudentSegmentProperty,
  toBackendSegmentFilters,
} from "./segment-filter-config";

describe("segment filter group names", () => {
  it("persists and restores a named filter group", () => {
    const filters = toBackendSegmentFilters([
      {
        id: "group-1",
        name: "Học sinh cần tư vấn học phí",
        logic: "AND",
        conditions: [
          {
            id: "condition-1",
            property: StudentSegmentProperty.POTENTIAL,
            operator: SegmentOperator.EQUAL,
            value: ["HIGH"],
          },
        ],
      },
    ]);

    expect(filters?.groups[0]?.name).toBe("Học sinh cần tư vấn học phí");
    expect(fromBackendSegmentFilters(filters).groups[0]?.name).toBe(
      "Học sinh cần tư vấn học phí",
    );
  });

  it("keeps a default name for legacy unnamed groups", () => {
    const filters = fromBackendSegmentFilters({
      logic: "OR",
      groups: [
        {
          logic: "AND",
          conditions: [{ field: "potential", operator: "=", value: "HIGH" }],
        },
      ],
    });

    expect(filters.groups[0]?.name).toBe("Nhóm 1");
  });
});

describe("segment classification options", () => {
  it("keeps the value picker inside the selected group", () => {
    const options = [
      {
        value: "application-deadline",
        label: "Hạn nộp hồ sơ",
        groupName: "NEED_APPLICATION",
      },
      {
        value: "document-support",
        label: "Hỗ trợ giấy tờ",
        groupName: "NEED_APPLICATION",
      },
      { value: "callback", label: "Gọi lại", groupName: "NEED_CONTACT" },
    ];

    expect(
      getOptionsForSelectedClassificationGroup(
        ["application-deadline", "document-support"],
        options,
      ),
    ).toEqual(options.slice(0, 2));
    expect(
      getOptionsForSelectedClassificationGroup([], options, "NEED_APPLICATION"),
    ).toEqual(options.slice(0, 2));
  });

  it("translates known English classification labels", () => {
    expect(
      getClassificationTermLabel({
        name: "application_deadline",
        label: "Application Deadline",
        code: null,
        group_name: "NEED_APPLICATION",
      }),
    ).toBe("Hạn nộp hồ sơ");
  });

  it.each([
    ["FIRST_CONTACT", "Liên hệ lần đầu"],
    ["FOLLOW_UP", "Theo dõi tiếp"],
    ["CALLBACK", "Gọi lại"],
    ["PROGRAM_INFORMATION", "Thông tin chương trình"],
    ["ADMISSION_INFORMATION", "Thông tin tuyển sinh"],
    ["TUITION_INFORMATION", "Thông tin học phí"],
    ["SCHOLARSHIP_INFORMATION", "Thông tin học bổng"],
    ["CAREER_INFORMATION", "Thông tin nghề nghiệp"],
    ["COUNSELING", "Tư vấn"],
    ["EVENT_ENGAGEMENT", "Tham gia sự kiện"],
    ["CAMPUS_EXPERIENCE", "Trải nghiệm cơ sở"],
    ["APPLICATION_GUIDANCE", "Hướng dẫn nộp hồ sơ"],
    ["APPLICATION_INCOMPLETE", "Hồ sơ chưa hoàn tất"],
    ["DOCUMENT_SUPPORT", "Hỗ trợ giấy tờ"],
    ["APPLICATION_DEADLINE", "Hạn nộp hồ sơ"],
    ["DECISION_SUPPORT", "Hỗ trợ ra quyết định"],
    ["ENROLLMENT_SUPPORT", "Hỗ trợ nhập học"],
    ["FINANCIAL_SUPPORT", "Hỗ trợ tài chính"],
    ["PARENT_INVOLVED", "Phụ huynh đồng hành"],
    ["PARENT_DECISION_MAKER", "Phụ huynh quyết định"],
    ["OTHER_DECISION_MAKER", "Người khác quyết định"],
    ["RE_ENGAGEMENT", "Tương tác lại"],
    ["NO_RESPONSE", "Chưa phản hồi"],
    ["NOT_READY", "Chưa sẵn sàng"],
    ["VIP", "VIP"],
    ["HIGH_PRIORITY", "Ưu tiên cao"],
    ["SPECIAL_ATTENTION", "Cần chú ý đặc biệt"],
    ["SPECIAL_CASE", "Trường hợp đặc biệt"],
    ["HARD_TO_REACH", "Khó liên hệ"],
    ["SPECIAL_REQUIREMENT", "Yêu cầu đặc biệt"],
    ["MANUAL_REVIEW", "Cần xem xét thủ công"],
    ["SPECIAL_HANDLING", "Xử lý đặc biệt"],
    ["ESCALATED", "Đã chuyển cấp xử lý"],
  ])("translates %s to %s", (value, label) => {
    expect(
      getClassificationTermLabel({
        name: value,
        label: null,
        code: null,
        group_name: null,
      }),
    ).toBe(label);
  });
});

describe("segment filter field mapping", () => {
  it("formats student stages with Vietnamese labels and badge colors", () => {
    expect(getStudentStageLabel("Connected")).toBe("Đã kết nối");
    expect(getStudentStageBadgeColor("Connected")).toBe("violet");
    expect(getStudentStageLabel("unknown")).toBe("unknown");
    expect(getStudentStageBadgeColor("unknown")).toBe("gray");
  });

  it("maps each dashboard property to its Frappe field", () => {
    const filters = toBackendSegmentFilters([
      {
        id: "group-1",
        name: "",
        logic: "AND",
        conditions: [
          {
            id: "stage",
            property: StudentSegmentProperty.JOURNEY_STAGE,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["New"],
          },
          {
            id: "potential",
            property: StudentSegmentProperty.POTENTIAL,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["HIGH"],
          },
          {
            id: "intent",
            property: StudentSegmentProperty.INTENT,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["MEDIUM"],
          },
          {
            id: "need",
            property: StudentSegmentProperty.NEED,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["need-name"],
          },
          {
            id: "tag",
            property: StudentSegmentProperty.TAG,
            operator: SegmentOperator.IS_ANY_OF,
            value: ["tag-name"],
          },
        ],
      },
    ]);

    expect(filters?.groups[0]?.conditions).toEqual([
      { field: "student_stage", operator: "in", value: ["New"] },
      { field: "potential", operator: "in", value: ["HIGH"] },
      { field: "intent", operator: "in", value: ["MEDIUM"] },
      { field: "need", operator: "in", value: ["need-name"] },
      { field: "tag", operator: "in", value: ["tag-name"] },
    ]);
  });

  it("restores student_stage as the admission-stage property", () => {
    const filters = fromBackendSegmentFilters({
      logic: "OR",
      groups: [
        {
          logic: "AND",
          conditions: [
            { field: "student_stage", operator: "=", value: "Connected" },
          ],
        },
      ],
    });

    expect(filters.groups[0]?.conditions[0]).toMatchObject({
      property: StudentSegmentProperty.JOURNEY_STAGE,
      operator: SegmentOperator.EQUAL,
      value: ["Connected"],
    });
  });

  it("builds stage labels and grouped Need/Tag options from the API catalog", () => {
    const options = buildSegmentFilterOptions({
      fields: [
        {
          fieldname: "student_stage",
          label: "Student Stage",
          fieldtype: "Select",
          options: "New\nConnected",
          operators: ["=", "in"],
        },
        {
          fieldname: "potential",
          label: "Potential",
          fieldtype: "Select",
          options: "LOW\nMEDIUM\nHIGH",
          operators: ["=", "in"],
        },
        {
          fieldname: "intent",
          label: "Intent",
          fieldtype: "Select",
          options: "LOW\nMEDIUM\nHIGH",
          operators: ["=", "in"],
        },
        {
          fieldname: "need",
          label: "Need",
          fieldtype: "Term",
          operators: ["in", "not in"],
        },
        {
          fieldname: "tag",
          label: "Tag",
          fieldtype: "Term",
          operators: ["in", "not in"],
        },
      ],
      needs: [
        {
          name: "need-tuition",
          label: "Thông tin học phí",
          group_name: "NEED_INFORMATION",
        },
      ],
      tags: [
        {
          name: "tag-attention",
          label: "Cần chú ý",
          group_name: "ATTENTION",
        },
      ],
    });

    expect(options[StudentSegmentProperty.JOURNEY_STAGE]).toEqual([
      { value: "New", label: "Mới" },
      { value: "Connected", label: "Đã kết nối" },
    ]);
    expect(options[StudentSegmentProperty.NEED]).toEqual([
      {
        value: "need-tuition",
        label: "Thông tin học phí",
        description: undefined,
        groupName: "NEED_INFORMATION",
      },
    ]);
    expect(options[StudentSegmentProperty.TAG]?.[0]).toMatchObject({
      value: "tag-attention",
      label: "Cần chú ý",
      groupName: "ATTENTION",
    });
  });

  it("summarizes a fully selected Need/Tag group by its group label", () => {
    const options = [
      { value: "need-a", label: "Hỗ trợ hồ sơ", groupName: "NEED_APPLICATION" },
      {
        value: "need-b",
        label: "Hạn nộp hồ sơ",
        groupName: "NEED_APPLICATION",
      },
      { value: "need-c", label: "Cần liên hệ", groupName: "NEED_CONTACT" },
    ];

    expect(getSelectedOptionLabels(["need-a", "need-b"], options)).toEqual([
      "Cần hỗ trợ hồ sơ",
    ]);
    expect(getSelectedOptionLabels(["need-a", "need-c"], options)).toEqual([
      "Hỗ trợ hồ sơ",
      "Cần liên hệ",
    ]);
  });
});
