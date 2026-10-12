import type {
  AiDimension,
  AiLevel,
  StudentAiLabels,
} from "@/services/api/student-ai/types";

export const STUDENT_DIMENSIONS = [
  {
    code: "interest",
    label: "Quan tâm",
    description: "Mức độ quan tâm đến chương trình học.",
  },
  {
    code: "fit",
    label: "Phù hợp",
    description: "Mức độ phù hợp với định hướng học tập.",
  },
  {
    code: "barrier",
    label: "Rào cản",
    description: "Những trở ngại cần giải quyết.",
  },
  {
    code: "family",
    label: "Gia đình",
    description: "Sự tham gia và hỗ trợ của gia đình.",
  },
  {
    code: "engagement",
    label: "Tương tác",
    description: "Mức độ phản hồi và kết nối với tư vấn viên.",
  },
  {
    code: "admission",
    label: "Xét tuyển",
    description: "Tiến độ chuẩn bị và hoàn thiện hồ sơ.",
  },
] as const;

const LEVEL_LABELS: Record<string, Record<AiLevel, string>> = {
  interest: {
    high: "Quan tâm cao",
    medium: "Quan tâm vừa",
    low: "Quan tâm thấp",
    unknown: "Chưa rõ mức quan tâm",
  },
  fit: {
    high: "Phù hợp cao",
    medium: "Phù hợp vừa",
    low: "Phù hợp thấp",
    unknown: "Chưa rõ mức phù hợp",
  },
  barrier: {
    high: "Rào cản lớn",
    medium: "Rào cản vừa",
    low: "Rào cản nhỏ",
    unknown: "Chưa rõ rào cản",
  },
  family: {
    high: "Gia đình ủng hộ rõ",
    medium: "Gia đình còn cân nhắc",
    low: "Gia đình đang cản",
    unknown: "Chưa rõ ý gia đình",
  },
  engagement: {
    high: "Liên hệ hiệu quả",
    medium: "Liên hệ chập chờn",
    low: "Khó liên hệ",
    unknown: "Chưa đủ liên hệ để đánh giá",
  },
  admission: {
    high: "Hồ sơ gần xong",
    medium: "Hồ sơ đang bổ sung",
    low: "Chưa bắt đầu hồ sơ",
    unknown: "Chưa rõ tiến độ hồ sơ",
  },
};

export function getDimensionLabel(code: string, labels?: StudentAiLabels) {
  return (
    labels?.dimensions?.[code]?.label?.trim() ||
    STUDENT_DIMENSIONS.find((dimension) => dimension.code === code)?.label ||
    "Chiều phân tích"
  );
}

export function getDimensionLevelLabel(
  dimension: AiDimension,
  labels?: StudentAiLabels,
) {
  return (
    labels?.dimensions?.[dimension.code]?.levels?.[dimension.level]?.trim() ||
    LEVEL_LABELS[dimension.code]?.[dimension.level] ||
    "Chưa xác định"
  );
}

export function getDimensionLevelColor(
  dimension: AiDimension,
): "gray" | "success" | "warning" | "primary" {
  if (dimension.level === "unknown") return "gray";
  if (dimension.code === "barrier") {
    return dimension.level === "low" ? "success" : "warning";
  }
  if (dimension.level === "high") return "success";
  if (dimension.level === "low") return "warning";
  return "primary";
}

export function getRefTypeLabel(type: string) {
  const labels: Record<string, string> = {
    interaction: "Tương tác",
    profile: "Hồ sơ học sinh",
    academic: "Kết quả học tập",
    application: "Hồ sơ xét tuyển",
    guardian: "Thông tin phụ huynh",
    event: "Sự kiện",
    intent: "Nhu cầu tư vấn",
    note: "Ghi chú",
    memory: "Thông tin ghi nhớ",
    student: "Hồ sơ học sinh",
    lead: "Hồ sơ tư vấn",
    call: "Cuộc gọi",
    task: "Công việc",
    message: "Tin nhắn",
    document: "Tài liệu",
    crm: "Dữ liệu CRM",
  };
  return labels[type] || "Nguồn dữ liệu";
}
