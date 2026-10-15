import { formatStudentAuditChangeValue } from "./student-audit-changes";
import {
  formatStudentAuditFieldLabel,
  isStudentAuditIdentifier,
  isStudentAuditTechnicalField,
} from "./student-audit-presentation";
import {
  getDimensionLabel,
  getRefTypeLabel,
  STUDENT_DIMENSIONS,
} from "./student-analysis-display";

const labels: Record<string, string> = {
  insight_card: "Kết luận",
  headline: "Nhận định chính",
  points: "Điểm chính",
  status_label: "Trạng thái",
  refs: "Nguồn tham chiếu",
  ref: "Nguồn",
  dimensions: "Các khía cạnh phân tích",
  code: "Khía cạnh",
  level: "Mức đánh giá",
  level_source: "Nguồn đánh giá",
  summary: "Nhận xét",
  evidence: "Bằng chứng",
  note: "Nội dung",
  missing: "Thông tin còn thiếu",
  positives: "Điểm tích cực",
  text: "Nội dung",
  content: "Nội dung",
  type: "Loại nguồn",
  total: "Tổng số",
  completed: "Đã hoàn tất",
  verified: "Đã xác minh",
  groups: "Nhóm giấy tờ",
  group: "Nhóm",
  section_code: "Phần hồ sơ",
  mode: "Điều kiện hoàn tất",
  document_types: "Loại giấy tờ",
  instruction: "Hướng dẫn",
};

const enumLabels: Record<string, Record<string, string>> = {
  level: {
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
    unknown: "Chưa xác định",
  },
  level_source: { crm: "Dữ liệu CRM", ai: "Phân tích AI" },
  mode: { ALL: "Đầy đủ các giấy tờ", ANY: "Có ít nhất một giấy tờ" },
  section_code: {
    basic_admission: "Hồ sơ cơ bản",
    method: "Phương thức xét tuyển",
    special_program: "Chương trình đặc biệt",
  },
};

function hasDisplayValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "string" && isStudentAuditIdentifier(value))
    return false;
  if (Array.isArray(value)) return value.some(hasDisplayValue);
  if (typeof value === "object") return displayEntries(value).length > 0;
  return true;
}

function displayEntries(value: object): [string, unknown][] {
  return Object.entries(value).filter(
    ([key, item]) =>
      !isStudentAuditTechnicalField(key) && hasDisplayValue(item),
  );
}

/** Keep stored audit values intact; render nested data as labelled sections and lists. */
export default function StudentAuditStructuredValue({
  field,
  value,
}: {
  field: string;
  value: unknown;
}) {
  if (Array.isArray(value)) {
    const items = value.filter(hasDisplayValue);
    if (!items.length) return <p>Không có</p>;
    return (
      <ul className="list-disc space-y-3 pl-4 marker:text-text-secondary">
        {items.map((item, index) => (
          <li key={index} className="min-w-0 pl-1">
            <StudentAuditStructuredValue field={field} value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (value && typeof value === "object") {
    const entries = displayEntries(value);
    if (!entries.length) return <p>Không có thông tin hiển thị</p>;
    return (
      <dl className="space-y-3">
        {entries.map(([key, item]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs font-semibold text-text-primary">
              {labels[key] ?? formatStudentAuditFieldLabel(key)}
            </dt>
            <dd
              className={
                typeof item === "object"
                  ? "mt-2 border-l border-card-border pl-3"
                  : "mt-1"
              }
            >
              <StudentAuditStructuredValue field={key} value={item} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  let text = formatStudentAuditChangeValue(field, value);
  if (typeof value === "string") {
    if (field === "type") text = getRefTypeLabel(value);
    else if (
      field === "code" &&
      STUDENT_DIMENSIONS.some((item) => item.code === value)
    )
      text = getDimensionLabel(value);
    else text = enumLabels[field]?.[value] ?? text;
  }
  return (
    <p className="whitespace-pre-wrap break-words leading-6 [overflow-wrap:anywhere]">
      {text}
    </p>
  );
}
