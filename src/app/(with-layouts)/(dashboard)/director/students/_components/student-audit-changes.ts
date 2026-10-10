import type { StudentAuditLog } from "@/services/api/student-audit";
import { formatAuditMetadataKey } from "@/utils/format-audit-metadata";
import { formatDate, formatDateTime } from "@/utils/format-date";
import { studentStatusLabel } from "./student-status";

export interface StudentAuditFieldChange {
  fieldname: string;
  fieldLabel: string;
  oldValue: unknown;
  newValue: unknown;
}

const technicalFields = new Set([
  "id",
  "legacyId",
  "studentId",
  "revision",
  "createdAt",
  "updatedAt",
  "modifiedAt",
  "storageKey",
  "sha256",
  "sourceKey",
  "idempotencyKey",
]);
const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

/** Prefer semantic field entries; snapshots also support older stored audit rows. */
export function getStudentAuditChanges(
  event: StudentAuditLog,
): StudentAuditFieldChange[] {
  const entries = Array.isArray(event.metadata?.changes)
    ? event.metadata.changes
    : null;
  if (
    event.action === "updated" &&
    (event.fieldname || event.fieldLabel) &&
    !entries?.length
  ) {
    return [
      {
        fieldname: event.fieldname || "field",
        fieldLabel:
          event.fieldLabel ||
          formatAuditMetadataKey(event.fieldname || "field"),
        oldValue: event.oldValue,
        newValue: event.newValue,
      },
    ];
  }
  const labels = asRecord(event.metadata?.fieldLabels) ?? {};
  if (entries)
    return entries.flatMap((value) => {
      const change = asRecord(value);
      if (
        !change ||
        typeof change.fieldname !== "string" ||
        technicalFields.has(change.fieldname)
      )
        return [];
      const fieldLabel =
        typeof change.fieldLabel === "string"
          ? change.fieldLabel
          : formatAuditMetadataKey(change.fieldname);
      return [
        {
          fieldname: change.fieldname,
          fieldLabel,
          oldValue: change.oldValueLabel ?? change.oldValue ?? null,
          newValue: change.newValueLabel ?? change.newValue ?? null,
        },
      ];
    });
  const before = asRecord(event.metadata?.before) ?? {};
  const after = asRecord(event.metadata?.after) ?? {};
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(
      (key) =>
        !technicalFields.has(key) &&
        JSON.stringify(before[key] ?? null) !==
          JSON.stringify(after[key] ?? null),
    )
    .map((fieldname) => ({
      fieldname,
      fieldLabel:
        typeof labels[fieldname] === "string"
          ? labels[fieldname]
          : formatAuditMetadataKey(fieldname),
      oldValue: before[fieldname] ?? null,
      newValue: after[fieldname] ?? null,
    }));
}

const valueLabels: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
  Draft: "Nháp",
  Submitted: "Đã nộp",
  Approved: "Đã duyệt",
  Rejected: "Đã từ chối",
  "Not Started": "Chưa bắt đầu",
  "In Progress": "Đang thực hiện",
  Done: "Hoàn thành",
  Open: "Đang mở",
  High: "Cao",
  Medium: "Trung bình",
  Low: "Thấp",
};
const detailLabels: Record<string, string> = {
  math: "Toán",
  literature: "Ngữ văn",
  english: "Tiếng Anh",
  physics: "Vật lý",
  chemistry: "Hóa học",
  biology: "Sinh học",
  history: "Lịch sử",
  geography: "Địa lý",
  subject: "Môn học",
  score: "Điểm",
  content: "Nội dung",
  text: "Nội dung",
  role: "Người gửi",
  title: "Tiêu đề",
  status: "Trạng thái",
};

export function formatStudentAuditChangeValue(
  field: string,
  value: unknown,
): string {
  if (value === null || value === undefined || value === "")
    return "Chưa có giá trị";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (
      ["studentStage", "student_stage"].includes(field) &&
      value in studentStatusLabel
    )
      return studentStatusLabel[value as keyof typeof studentStatusLabel];
    if (
      [
        "gender",
        "profileStatus",
        "enrollmentStatus",
        "status",
        "priority",
      ].includes(field)
    )
      return valueLabels[value] ?? valueLabels[value.toLowerCase()] ?? value;
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value))
      return /Date$|date_of_birth|dateOfBirth/.test(field)
        ? formatDate(value)
        : formatDateTime(value);
    return value.replace(/<[^>]*>/g, " ").trim();
  }
  if (Array.isArray(value))
    return value.length
      ? value
          .map((item) => formatStudentAuditChangeValue(field, item))
          .join("; ")
      : "Chưa có giá trị";
  const record = asRecord(value);
  if (record)
    return (
      Object.entries(record)
        .map(
          ([key, item]) =>
            `${detailLabels[key] ?? formatAuditMetadataKey(key)}: ${formatStudentAuditChangeValue(key, item)}`,
        )
        .join("; ") || "Chưa có giá trị"
    );
  return String(value);
}
