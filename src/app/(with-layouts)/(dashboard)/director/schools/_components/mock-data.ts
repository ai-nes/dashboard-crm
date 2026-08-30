import type {
  SchoolClassification,
  SchoolDirectoryRecord,
  SchoolIntelligenceData,
  SchoolRelationshipLevel,
  StudentSignal,
  TrendPoint,
} from "@/services/api/schools/types";
import { getSchoolPotentialScore } from "@/services/api/schools/school-directory";

function hash(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 100_000, 17);
}

function makeTrend(seed: number, labels: string[]): TrendPoint[] {
  let prospects = 58 + (seed % 46);
  let applications = 12 + (seed % 14);
  let enrollment = 6 + (seed % 9);

  return labels.map((label, index) => {
    prospects += 5 + ((seed + index * 7) % 9);
    applications += 2 + ((seed + index * 5) % 4);
    enrollment += 1 + ((seed + index * 3) % 3);
    return { label, prospects, applications, enrollment };
  });
}

export function buildSchoolIntelligence(school: SchoolDirectoryRecord): SchoolIntelligenceData {
  const seed = hash(`${school.provinceCode}-${school.schoolCode}`);
  const sixMonthTrend = makeTrend(seed, ["T9", "T10", "T11", "T12", "T1", "T2"]);
  const annualTrend = makeTrend(seed + 31, ["2023", "2024", "2025", "2026"]);
  const finalPoint = sixMonthTrend.at(-1)!;
  const potentialScore = getSchoolPotentialScore(school);
  const grade12Students = 360 + (seed % 540);
  const applications = finalPoint.applications;
  const enrollment = finalPoint.enrollment;
  const applicationChange = -18 + (seed % 34);
  const engagementScore = 76 + (seed % 20);
  const availableStudents = Math.round(grade12Students * (0.28 + (seed % 9) / 100));
  const relationshipLevels: SchoolRelationshipLevel[] = [
    "Chưa tiếp xúc",
    "Đã tiếp xúc",
    "Có đầu mối",
    "Hợp tác thường xuyên",
    "Đối tác chiến lược",
  ];
  const relationshipIndex = seed % relationshipLevels.length;
  const relationshipScore = [16, 36, 58, 78, 94][relationshipIndex];
  const relationshipLevel = relationshipLevels[relationshipIndex];
  const classification: SchoolClassification =
    potentialScore >= 85 && relationshipScore >= 60
      ? "Trọng điểm"
      : potentialScore >= 85
        ? "Mở rộng"
        : relationshipScore >= 60
          ? "Duy trì"
          : "Sàng lọc";
  const classificationCopy: Record<SchoolClassification, { label: string; action: string }> = {
    "Trọng điểm": {
      label: "Tiềm năng cao · Quan hệ tốt",
      action: "Duy trì hợp tác thường xuyên và mở rộng hoạt động theo mùa.",
    },
    "Mở rộng": {
      label: "Tiềm năng cao · Quan hệ còn mỏng",
      action: "Ưu tiên mở đầu mối và thử một hoạt động chi phí thấp.",
    },
    "Duy trì": {
      label: "Tiềm năng vừa · Quan hệ tốt",
      action: "Giữ nhịp tối thiểu, gom hoạt động theo cụm để tối ưu nguồn lực.",
    },
    "Sàng lọc": {
      label: "Tiềm năng vừa · Quan hệ còn mỏng",
      action: "Rà soát sau mùa tuyển sinh trước khi đầu tư thêm nguồn lực.",
    },
  };
  const unavailableStudents = grade12Students - availableStudents;
  const aboveFitStudents = Math.round(grade12Students * 0.22);
  const scoreBands = [
    { label: "Ngoài khoảng phù hợp", students: unavailableStudents - aboveFitStudents, available: false },
    { label: "Học sinh khả dụng", students: availableStudents, available: true },
    { label: "Trên khoảng phù hợp", students: aboveFitStudents, available: false },
  ].map((item) => ({
    ...item,
    share: Math.round((item.students / grade12Students) * 100),
  }));
  const choiceShares = [41, 21, 15, 13, 10];
  const choiceLabels = [
    "Đại học công lập địa phương",
    "Đại học lớn ngoài địa bàn",
    "Đại học tư thục",
    "Cao đẳng / giáo dục nghề nghiệp",
    "Đi làm hoặc hướng khác",
  ];
  const postGraduationChoices = choiceLabels.map((label, index) => ({
    label,
    share: choiceShares[index],
    students: Math.round((grade12Students * choiceShares[index]) / 100),
  }));
  const academicDistribution = {
    p25: 6.3 + (seed % 7) / 10,
    p50: 7.1 + (seed % 6) / 10,
    p75: 7.8 + (seed % 5) / 10,
  };
  const competitionContext = {
    leadingChoice: postGraduationChoices[0].label,
    lostReason: ["Muốn học gần nhà", "Học phí phù hợp hơn", "Khoảng cách đến campus"][seed % 3],
    externalPresence: ["Có 2 đơn vị hoạt động thường xuyên", "Có 1 đơn vị hoạt động theo mùa", "Chưa ghi nhận đơn vị ngoài trường"][seed % 3],
  };
  const geography = {
    cluster: ["Cụm đô thị dày", "Cụm trung tâm huyện cũ", "Cụm nông thôn phân tán"][seed % 3],
    travelTime: ["45 phút", "1 giờ 40 phút", "2 giờ 35 phút"][seed % 3],
    distanceTier: (["Dưới 1 giờ", "1–3 giờ", "Trên 3 giờ"] as const)[seed % 3],
    competitionDensity: (["Thấp", "Trung bình", "Cao"] as const)[(seed + 1) % 3],
  };
  const quadrantPeers = Array.from({ length: 9 }, (_, index) => {
    const peerSeed = hash(`${school.schoolCode}-${index}`);
    return {
      id: `peer-${index}`,
      name: index === 0 ? school.name : `Trường trong cụm ${String.fromCharCode(65 + index)}`,
      potential: 64 + (peerSeed % 32),
      relationship: 14 + (peerSeed % 82),
      availableStudents: 70 + (peerSeed % 260),
      enrollment: 4 + (peerSeed % 28),
      isCurrent: index === 0,
    };
  });
  quadrantPeers[0] = {
    id: school.id,
    name: school.name,
    potential: potentialScore,
    relationship: relationshipScore,
    availableStudents,
    enrollment,
    isCurrent: true,
  };
  const potentialFactors = [
    { label: "Quy mô lớp 12", value: 74 + (seed % 21), description: "Dung lượng học sinh đủ lớn để mở rộng tệp tiếp cận." },
    { label: "Lịch sử nhập học", value: 66 + (seed % 25), description: "Kết quả các mùa trước cho thấy khả năng tạo hồ sơ ổn định." },
    { label: "Hồ sơ học lực", value: 70 + (seed % 22), description: "Tỷ trọng học sinh khá giỏi phù hợp nhóm ngành công nghệ." },
    { label: "Mức độ phù hợp chương trình", value: 78 + (seed % 18), description: "Nhu cầu AI, kinh doanh và truyền thông đang tăng." },
    { label: "Khoảng cách địa lý", value: 58 + (seed % 31), description: "Cần phối hợp sự kiện tại trường để rút ngắn điểm chạm." },
  ];
  const studentSignals: StudentSignal[] = [
    { id: "nguyen-minh-an", name: "Nguyễn Minh An", major: "Trí tuệ nhân tạo", stage: "Đã tư vấn", probability: 86, signalType: "hot", owner: "Trần Quốc Bảo", lastInteraction: "Hôm qua · Zalo", concern: "Học phí & học bổng" },
    { id: "tran-ngoc-bao-chau", name: "Trần Ngọc Bảo Châu", major: "Kỹ thuật phần mềm", stage: "Đã xem học phí", probability: 78, signalType: "highIntent", owner: "Lê Minh Trang", lastInteraction: "2 ngày trước · Website", concern: "Lộ trình nghề nghiệp" },
    { id: "le-gia-huy", name: "Lê Gia Huy", major: "Kinh doanh quốc tế", stage: "Đang ứng tuyển", probability: 82, signalType: "applying", owner: "Nguyễn Hoàng", lastInteraction: "Hôm nay · Hồ sơ", concern: "Tiến độ hồ sơ" },
    { id: "pham-khanh-linh", name: "Phạm Khánh Linh", major: "Thiết kế đồ họa", stage: "Mới quan tâm", probability: 65, signalType: "highIntent", owner: "Trần Quốc Bảo", lastInteraction: "4 ngày trước · Career Talk", concern: "Chưa xác định ngành" },
    { id: "nguyen-hoang-nam", name: "Nguyễn Hoàng Nam", major: "Digital Marketing", stage: "Cần gọi lại", probability: 59, signalType: "noActivity", owner: "Lê Minh Trang", lastInteraction: "21 ngày trước · Chưa có tương tác mới", concern: "Gia đình cần thêm thông tin" },
  ];

  return {
    school,
    potentialScore,
    grade12Students,
    availableStudents,
    prospects: finalPoint.prospects,
    applications,
    enrollment,
    changes: {
      prospects: 6 + (seed % 16),
      applications: applicationChange,
      enrollment: 4 + (seed % 13),
    },
    performance: { "6m": sixMonthTrend, year: annualTrend },
    potentialFactors,
    engagementHealth: {
      score: engagementScore,
      status: engagementScore >= 88 ? "Khỏe" : engagementScore >= 75 ? "Theo dõi" : "Cần kích hoạt",
      factors: [
        { label: "Tương tác tư vấn", value: 79 + (seed % 18) },
        { label: "Tương tác học sinh", value: 72 + (seed % 22) },
        { label: "Tương tác phụ huynh", value: 64 + (seed % 27) },
        { label: "Tham gia sự kiện", value: 70 + (seed % 23) },
        { label: "Hoạt động hồ sơ", value: 58 + (seed % 31) },
      ],
    },
    geography,
    relationship: {
      level: relationshipLevel,
      score: relationshipScore,
      contact: relationshipIndex >= 2 ? "Nguyễn Văn Minh" : "Chưa có đầu mối chính",
      contactRole: relationshipIndex >= 2 ? "Phó hiệu trưởng · Người phụ trách phối hợp" : "Cần xác định người phụ trách",
      lastTouch: relationshipIndex >= 1 ? "15/05/2026 · Thăm trường" : "Chưa ghi nhận điểm chạm",
      nextTouch: relationshipIndex >= 2 ? "12/06/2026 · Career Talk" : "Đặt lịch giới thiệu trong 30 ngày",
      source: "Ghi nhận đội ngũ địa bàn · 15/05/2026",
    },
    classification: { group: classification, ...classificationCopy[classification] },
    quadrantPeers,
    scoreBands,
    academicDistribution,
    postGraduationChoices,
    competitionContext,
    dataFreshness: "Cập nhật 15/05/2026 · 3 nguồn dữ liệu",
    demographics: {
      gender: [
        { label: "Nữ", value: 54 + (seed % 9), color: "var(--primary-500)" },
        { label: "Nam", value: 37 + (seed % 9), color: "var(--primary-200)" },
      ],
      academicProfile: [
        { label: "Giỏi (8.0–10)", value: 43 + (seed % 18) },
        { label: "Khá (6.5–7.9)", value: 31 + (seed % 12) },
        { label: "Trung bình (5.0–6.4)", value: 8 + (seed % 9) },
      ],
      majorInterests: [
        { label: "Kinh doanh quốc tế", value: 24 + (seed % 9), change: 8 },
        { label: "Công nghệ thông tin", value: 20 + (seed % 8), change: 5 },
        { label: "Truyền thông đa phương tiện", value: 13 + (seed % 7), change: -2 },
      ],
    },
    insight: {
      summary: `Trường có tiềm năng ${potentialScore >= 85 ? "cao" : "tốt"}; nhóm học sinh quan tâm tăng ổn định, nhưng cần chuyển đổi sớm trước mốc nộp hồ sơ.`,
      recommendation: "Tổ chức Career Talk + Parent Session",
      evidence: [
        `Học sinh quan tâm tăng ${6 + (seed % 16)}% so với kỳ trước.`,
        `Hồ sơ ứng tuyển ${applicationChange < 0 ? "giảm" : "tăng"} ${Math.abs(applicationChange)}% so với cùng kỳ.`,
        "Chưa ghi nhận hoạt động tư vấn trực tiếp trong 45 ngày gần đây.",
      ],
    },
    activities: [
      {
        id: "activity-1",
        type: "Career Talk",
        title: "Career Talk: Chọn ngành trong kỷ nguyên AI",
        date: "Dự kiến 12/06/2026 · 14:00",
        owner: "Minh Trang · Phụ trách tuyển sinh",
        status: "scheduled",
        outcome: "Mục tiêu: tiếp cận nhóm học sinh khả dụng",
      },
      {
        id: "activity-2",
        type: "Counselling",
        title: "Gửi danh sách học sinh cần tư vấn 1:1",
        date: "28/05/2026 · 09:30",
        owner: "Huy L. · Admissions",
        status: "completed",
        outcome: "Đã nhận danh sách học sinh quan tâm",
      },
      {
        id: "activity-3",
        type: "School visit",
        title: "Thăm trường & cập nhật đầu mối tư vấn",
        date: "15/05/2026 · 10:00",
        owner: "Trang N. · Phụ trách tuyển sinh",
        status: "completed",
        outcome: "Đã xác nhận đầu mối phòng công tác học sinh",
      },
    ],
    studentSignals,
  };
}
