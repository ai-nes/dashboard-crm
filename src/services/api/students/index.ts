import { NestApiError, nestRequest } from "../nest/nest-client";
import { nestDirectorStudents } from "./students-nest";
import { student360Data, studentListData } from "./data";
import type {
  StudentAdmissionProfile,
  DirectorStudentsActionSummary,
  DirectorStudentsMeta,
  DirectorStudentsParams,
  DirectorStudentsResponse,
  DirectorStudentsSummary,
  StudentCallRecord,
  StudentChatwootInteractionsResponse,
  StudentInteractionsResponse,
  StudentLifecycleStatus,
  Student360Data,
  StudentListItem,
} from "./types";

export type * from "./types";

export class DirectorStudentsApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DirectorStudentsApiError";
  }
}

function normalizeNestStudentCall(value: unknown): StudentCallRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const direction = row.direction;
  const outcome = row.outcome;
  if (
    typeof row.id !== "string" ||
    typeof row.occurredAt !== "string" ||
    !["inbound", "outbound", "missed"].includes(String(direction)) ||
    !["connected", "missed", "no-answer", "callback"].includes(String(outcome))
  ) {
    return null;
  }

  return {
    id: row.id,
    time: row.occurredAt,
    direction: direction as StudentCallRecord["direction"],
    outcome: outcome as StudentCallRecord["outcome"],
    callerName:
      typeof row.callerName === "string" ? row.callerName : "Tư vấn viên",
    receiverName:
      typeof row.receiverName === "string" ? row.receiverName : "Học sinh",
    ...(typeof row.callerRole === "string"
      ? { callerRole: row.callerRole }
      : {}),
    ...(typeof row.receiverRole === "string"
      ? { receiverRole: row.receiverRole }
      : {}),
    ...(typeof row.phoneNumber === "string"
      ? { phoneNumber: row.phoneNumber }
      : {}),
    ...(typeof row.durationSeconds === "number"
      ? { durationSeconds: row.durationSeconds }
      : typeof row.durationSec === "number"
        ? { durationSeconds: row.durationSec }
        : {}),
    ...(typeof row.title === "string" ? { topic: row.title } : {}),
    ...(typeof row.content === "string" ? { summary: row.content } : {}),
    summaryAvailable: typeof row.content === "string" && row.content.length > 0,
    summaryStatus:
      typeof row.content === "string" && row.content.length > 0
        ? "COMPLETED"
        : "NOT_AVAILABLE",
  };
}

const stageMap: Record<
  StudentListItem["stage"],
  { value: string; position: number; description: string }
> = {
  "Quan tâm": {
    value: "Đã biết đến trường",
    position: 2,
    description:
      "Đã để lại tín hiệu đầu tiên nhưng chưa hình thành nhu cầu rõ.",
  },
  "Tìm hiểu": {
    value: "Đang tìm hiểu",
    position: 3,
    description: "Đang chủ động xem nội dung và so sánh thông tin ngành học.",
  },
  "Tư vấn": {
    value: "Cân nhắc nghiêm túc",
    position: 4,
    description:
      "Đã trao đổi với tư vấn viên và đang tháo gỡ điều kiện quyết định.",
  },
  "Ứng tuyển": {
    value: "Đã nộp hồ sơ",
    position: 5,
    description: "Đã chuyển từ cân nhắc sang hoàn thiện thủ tục ứng tuyển.",
  },
  "Đăng ký": {
    value: "Đã đăng ký",
    position: 6,
    description: "Đã hoàn tất bước đăng ký và sẵn sàng cho Nhập học.",
  },
  "New Enter": {
    value: "Đã nhập học",
    position: 7,
    description: "Đã hoàn tất hành trình chuyển đổi của mùa tuyển sinh.",
  },
  "Nhập học": {
    value: "Đã nhập học",
    position: 7,
    description: "Đã hoàn tất hành trình chuyển đổi của mùa tuyển sinh.",
  },
};

const fitByStudent: Record<
  string,
  "Phù hợp cao" | "Phù hợp trung bình" | "Phù hợp thấp"
> = {
  "nguyen-minh-an": "Phù hợp cao",
  "tran-ngoc-bao-chau": "Phù hợp cao",
  "le-gia-huy": "Phù hợp cao",
  "pham-khanh-linh": "Phù hợp trung bình",
  "vo-minh-khang": "Phù hợp trung bình",
  "do-ngoc-mai": "Phù hợp cao",
  "nguyen-hoang-nam": "Phù hợp trung bình",
  "bui-thanh-ha": "Phù hợp cao",
};

const barrierByStudent: Record<
  string,
  { value: string; description: string; evidence: string[] }
> = {
  "nguyen-minh-an": {
    value: "Chi phí",
    description:
      "Gia đình cần phương án học phí và học bổng cụ thể trước khi quyết định.",
    evidence: ["Phụ huynh hỏi học bổng", "Xem trang học phí nhiều lần"],
  },
  "tran-ngoc-bao-chau": {
    value: "Chi phí",
    description:
      "Mức học bổng là điều kiện quan trọng để chuyển sang bước hồ sơ.",
    evidence: ["Yêu cầu lộ trình học bổng", "Đã xem chính sách hỗ trợ"],
  },
  "le-gia-huy": {
    value: "Thông tin",
    description: "Cần hướng dẫn rõ bộ giấy tờ và thứ tự hoàn tất hồ sơ.",
    evidence: ["Hồ sơ đang thiếu tài liệu", "Đã hỏi quy trình nộp"],
  },
  "pham-khanh-linh": {
    value: "Địa lý",
    description:
      "Cần trải nghiệm trực tiếp để xác nhận môi trường và phương án di chuyển.",
    evidence: ["Chưa tham quan campus", "Quan tâm đời sống sinh viên"],
  },
  "vo-minh-khang": {
    value: "Thông tin",
    description:
      "Chưa phân biệt rõ ngành thiết kế vi mạch với các ngành kỹ thuật gần.",
    evidence: ["Mới xem landing page", "Chưa có cuộc gọi chuyên ngành"],
  },
  "do-ngoc-mai": {
    value: "Cạnh tranh",
    description: "Đang so sánh trải nghiệm và đầu ra với các trường khác.",
    evidence: ["Xem nội dung nhiều trường", "Quan tâm đánh giá sinh viên"],
  },
  "nguyen-hoang-nam": {
    value: "Thông tin",
    description: "Tín hiệu tương tác giảm vì nội dung chưa trúng mối quan tâm.",
    evidence: ["Điểm quan tâm giảm", "Hai ngày chưa phản hồi"],
  },
  "bui-thanh-ha": {
    value: "Không còn rào cản chính",
    description:
      "Đã hoàn tất bước quyết định, chỉ còn theo dõi xác nhận nhập học.",
    evidence: ["Đã nhập học", "Nguồn giới thiệu tin cậy"],
  },
};

const parentByStudent: Record<
  string,
  {
    name: string;
    relation: string;
    preferredChannel: string;
    bestContactTime: string;
  }
> = {
  "nguyen-minh-an": {
    name: "Nguyễn Văn Minh",
    relation: "Bố",
    preferredChannel: "Cuộc gọi",
    bestContactTime: "16:00–18:00",
  },
  "tran-ngoc-bao-chau": {
    name: "Trần Thị Hương",
    relation: "Mẹ",
    preferredChannel: "Zalo",
    bestContactTime: "19:00–20:30",
  },
  "le-gia-huy": {
    name: "Lê Văn Thành",
    relation: "Bố",
    preferredChannel: "Cuộc gọi",
    bestContactTime: "17:00–19:00",
  },
  "pham-khanh-linh": {
    name: "Phạm Thu Trang",
    relation: "Mẹ",
    preferredChannel: "Zalo",
    bestContactTime: "18:00–20:00",
  },
  "vo-minh-khang": {
    name: "Võ Quốc Cường",
    relation: "Bố",
    preferredChannel: "Cuộc gọi",
    bestContactTime: "17:30–19:00",
  },
  "do-ngoc-mai": {
    name: "Đỗ Thị Lan",
    relation: "Mẹ",
    preferredChannel: "Zalo",
    bestContactTime: "19:00–21:00",
  },
  "nguyen-hoang-nam": {
    name: "Nguyễn Thị Thanh",
    relation: "Mẹ",
    preferredChannel: "Cuộc gọi",
    bestContactTime: "18:00–20:00",
  },
  "bui-thanh-ha": {
    name: "Bùi Văn Hùng",
    relation: "Bố",
    preferredChannel: "Cuộc gọi",
    bestContactTime: "16:30–18:30",
  },
};

function getInterest(score: number): {
  value: string;
  tone: Student360Data["classification"]["dimensions"][number]["tone"];
  description: string;
} {
  if (score >= 75)
    return {
      value: "Cao",
      tone: "success",
      description:
        "Có tín hiệu chủ động, cụ thể và lặp lại trong thời gian gần.",
    };
  if (score >= 60)
    return {
      value: "Trung bình",
      tone: "warning",
      description:
        "Có phản hồi và xem nội dung nhưng mức chủ động chưa ổn định.",
    };
  return {
    value: "Thấp",
    tone: "gray",
    description:
      "Ít phản hồi gần đây, phù hợp với nhịp nuôi dưỡng thay vì liên hệ dày.",
  };
}

function getSourceGroup(
  source: string,
): Student360Data["acquisition"]["sourceGroup"] {
  if (/giới thiệu/i.test(source)) return "Giới thiệu";
  if (/ads/i.test(source)) return "Trực tuyến qua quảng cáo";
  if (/website|landing page/i.test(source)) return "Trực tuyến chủ động";
  return "Thực địa";
}

function getGeographyTier(province: string): {
  tier: string;
  implication: string;
} {
  if (/Hồ Chí Minh|Hà Nội|Đà Nẵng/i.test(province))
    return {
      tier: "Nội thành nơi có cơ sở",
      implication:
        "Ưu tiên trải nghiệm trực tiếp, campus tour và hoạt động Open Day.",
    };
  if (/Cần Thơ|Nam Định|Quảng Ninh/i.test(province))
    return {
      tier: "Tỉnh lân cận",
      implication:
        "Cần làm rõ chi phí sinh hoạt, ký túc xá và phương án di chuyển.",
    };
  return {
    tier: "Tỉnh xa và vùng khó khăn",
    implication:
      "Ưu tiên học bổng, hỗ trợ chỗ ở và kết nối sinh viên cùng quê.",
  };
}

function getParentConcerns(barrier: string, major: string): string[] {
  if (barrier === "Chi phí")
    return [
      "Học phí & phương án tài chính",
      "Điều kiện học bổng",
      "Cơ hội việc làm sau tốt nghiệp",
    ];
  if (barrier === "Địa lý")
    return [
      "Ký túc xá & an toàn",
      "Chi phí sinh hoạt",
      "Cơ hội việc làm sau tốt nghiệp",
    ];
  if (barrier === "Cạnh tranh")
    return [
      "Uy tín và đầu ra",
      `Khác biệt của ngành ${major}`,
      "Tỷ lệ có việc làm",
    ];
  if (barrier === "Thông tin")
    return [
      `Nội dung ngành ${major}`,
      "Phương thức xét tuyển",
      "Cơ hội việc làm sau tốt nghiệp",
    ];
  return [
    "Thủ tục xác nhận nhập học",
    "Mốc thời gian cần hoàn tất",
    "Chuẩn bị trước nhập học",
  ];
}

function buildClassification(
  student: StudentListItem,
): Student360Data["classification"] {
  const stage = stageMap[student.stage];
  const interest = getInterest(student.score);
  const fit = fitByStudent[student.id] ?? "Phù hợp trung bình";
  const barrier =
    barrierByStudent[student.id] ?? barrierByStudent["nguyen-hoang-nam"];
  const fitTone =
    fit === "Phù hợp cao"
      ? "sky"
      : fit === "Phù hợp trung bình"
        ? "warning"
        : "gray";
  const fitShort = fit.replace("Phù hợp ", "");
  const highInterest = interest.value === "Cao";
  const highFit = fit === "Phù hợp cao";
  const geography = getGeographyTier(student.province);
  const fitFactors = [
    {
      label: "Ngành" as const,
      value: `${student.major} trong danh mục`,
      tone: "success" as const,
    },
    {
      label: "Hồ sơ học tập" as const,
      value: highFit ? "Nền tảng khả thi" : "Cần đối chiếu thêm",
      tone: highFit ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Phương thức xét tuyển" as const,
      value: highFit ? "Có phương thức khả thi" : "Cần xác minh thêm",
      tone: highFit ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Chi phí" as const,
      value:
        barrier.value === "Chi phí"
          ? "Cần phương án học bổng"
          : "Chưa ghi nhận rào cản",
      tone:
        barrier.value === "Chi phí"
          ? ("warning" as const)
          : ("success" as const),
    },
    {
      label: "Địa lý" as const,
      value:
        geography.tier === "Nội thành nơi có cơ sở"
          ? "Thuận lợi tiếp cận"
          : "Cần làm rõ di chuyển",
      tone:
        geography.tier === "Nội thành nơi có cơ sở"
          ? ("success" as const)
          : ("warning" as const),
    },
  ];
  const action = student.nextAction;

  return {
    dimensions: [
      {
        id: "journey",
        label: "Giai đoạn hành trình",
        value: stage.value,
        description: stage.description,
        evidence: [
          `Mốc ${stage.position}/7 của phễu chuẩn`,
          `Trạng thái CRM: ${student.stage}`,
        ],
        tone: "primary",
      },
      {
        id: "interest",
        label: "Mức độ quan tâm",
        value: interest.value,
        description: interest.description,
        evidence: [
          `Điểm tín hiệu ${student.score}/100`,
          `${student.scoreDelta >= 0 ? "+" : ""}${student.scoreDelta} điểm gần nhất`,
        ],
        tone: interest.tone,
      },
      {
        id: "fit",
        label: "Mức độ phù hợp",
        value: fit,
        description:
          "Đánh giá theo ngành, hồ sơ học tập, phương thức xét tuyển, chi phí và địa lý.",
        evidence: [
          `Ngành ${student.major} có trong danh mục`,
          fit === "Phù hợp cao"
            ? "Hồ sơ học tập khả thi"
            : "Cần xác minh thêm phương thức xét tuyển",
        ],
        tone: fitTone,
        fitFactors,
      },
      {
        id: "barrier",
        label: "Rào cản chính",
        value: barrier.value,
        description: barrier.description,
        evidence: barrier.evidence,
        tone:
          barrier.value === "Không còn rào cản chính" ? "success" : "warning",
      },
    ],
    combination: `Quan tâm ${interest.value.toLowerCase()} + Phù hợp ${fitShort.toLowerCase()} + Rào cản ${barrier.value.toLowerCase()}`,
    interpretation:
      highInterest && highFit
        ? `Ưu tiên xử lý ${barrier.value.toLowerCase()}.`
        : `Cần xác minh thêm trước bước ${student.nextAction.toLowerCase()}.`,
    action,
    updatedAt: student.lastActivity,
    updateTrigger: `Sau tín hiệu: ${student.nextAction}`,
    reviewStatus: student.priority === "Cao" ? "Đã xác nhận" : "Chờ xác nhận",
    reviewedBy: student.owner,
  };
}

function buildReadiness(
  student: StudentListItem,
  parent: Student360Data["parentProfile"],
): Student360Data["readiness"] {
  const applicationScore =
    student.stage === "Nhập học"
      ? 100
      : student.stage === "Ứng tuyển"
        ? 76
        : 42;
  return [
    {
      label: "Hồ sơ",
      value: applicationScore,
      tone: applicationScore >= 70 ? "success" : "warning",
      detail:
        student.stage === "Ứng tuyển" || student.stage === "Nhập học"
          ? "Đã bắt đầu quy trình hồ sơ"
          : "Chưa chuyển sang bước nộp hồ sơ",
    },
    {
      label: "Gia đình",
      value: parent.involvement === "Cao" ? 78 : 58,
      tone: parent.involvement === "Cao" ? "success" : "warning",
      detail: `${parent.relation} tham gia ở mức ${parent.involvement.toLowerCase()}`,
    },
    {
      label: "Tương tác",
      value: Math.min(96, Math.max(40, student.score + 4)),
      tone: student.score >= 70 ? "success" : "warning",
      detail: `${student.scoreDelta >= 0 ? "+" : ""}${student.scoreDelta} điểm tín hiệu gần nhất`,
    },
  ];
}

function buildJourney(
  student: StudentListItem,
  parent: Student360Data["parentProfile"],
  barrier: string,
): Student360Data["journey"] {
  const sourceChannel: Student360Data["journey"][number]["channel"] =
    getSourceGroup(student.source) === "Thực địa" ? "Sự kiện" : "Website";
  return [
    {
      id: "source",
      date: "28/05 · 09:42",
      title: student.source,
      description: `Ghi nhận quan tâm ban đầu tới ngành ${student.major}`,
      channel: sourceChannel,
      status: "completed",
    },
    {
      id: "form",
      date: "28/05 · 09:46",
      title: "Để lại thông tin tư vấn",
      description: "Đồng ý nhận tư vấn và cung cấp nguyện vọng ưu tiên",
      channel: "Hồ sơ",
      status: "completed",
    },
    {
      id: "content",
      date: "30/05 · 22:11",
      title: `Xem nội dung ${student.major}`,
      description: "Đọc thông tin ngành và phương thức xét tuyển",
      channel: "Website",
      status: "completed",
    },
    {
      id: "fee",
      date: "31/05 · 20:05",
      title: "Xem trang học phí",
      description: "Quay lại bảng phí và chính sách học bổng",
      channel: "Website",
      status: "completed",
    },
    {
      id: "engage",
      date: "02/06 · 09:30",
      title: "Tương tác nổi bật",
      description: `Tín hiệu gần nhất được ghi nhận ${student.lastActivity}`,
      channel: student.source.includes("Open Day") ? "Sự kiện" : "Zalo",
      status: "completed",
    },
    {
      id: "parent",
      date: "04/06 · 20:18",
      title: `Trao đổi với ${parent.relation.toLowerCase()}`,
      description: `Ghi nhận mối quan tâm chính: ${barrier.toLowerCase()}`,
      channel: parent.preferredChannel === "Cuộc gọi" ? "Cuộc gọi" : "Zalo",
      status: "completed",
    },
    {
      id: "consult",
      date: "06/06 · 16:42",
      title: "Tư vấn gần nhất",
      description: `Đã đối chiếu nhu cầu ngành ${student.major} và khả năng chuyển bước`,
      channel: "Cuộc gọi",
      status: "completed",
    },
    {
      id: "next",
      date: "Tiếp theo",
      title: student.nextAction,
      description: `${parent.preferredChannel} · ${parent.bestContactTime}`,
      channel: "Cuộc gọi",
      status: "current",
    },
  ];
}

function buildApplication(
  student: StudentListItem,
): Student360Data["application"] {
  const complete =
    student.stage === "Nhập học" || student.stage === "New Enter";
  const inProgress =
    student.stage === "Ứng tuyển" || student.stage === "Đăng ký";
  const documentStatus = complete
    ? "Đã hoàn tất · 5/5 tài liệu"
    : inProgress
      ? "Đang hoàn thiện · 3/5 tài liệu"
      : "Chưa bắt đầu · 0/5 tài liệu";
  return [
    { label: "Nguyện vọng", value: student.major, status: "primary" },
    { label: "Kỳ tuyển sinh", value: "Đợt 2 · 2026" },
    {
      label: "Trạng thái hồ sơ",
      value: documentStatus,
      status: complete ? "success" : "warning",
    },
    {
      label: "Học bổng",
      value: student.priority === "Cao" ? "Đề xuất mức 30%" : "Đang đánh giá",
      status: student.priority === "Cao" ? "success" : "warning",
    },
    {
      label: "Hạn hoàn tất",
      value: complete
        ? "Đã hoàn tất"
        : inProgress
          ? "Còn 6 ngày"
          : "Còn 12 ngày",
      status: complete ? "success" : "warning",
    },
  ];
}

function buildInsight(
  student: StudentListItem,
  classification: Student360Data["classification"],
  parent: Student360Data["parentProfile"],
): Student360Data["insight"] {
  const stage = classification.dimensions.find(
    (dimension) => dimension.id === "journey",
  );
  const interest = classification.dimensions.find(
    (dimension) => dimension.id === "interest",
  );
  const barrier = classification.dimensions.find(
    (dimension) => dimension.id === "barrier",
  );
  return {
    summary: `${student.name} đang ở giai đoạn ${stage?.value.toLowerCase()}, mức quan tâm ${interest?.value.toLowerCase()} với ngành ${student.major}. Rào cản chính là ${barrier?.value.toLowerCase()}; ${parent.relation.toLowerCase()} là người đồng quyết định cần được tiếp cận đúng kênh.`,
    signalScore: student.score,
    probability: Math.max(35, Math.min(96, student.score - 6)),
    scoreDelta: student.scoreDelta,
    baseline: Math.max(
      35,
      student.score - Math.max(student.scoreDelta, 0) - 28,
    ),
    confidence: student.score >= 70 ? 76 : 68,
    concern: barrier?.value ?? "Cần xác minh",
    decisionMaker: `${parent.relation} · ${parent.role}`,
    evidence: classification.dimensions
      .flatMap((dimension) => dimension.evidence)
      .slice(0, 4),
    recommendation: classification.action,
  };
}

export function computeStudent360(
  studentId = "nguyen-minh-an",
): Student360Data | null {
  const normalized = studentId.trim().toLowerCase();
  const student =
    studentListData.find(
      (item) =>
        item.id.toLowerCase() === normalized ||
        item.code.toLowerCase() === normalized ||
        item.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ===
          normalized.replace(/[^a-zA-Z0-9]/g, ""),
    ) ?? (studentId === "ENR-2026-00005" ? studentListData[0] : null);

  if (!student) return null;

  const classification = buildClassification(student);
  const barrier = classification.dimensions.find(
    (dimension) => dimension.id === "barrier",
  );
  const parent =
    parentByStudent[student.id] ?? parentByStudent["nguyen-minh-an"];
  const geography = getGeographyTier(student.province);
  const sourceGroup = getSourceGroup(student.source);
  const learningStage =
    student.stage === "Nhập học" || student.stage === "New Enter"
      ? "Sau kỳ thi"
      : "Lớp 12 · học kỳ 2";
  const parentInvolvement: Student360Data["parentProfile"]["involvement"] =
    student.priority === "Cao" ? "Cao" : "Trung bình";
  const parentProfile: Student360Data["parentProfile"] = {
    ...student360Data.parentProfile,
    name: parent.name,
    relation: parent.relation,
    involvement: parentInvolvement,
    concerns: barrier
      ? getParentConcerns(barrier.value, student.major)
      : student360Data.parentProfile.concerns,
    preferredChannel: parent.preferredChannel,
    bestContactTime: parent.bestContactTime,
    lastInteraction: student.lastActivity,
  };

  return {
    ...student360Data,
    student: {
      ...student360Data.student,
      id: student.id,
      initials: student.initials,
      name: student.name,
      code: student.code,
      school: `${student.school}, ${student.province}`,
      major: student.major,
      province: student.province,
      counselor: student.owner,
      revision: student.revision,
      studentStage: student.studentStage,
      grade: learningStage,
    },
    classification,
    acquisition: {
      ...student360Data.acquisition,
      firstTouch: student.source,
      sourceGroup,
      campaign: `${student.source} · ${student.province}`,
    },
    segmentation: {
      ...student360Data.segmentation,
      learningStage,
      approachGoal:
        student.stage === "Nhập học"
          ? "Theo dõi xác nhận và chuẩn bị trước nhập học"
          : student.stage === "Ứng tuyển"
            ? "Hỗ trợ hoàn tất hồ sơ"
            : "Hỗ trợ quyết định và mở hồ sơ",
      geographyTier: geography.tier,
      geographyImplication: geography.implication,
      schoolTier:
        student.priority === "Cao"
          ? "Trường có lịch sử nhập học tốt"
          : "Trường có nhiều quan tâm, cần theo dõi chuyển đổi",
    },
    parentProfile,
    readiness: buildReadiness(student, parentProfile),
    profile: student360Data.profile.map((item) =>
      item.label === "Khu vực"
        ? { ...item, value: student.province }
        : item.label === "Nguồn"
          ? { ...item, value: student.source }
          : item,
    ),
    family: [
      {
        label: "Người liên hệ chính",
        value: `${parentProfile.name} · ${parentProfile.relation}`,
      },
      {
        label: "Vai trò quyết định",
        value: parentProfile.role,
        emphasis: true,
      },
      {
        label: "Mối quan tâm",
        value: parentProfile.concerns[0] ?? "Chưa xác định",
        emphasis: true,
      },
      {
        label: "Kênh phù hợp",
        value: `${parentProfile.preferredChannel} ${parentProfile.bestContactTime}`,
      },
    ],
    insight: buildInsight(student, classification, parentProfile),
    journey: buildJourney(
      student,
      parentProfile,
      barrier?.value ?? "thông tin",
    ),
    application: buildApplication(student),
    zaloMessages: [],
    calls: [],
  };
}

export async function getStudent360(
  studentId = "nguyen-minh-an",
): Promise<Student360Data | null> {
  try {
    const result = await nestRequest<{
      data?: Record<string, unknown>;
    }>(`/api/v1/students/${encodeURIComponent(studentId)}`);
    const student = result.data;
    if (!student || typeof student !== "object") {
      throw new DirectorStudentsApiError(
        502,
        "INVALID_STUDENT_RESPONSE",
        "Phản hồi hồ sơ học sinh không hợp lệ.",
      );
    }
    return toNestStudent360(student);
  } catch (error) {
    if (error instanceof DirectorStudentsApiError) throw error;
    if (error instanceof NestApiError) {
      if (error.status === 404 || error.code === "STUDENT_NOT_FOUND") {
        return null;
      }
      throw new DirectorStudentsApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

function toNestStudent360(student: Record<string, unknown>): Student360Data {
  const text = (value: unknown): string =>
    typeof value === "string" ? value : "";
  const nullableText = (value: unknown): string | null => {
    const result = text(value).trim();
    return result || null;
  };
  const name = text(student.fullName) || "Học sinh";
  const stage = text(student.studentStage);
  const owner = text(student.owner) || "Chưa phân công";
  const source = text(student.source) || "Chưa xác định";
  const province = text(student.province) || "Chưa xác định";
  const major = text(student.major) || "Chưa xác định";
  const qualityBucket = text(student.qualityBucket);
  const score = Number(student.latestScore);
  const signalScore = Number.isFinite(score) ? score : null;
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = [words[0]?.[0], words.at(-1)?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  const parentName = text(student.parentName);
  const admissionYear = nullableText(student.admissionYear);
  const studyStage = nullableText(student.studyStage);
  const currentGrade = nullableText(student.currentGrade);
  const modifiedAt = text(student.modifiedAt) || new Date().toISOString();
  const normalizedStage = [
    "New",
    "Attempting",
    "Connected",
    "Qualified",
    "Registration",
    "New Enter",
    "Disqualified",
  ].includes(stage)
    ? (stage as Student360Data["student"]["studentStage"])
    : null;
  const readinessLevel = text(student.readinessLevel);
  const readinessValue =
    readinessLevel === "High" ? 85 : readinessLevel === "Medium" ? 60 : 35;

  return {
    student: {
      id: text(student.id),
      studentId: text(student.id),
      initials: initials || "HS",
      name,
      code: text(student.studentCode),
      school: text(student.school),
      schoolId: nullableText(student.highSchoolId),
      grade: currentGrade || studyStage || "Chưa xác định",
      admissionYear,
      studentStage: normalizedStage,
      studyStage,
      major,
      phone: text(student.phone),
      email: text(student.email),
      province,
      provinceId: nullableText(student.provinceId),
      ward: nullableText(student.ward),
      wardId: nullableText(student.wardId),
      currentGrade,
      counselor: owner,
      ownerId: nullableText(student.ownerUserId),
      revision:
        typeof student.revision === "number" ? student.revision : undefined,
      engagementRevision:
        typeof student.revision === "number" ? student.revision : undefined,
      priority:
        qualityBucket === "Hot"
          ? "Cao"
          : qualityBucket === "Warm"
            ? "Trung bình"
            : qualityBucket
              ? "Thấp"
              : null,
      lastUpdatedAt: modifiedAt,
      aspiration: nullableText(student.aspiration),
      aspirationId: nullableText(student.aspirationId),
      profileDetails: {
        personal: {
          fullName: nullableText(student.fullName),
          dateOfBirth: nullableText(student.dateOfBirth),
          gender: nullableText(student.gender),
          idNumber: nullableText(student.idNumber),
          birthPlace: nullableText(student.birthPlace),
          ethnicity: nullableText(student.ethnicity),
          religion: nullableText(student.religion),
          nationality: nullableText(student.nationality),
          idIssuedDate: nullableText(student.idIssuedDate),
          idIssuedPlace: nullableText(student.idIssuedPlace),
          phone: nullableText(student.phone),
          otherPhone: nullableText(student.otherPhone),
          email: nullableText(student.email),
          otherEmail: nullableText(student.otherEmail),
          source: nullableText(student.source),
          campaign: nullableText(student.campaign),
          owner: nullableText(student.owner),
          sourceLeadId: nullableText(student.sourceLeadId),
          majorId: nullableText(student.majorId),
          major: nullableText(student.major),
          admissionYearId: nullableText(student.admissionYearId),
          admissionYear: nullableText(student.admissionYear),
          createdAt: nullableText(student.createdAt),
          modifiedAt: nullableText(student.modifiedAt),
          branchId: nullableText(student.campusId),
          branch: nullableText(student.branch),
          sourceLead: nullableText(student.sourceLeadId),
        },
        contact: {
          name: nullableText(student.parentName),
          phone: nullableText(student.parentPhone),
          otherPhone: nullableText(student.parentOtherPhone),
          email: nullableText(student.parentEmail),
          bankName: nullableText(student.bankName),
          accountNumber: nullableText(student.accountNumber),
          accountHolder: nullableText(student.accountHolder),
          fatherEmail: nullableText(student.fatherEmail),
          fatherName: nullableText(student.fatherName),
          fatherPhone: nullableText(student.fatherPhone),
          fatherOccupation: nullableText(student.fatherOccupation),
          motherName: nullableText(student.motherName),
          motherPhone: nullableText(student.motherPhone),
          motherEmail: nullableText(student.motherEmail),
          motherOccupation: nullableText(student.motherOccupation),
        },
        address: {
          province: nullableText(student.province),
          provinceId: nullableText(student.provinceId),
          ward: nullableText(student.ward),
          wardId: nullableText(student.wardId),
          fullAddress: nullableText(student.contactAddress),
        },
      },
    },
    readiness: [
      {
        label: "Mức sẵn sàng",
        value: readinessValue,
        tone:
          readinessValue >= 75
            ? "success"
            : readinessValue >= 50
              ? "warning"
              : "error",
        detail: readinessLevel || "Chưa có dữ liệu đánh giá",
      },
    ],
    profile: [
      { label: "Khu vực", value: province },
      { label: "Nguồn", value: source },
      { label: "Chiến dịch", value: text(student.campaign) || "—" },
      { label: "Cập nhật lần cuối", value: modifiedAt },
    ],
    academics: [],
    admissionProfiles: Array.isArray(student.admissionProfiles)
      ? (student.admissionProfiles as StudentAdmissionProfile[])
      : [],
    family: parentName ? [{ label: "Người liên hệ", value: parentName }] : [],
    classification: {
      dimensions: [],
      combination: qualityBucket || "Chưa phân loại",
      interpretation: "Chưa có dữ liệu phân loại chi tiết.",
      action: "Tiếp tục cập nhật tương tác và nhu cầu của học sinh.",
      updatedAt: modifiedAt,
      updateTrigger: "Nest CRM student profile",
      reviewStatus: "Chờ xác nhận",
      reviewedBy: "",
    },
    acquisition: {
      firstTouch: text(student.advertisingChannel) || source,
      sourceGroup: "Trực tuyến chủ động",
      campaign: text(student.campaign) || "—",
      capturedAt: text(student.createdAt) || modifiedAt,
      attributionModel: "CRM source",
      consent: text(student.privacyStatus) || "Chưa xác định",
    },
    segmentation: {
      learningStage: studyStage || currentGrade || "Chưa xác định",
      approachGoal: stage || "Theo dõi và xác minh nhu cầu",
      geographyTier: province,
      geographyImplication: "Chưa có dữ liệu phân vùng.",
      schoolTier: text(student.school) || "Chưa xác định",
      economicContext: "Chưa có dữ liệu",
      economicUsage: "Chưa có dữ liệu",
    },
    parentProfile: {
      name: parentName || "Chưa có thông tin",
      relation: parentName ? "Người liên hệ" : "Chưa xác định",
      involvement: "Chưa xác định",
      role: "Chưa xác định",
      concerns: [],
      preferredChannel: "Chưa xác định",
      bestContactTime: "Chưa xác định",
      consentStatus: text(student.privacyStatus) || "Chưa xác định",
      lastInteraction: modifiedAt,
    },
    insight: {
      summary: `${name} đang ở trạng thái ${stage || "chưa xác định"}.`,
      signalScore,
      probability: signalScore,
      concern: text(student.primaryBarrier) || "Chưa xác định",
      decisionMaker: parentName || "Chưa xác định",
      evidence: [
        stage ? `Trạng thái: ${stage}` : "Chưa có trạng thái",
        source !== "Chưa xác định" ? `Nguồn: ${source}` : "Chưa có nguồn",
      ],
      recommendation:
        "Bổ sung tương tác và cập nhật hồ sơ trước bước tiếp theo.",
    },
    journey: [],
    engagement: [],
    application: [],
    zaloMessages: [],
    calls: [],
  };
}

export async function getStudentChatwootInteractions(
  studentId: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<StudentChatwootInteractionsResponse | null> {
  try {
    const result = await nestRequest<{
      data?: Array<Record<string, unknown>>;
    }>(`/api/v1/students/${encodeURIComponent(studentId)}/timeline`, {
      query: { limit: 200 },
    });
    if (!Array.isArray(result.data)) {
      throw new DirectorStudentsApiError(
        502,
        "INVALID_CHATWOOT_INTERACTIONS_RESPONSE",
        "Phản hồi tương tác Chatwoot không hợp lệ.",
      );
    }
    const interactions = result.data
      .filter((entry) => entry.type === "interaction")
      .map((entry) => ({
        name: typeof entry.id === "string" ? entry.id : "",
        student: studentId,
        crm_contact: null,
        interaction_type:
          typeof entry.channel === "string" && entry.channel
            ? entry.channel
            : "interaction",
        interaction_datetime:
          typeof entry.occurredAt === "string" ? entry.occurredAt : "",
        summary: typeof entry.title === "string" ? entry.title : null,
        notes: typeof entry.content === "string" ? entry.content : null,
        channel: typeof entry.channel === "string" ? entry.channel : null,
        direction:
          entry.direction === "inbound" || entry.direction === "outbound"
            ? (entry.direction as "inbound" | "outbound")
            : null,
        conversation_id: null,
        agent_id: null,
        outcome: typeof entry.outcome === "string" ? entry.outcome : null,
        actor: typeof entry.author === "string" ? entry.author : null,
        source_namespace: "nest.timeline",
        source_record_id: typeof entry.id === "string" ? entry.id : null,
        creation:
          typeof entry.occurredAt === "string" ? entry.occurredAt : null,
      }))
      .filter((entry) => entry.name && entry.interaction_datetime);
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 50));
    const start = (page - 1) * pageSize;
    return {
      student_id: studentId,
      data: interactions.slice(start, start + pageSize),
      zalo_messages: [],
      meta: {
        page,
        page_size: pageSize,
        total: interactions.length,
        has_next_page: start + pageSize < interactions.length,
      },
    };
  } catch (error) {
    if (error instanceof DirectorStudentsApiError) throw error;
    if (error instanceof NestApiError) {
      throw new DirectorStudentsApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

export async function getStudentInteractions(
  studentId: string,
): Promise<StudentInteractionsResponse | null> {
  try {
    const result = await nestRequest<{
      data?: Array<Record<string, unknown>>;
    }>(`/api/v1/students/${encodeURIComponent(studentId)}/timeline`, {
      query: { limit: 100 },
    });
    if (!Array.isArray(result.data)) {
      throw new DirectorStudentsApiError(
        502,
        "INVALID_INTERACTIONS_RESPONSE",
        "Phản hồi lịch sử tương tác không hợp lệ.",
      );
    }
    const calls = result.data
      .filter((entry) => entry.type === "call")
      .map(normalizeNestStudentCall);
    if (calls.some((call) => call === null)) {
      throw new DirectorStudentsApiError(
        502,
        "INVALID_INTERACTIONS_RESPONSE",
        "Phản hồi lịch sử tương tác không hợp lệ.",
      );
    }
    return {
      student_id: studentId,
      zalo_messages: [],
      calls: calls as StudentCallRecord[],
      total_interactions: calls.length,
    };
  } catch (error) {
    if (error instanceof DirectorStudentsApiError) throw error;
    if (error instanceof NestApiError) {
      throw new DirectorStudentsApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLocaleLowerCase("vi-VN");
}

export function computeDirectorStudents(
  params?: DirectorStudentsParams,
): DirectorStudentsResponse {
  const admissionYear = params?.admissionYear ?? 2026;
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.max(1, Math.min(params?.pageSize ?? 20, 100));
  const rawQuery = params?.q?.trim() ?? "";
  const query = normalizeSearchValue(rawQuery);
  const stage = params?.stage ?? "all";
  const province = params?.province ?? "all";
  const provinceId = params?.provinceId ?? "";
  const assignmentStatus = params?.assignmentStatus ?? "all";
  const lifecycleStatus = params?.lifecycleStatus ?? "all";
  const sort = params?.sort ?? "score";
  const order = params?.order ?? "desc";

  const lifecycleByStage: Record<
    StudentListItem["stage"],
    StudentLifecycleStatus
  > = {
    "Quan tâm": "Lead",
    "Tìm hiểu": "MQL",
    "Tư vấn": "MQL",
    "Ứng tuyển": "Applicant",
    "Nhập học": "Enrolled",
    "Đăng ký": "Registration",
    "New Enter": "New Enter",
  };

  const filtered = studentListData.filter((student) => {
    const matchesQuery =
      !query ||
      normalizeSearchValue(
        [
          student.name,
          student.code,
          student.school,
          student.province,
          student.major,
          student.owner,
        ].join(" "),
      ).includes(query);
    const matchesStage = stage === "all" || student.stage === stage;
    const matchesProvince =
      province === "all" ||
      student.province === province ||
      student.provinceId === province;
    const matchesProvinceId =
      !provinceId ||
      student.provinceId === provinceId ||
      normalizeSearchValue(student.province) ===
        normalizeSearchValue(provinceId);
    const matchesAssignment =
      assignmentStatus === "all" ||
      (student.assignmentStatus ??
        (student.owner ? "assigned" : "unassigned")) === assignmentStatus;
    const matchesLifecycle =
      lifecycleStatus === "all" ||
      (student.lifecycleStatus ?? lifecycleByStage[student.stage]) ===
        lifecycleStatus;

    return (
      matchesQuery &&
      matchesStage &&
      matchesProvince &&
      matchesProvinceId &&
      matchesAssignment &&
      matchesLifecycle
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sort === "score") {
      comparison = a.score - b.score;
    } else if (sort === "priority") {
      const priorityWeight: Record<string, number> = {
        Cao: 3,
        "Trung bình": 2,
        Thấp: 1,
      };
      comparison =
        (priorityWeight[a.priority] ?? 0) - (priorityWeight[b.priority] ?? 0);
    } else {
      comparison = a.name.localeCompare(b.name, "vi");
    }
    return order === "desc" ? -comparison : comparison;
  });

  const total = sorted.length;
  const totalAll = 2846;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasNextPage = page < totalPages;
  const paginatedData = sorted
    .slice((page - 1) * pageSize, page * pageSize)
    .map((student) => ({
      ...student,
      assignmentStatus:
        student.assignmentStatus ?? (student.owner ? "assigned" : "unassigned"),
      lifecycleStatus:
        student.lifecycleStatus ?? lifecycleByStage[student.stage] ?? null,
    }));

  const summary: DirectorStudentsSummary = {
    trackedStudents: totalAll,
    trackedStudentsDeltaPercent: 12.4,
    highIntentStudents: 486,
    highIntentRate: 17.1,
    actionsDueToday: 64,
    averageEnrollmentProbability: 68,
    averageEnrollmentProbabilityDelta: 5,
  };

  const actionSummary: DirectorStudentsActionSummary = {
    actionsDueToday: 64,
    decliningInteractionStudents: 18,
    familyReadyStudents: 27,
  };

  const meta: DirectorStudentsMeta = {
    total,
    totalAll,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    admissionYear,
    query: rawQuery || undefined,
    filters: {
      stage: stage !== "all" ? stage : undefined,
      assignmentStatus:
        assignmentStatus !== "all" ? assignmentStatus : undefined,
      lifecycleStatus: lifecycleStatus !== "all" ? lifecycleStatus : undefined,
      province: province !== "all" ? province : provinceId || undefined,
    },
    sort: {
      field: sort,
      order: order as "asc" | "desc",
    },
    asOf: "2026-06-06T10:00:00+07:00",
  };

  return {
    data: paginatedData,
    summary,
    actionSummary,
    meta,
  };
}

export async function getDirectorStudents(
  params?: DirectorStudentsParams,
): Promise<DirectorStudentsResponse> {
  try {
    return await nestDirectorStudents(params);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new DirectorStudentsApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw error;
  }
}
