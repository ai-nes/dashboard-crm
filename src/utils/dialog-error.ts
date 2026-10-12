import type { NestValidationIssue } from "@/services/api/nest/nest-client";

const FIELD_LABELS: Readonly<Record<string, string>> = {
  studentName: "Họ và tên",
  student_name: "Họ và tên",
  fullName: "Họ và tên",
  email: "Email",
  phone: "Số điện thoại",
  password: "Mật khẩu",
  newPassword: "Mật khẩu mới",
  idNumber: "CCCD",
  provinceId: "Tỉnh/thành phố",
  wardId: "Xã/phường",
  campusId: "Campus",
  campaignId: "Chiến dịch",
  campaignCode: "Mã chiến dịch",
  admissionYear: "Năm tuyển sinh",
  admissionYearId: "Năm tuyển sinh",
  assignedToUserId: "Người phụ trách",
  owningTeamId: "Team nhận Lead",
  routingGroupId: "Team Group nhận Lead",
  majorId: "Ngành học",
  highSchoolId: "Trường THPT",
  title: "Tiêu đề",
  status: "Trạng thái",
  startDate: "Ngày bắt đầu",
  endDate: "Ngày kết thúc",
  channelType: "Loại kênh",
  channelBoundary: "Hình thức",
  channelUrl: "URL kênh",
  interaction_type: "Loại tương tác",
  interaction_datetime: "Thời gian tương tác",
  body: "Thông tin gửi lên",
};

/** Translate standard BE validation text; every constraint comes from its response. */
function validationMessage(message: string): string {
  if (/^Invalid input: expected .+, received undefined$/.test(message))
    return "Không được để trống.";
  if (/^Invalid input: expected int, received /.test(message))
    return "Phải là số nguyên.";
  const length =
    /^Too (small|big): expected string to have (exactly |>=|<=)(\d+) characters$/.exec(
      message,
    );
  if (length) {
    if (length[2] === "exactly ") return `Phải gồm đúng ${length[3]} ký tự.`;
    return length[1] === "small"
      ? `Phải có ít nhất ${length[3]} ký tự.`
      : `Không được vượt quá ${length[3]} ký tự.`;
  }
  const bound =
    /^Too (small|big): expected number to be (>=|<=)(-?\d+(?:\.\d+)?)$/.exec(
      message,
    );
  if (bound)
    return bound[1] === "small"
      ? `Giá trị phải lớn hơn hoặc bằng ${bound[3]}.`
      : `Giá trị phải nhỏ hơn hoặc bằng ${bound[3]}.`;
  const options = /^Invalid option: expected one of (.+)$/.exec(message);
  if (options)
    return `Chỉ chấp nhận một trong các giá trị: ${options[1].replaceAll('"|"', '", "')}.`;
  return message;
}

function validationDetails(error: Error): NestValidationIssue[] {
  if (!("details" in error) || !Array.isArray(error.details)) return [];
  return error.details.filter((issue): issue is NestValidationIssue =>
    Boolean(
      issue &&
      typeof issue.field === "string" &&
      typeof issue.message === "string" &&
      issue.message.trim(),
    ),
  );
}

/** Explain server field reasons without replacing them with guessed frontend rules. */
export function formatDialogError(
  error: unknown,
  fallback: string,
  labels: Readonly<Record<string, string>> = {},
): string {
  if (!(error instanceof Error)) return fallback;
  const details = validationDetails(error);
  if (!details.length) return error.message.trim() || fallback;

  // Lead adapters may have already appended the same raw details to message.
  const message = error.message.split("\n")[0].trim();
  const header = [
    "The request is invalid.",
    "Validation failed.",
    "Invalid input.",
  ].includes(message)
    ? "Thông tin gửi lên chưa hợp lệ."
    : message || fallback;
  const lines = details.map(
    ({ field, message }) =>
      `${labels[field] ?? FIELD_LABELS[field] ?? field}: ${validationMessage(message)}`,
  );
  return [header, ...new Set(lines)].join("\n");
}
