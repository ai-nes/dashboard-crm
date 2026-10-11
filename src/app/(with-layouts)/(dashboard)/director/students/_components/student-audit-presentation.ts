import { formatAuditMetadataKey } from "@/utils/format-audit-metadata";
import {
  leadResultLabel,
  leadStageStatusLabel,
} from "../../leads/_components/lead-status";

const normalizeField = (field: string) =>
  field.replace(/[_\s-]/g, "").toLowerCase();

const referenceLabels: Record<string, string> = {
  owneruserid: "Người phụ trách",
  ownerstaffid: "Nhân viên phụ trách",
  owningteamid: "Nhóm phụ trách",
  owningpoolid: "Nhóm phân bổ",
  admissionyearid: "Năm tuyển sinh",
  highschoolid: "Trường THPT",
  provinceid: "Tỉnh/Thành phố",
  wardid: "Phường/Xã",
  majorid: "Ngành học",
  aspirationid: "Nguyện vọng",
  campusid: "Cơ sở",
  campaignid: "Chiến dịch",
  sourceid: "Nguồn tuyển sinh",
  applicationid: "Đăng ký xét tuyển",
  profileid: "Hồ sơ xét tuyển",
  profiletemplateid: "Mẫu hồ sơ",
  documenttypeid: "Loại giấy tờ",
  assignedtouserid: "Người được giao",
  createdbyuserid: "Người tạo",
  uploadedbyuserid: "Người tải lên",
  actoruserid: "Người thực hiện",
  assignedbyuserid: "Người phân loại",
  priorowneruserid: "Người phụ trách trước",
  nextowneruserid: "Người phụ trách mới",
  segmentid: "Phân khúc",
  termid: "Nhãn phân loại",
};

const fieldLabels: Record<string, string> = {
  ...referenceLabels,
  studentcode: "Mã thí sinh",
  leadcode: "Mã Lead",
  processingstatus: "Trạng thái xử lý",
  resolution: "Kết quả xử lý",
  resolutionreason: "Lý do xử lý",
  convertedat: "Thời gian tạo hồ sơ thí sinh",
  slastartedat: "Thời gian bắt đầu chăm sóc",
  slastatus: "Tình trạng chăm sóc",
  reason: "Lý do",
  payload: "Chi tiết",
};

const technicalFields = new Set([
  "revision",
  "createdat",
  "updatedat",
  "modifiedat",
  "storagekey",
  "sha256",
  "sourcekey",
  "idempotencykey",
]);

export function isStudentAuditIdentifierKey(key: string): boolean {
  return /(^id$|_id$|Id$|ID$)/.test(key);
}

export function isStudentAuditTechnicalField(field: string): boolean {
  const key = normalizeField(field);
  return (
    technicalFields.has(key) ||
    (isStudentAuditIdentifierKey(field) && !referenceLabels[key])
  );
}

export function isStudentAuditIdentifier(value: string): boolean {
  const text = value.trim();
  return (
    /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(text) ||
    /^c[a-z\d]{24}$/i.test(text)
  );
}

export function formatStudentAuditFieldLabel(
  field: string,
  fallback?: string | null,
): string {
  return (
    fieldLabels[normalizeField(field)] ||
    fallback ||
    formatAuditMetadataKey(field)
  );
}

const systemReasons: Record<string, string> = {
  "Assigned by lead assignment batch.": "Đã phân công người phụ trách theo đợt",
  "Automatic assignment.": "Đã tự động phân công người phụ trách",
  "CREATED handoff completed.": "Đã hoàn tất tạo hồ sơ thí sinh",
  "MATCHED handoff completed.": "Đã liên kết với hồ sơ thí sinh hiện có",
};

export function formatStudentAuditReason(value: string): string {
  return systemReasons[value.trim()] ?? value;
}

const valueLabels: Record<string, Record<string, string>> = {
  processingstatus: leadStageStatusLabel,
  resolution: {
    ...leadResultLabel,
    CREATED: "Đã tạo hồ sơ thí sinh",
    MATCHED: "Đã liên kết hồ sơ thí sinh",
    SPAM: "Thông tin rác",
  },
  slastatus: {
    on_time: "Trong hạn chăm sóc",
    warning: "Sắp quá hạn chăm sóc",
    breach: "Quá hạn chăm sóc",
  },
};

/** Translate known system values only; staff-entered notes remain verbatim. */
export function getStudentAuditSystemValueLabel(
  field: string,
  value: string,
): string | undefined {
  const key = normalizeField(field);
  if (key === "resolutionreason" || key === "reason")
    return formatStudentAuditReason(value);
  const labels = valueLabels[key];
  return (
    labels?.[value] ??
    labels?.[value.toUpperCase()] ??
    labels?.[value.toLowerCase()]
  );
}
