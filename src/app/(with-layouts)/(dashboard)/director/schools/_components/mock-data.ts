import { SCHOOL_EXAM_SCORE_BAND_LABELS } from "@/services/api/schools/types";
import type {
  ActivityGroupLabel,
  SchoolClassification,
  SchoolContact,
  SchoolDirectoryRecord,
  SchoolIntelligenceData,
  SchoolRelationshipLevel,
  TrendPoint,
} from "@/services/api/schools/types";
import { classifySchool } from "@/services/api/schools/classification";
import { getSchoolPotentialScore } from "@/services/api/schools/school-directory";

import { getSchoolLocalityContext } from "./school-locality-data";

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

function makeExamScoreBands(totalStudents: number, seed: number) {
  const weights = [
    8 + (seed % 4),
    18 + ((seed >> 2) % 5),
    32 + ((seed >> 3) % 7),
    28 + ((seed >> 4) % 6),
    10 + ((seed >> 5) % 4),
  ];
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  const students = weights.map((weight) => Math.floor((totalStudents * weight) / totalWeight));
  students[students.length - 1] += totalStudents - students.reduce((total, count) => total + count, 0);
  const shares = students.map((count) => Math.round((count / totalStudents) * 100));
  shares[shares.length - 1] += 100 - shares.reduce((total, share) => total + share, 0);

  return SCHOOL_EXAM_SCORE_BAND_LABELS.map((label, index) => ({
    label,
    students: students[index],
    share: shares[index],
  }));
}

export function buildSchoolIntelligence(school: SchoolDirectoryRecord): SchoolIntelligenceData {
  const seed = hash(`${school.provinceCode}-${school.schoolCode}`);
  const localityContext = getSchoolLocalityContext(school);
  const sixMonthTrend = makeTrend(seed, ["T9", "T10", "T11", "T12", "T1", "T2"]);
  const annualTrend = makeTrend(seed + 31, ["2023", "2024", "2025", "2026"]);
  const finalPoint = sixMonthTrend.at(-1)!;
  const potentialScore = getSchoolPotentialScore(school);
  const grade12Students = 360 + (seed % 540);
  const applications = finalPoint.applications;
  const enrollment = finalPoint.enrollment;
  const applicationChange = -18 + (seed % 34);
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
  const classification = classifySchool(potentialScore, relationshipScore);
  const classificationCopy: Record<SchoolClassification, { label: string; action: string }> = {
    "Trọng điểm": {
      label: "Tiềm năng cao · Quan hệ tốt",
      action: "Giữ quan hệ và mở rộng hợp tác bằng hoạt động, học bổng và thỏa thuận dài hạn.",
    },
    "Mở rộng": {
      label: "Tiềm năng cao · Quan hệ còn mỏng",
      action: "Tạo đầu mối và thử một hoạt động nhỏ để bắt đầu hợp tác.",
    },
    "Duy trì": {
      label: "Tiềm năng vừa · Quan hệ tốt",
      action: "Giữ liên hệ đều và gom hoạt động theo khu vực để tiết kiệm chi phí.",
    },
    "Sàng lọc": {
      label: "Tiềm năng vừa · Quan hệ còn mỏng",
      action: "Theo dõi nhu cầu của trường trước khi đầu tư thêm.",
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
  const examScoreBands = makeExamScoreBands(grade12Students, seed);
  const choiceShares = [34, 18, 15, 13, 12, 8];
  const choiceLabels = [
    "Đại học công lập địa phương",
    "Đại học lớn tại đô thị trung tâm",
    "Đại học tư thục khác",
    "Cao đẳng và trường nghề",
    "Không học tiếp",
    "Du học",
  ];
  const postGraduationChoices = choiceLabels.map((label, index) => ({
    label,
    share: choiceShares[index],
    students: Math.round((grade12Students * choiceShares[index]) / 100),
  }));
  const academicGap = {
    examScore: 19.4 + (seed % 12) / 10,
    reportCard: 21.8 + (seed % 15) / 10,
  };
  const competitionContext = {
    leadingChoice: postGraduationChoices[0].label,
    lostReason: ["Muốn học gần nhà", "Học phí phù hợp hơn", "Khoảng cách đến campus"][seed % 3],
    externalPresence: ["Có 2 đơn vị hoạt động thường xuyên", "Có 1 đơn vị hoạt động theo mùa", "Chưa ghi nhận đơn vị ngoài trường"][seed % 3],
  };
  const clusterIndex = seed % 3;
  const geography = localityContext.isLongAn
    ? {
        cluster: localityContext.regionLabel,
        clusterMeaning: "Long An là vùng vệ tinh phía Tây TP.HCM, phù hợp các hoạt động có hỗ trợ di chuyển và tư vấn cùng phụ huynh.",
        travelTime: localityContext.travelTime,
        distanceTier: "1–3 giờ" as const,
        competitionDensity: "Cao" as const,
      }
    : {
        cluster: ["Nhiều trường gần nhau", "Khu trung tâm cũ", "Trường xa campus"][clusterIndex],
        clusterMeaning: [
          "Nhiều trường gần nhau, phù hợp tổ chức sự kiện chung để chia sẻ chi phí",
          "Các trường quanh khu trung tâm cũ, phù hợp gom lịch tư vấn và hoạt động chung",
          "Trường đơn lẻ, chi phí tiếp cận cao mỗi lượt — nên gộp vào lịch trình dài ngày hoặc chuyển sang hình thức trực tuyến",
        ][clusterIndex],
        travelTime: localityContext.travelTime,
        distanceTier: (localityContext.distanceKm < 60 ? "Dưới 1 giờ" : localityContext.distanceKm < 180 ? "1–3 giờ" : "Trên 3 giờ") as "Dưới 1 giờ" | "1–3 giờ" | "Trên 3 giờ",
        competitionDensity: (["Thấp", "Trung bình", "Cao"] as const)[(seed + 1) % 3],
      };

  const demographics = {
    occupationProfile: ["Công chức, viên chức", "Kinh doanh tự do, tiểu thương", "Nông nghiệp, lao động phổ thông"][seed % 3],
    relativeIncome: (["Cao", "Trung bình", "Thấp"] as const)[clusterIndex],
    tuitionAffordability: relationshipScore >= 60 ? "Có thể chi trả học phí đầy đủ, ít cần học bổng" : "Cần học bổng hoặc phương án trả góp để thuyết phục",
    awayFromHomeRate: localityContext.isLongAn ? "34% học sinh nhập học ngoài tỉnh các mùa trước" : `${18 + (seed % 22)}% học sinh nhập học ngoài tỉnh các mùa trước`,
    parentInvolvement: (["Cao", "Trung bình", "Thấp"] as const)[(seed + 2) % 3],
  };

  const subjectMix = (() => {
    const naturalScienceShare = 38 + (seed % 40);
    const socialScienceShare = 100 - naturalScienceShare - 8;
    const recommendedMajorGroup =
      naturalScienceShare >= 60
        ? "Công nghệ và kỹ thuật"
        : socialScienceShare >= 45
          ? "Ngôn ngữ, truyền thông, quản trị"
          : "Đa ngành, ưu tiên hoạt động hướng nghiệp rộng";
    return { naturalScienceShare, socialScienceShare, recommendedMajorGroup };
  })();

  const isWithinOneHour = geography.distanceTier === "Dưới 1 giờ";
  const potentialIndicatorWeights = isWithinOneHour ? [30.6, 15, 24.4, 10, 0, 20] : [25, 15, 20, 10, 10, 20];
  const rawPotentialScores = [
    potentialScore - 5 + (seed % 11),
    potentialScore - 3 + (seed % 7),
    potentialScore - 4 + (seed % 9),
    potentialScore - 2 + (seed % 5),
    potentialScore - 3 + (seed % 7),
  ].map((score) => Math.min(100, Math.max(0, score)));
  const weightedWithoutP6 = rawPotentialScores.reduce(
    (total, score, index) => total + (score * potentialIndicatorWeights[index]) / 100,
    0,
  );
  const potentialIndicators = [
    { id: "P1" as const, label: "Quy mô khả dụng", score: rawPotentialScores[0], weight: potentialIndicatorWeights[0] },
    { id: "P2" as const, label: "Mật độ khả dụng", score: rawPotentialScores[1], weight: potentialIndicatorWeights[1] },
    { id: "P3" as const, label: "Mức khớp ngành", score: rawPotentialScores[2], weight: potentialIndicatorWeights[2] },
    { id: "P4" as const, label: "Khả năng chi trả", score: rawPotentialScores[3], weight: potentialIndicatorWeights[3] },
    { id: "P5" as const, label: "Xu hướng đi học xa", score: rawPotentialScores[4], weight: potentialIndicatorWeights[4] },
    { id: "P6" as const, label: "Lịch sử chuyển đổi", score: Math.min(100, Math.max(0, Math.round((potentialScore - weightedWithoutP6) / (potentialIndicatorWeights[5] / 100)))), weight: potentialIndicatorWeights[5] },
  ].filter((indicator) => indicator.id !== "P5" || !isWithinOneHour);

  const earlyForecast = {
    grade10CutoffScore: 32 + (seed % 12),
    priorCohortResult: `Khoá trước: ${availableStudents - 10 + (seed % 20)} học sinh khả dụng, ${relationshipScore >= 60 ? "kết quả ổn định" : "biến động nhẹ"} qua các mùa`,
    grade11SubjectSignal: `${subjectMix.naturalScienceShare >= 55 ? "Khối 11 tiếp tục nghiêng khoa học tự nhiên" : "Khối 11 có xu hướng cân bằng hơn khối 12"}`,
  };

  const activityBaseline: { label: ActivityGroupLabel; audience: string; conversionRate: number; costPerActivity: number }[] = [
    { label: "Cuộc thi học thuật", audience: "Khối 10, 11", conversionRate: 31, costPerActivity: 42 },
    { label: "Ngày hội hướng nghiệp", audience: "Khối 11, 12", conversionRate: 18, costPerActivity: 28 },
    { label: "Tư vấn tại lớp", audience: "Khối 12", conversionRate: 14, costPerActivity: 12 },
    { label: "Tham quan cơ sở", audience: "Học sinh và phụ huynh", conversionRate: 27, costPerActivity: 55 },
    { label: "Tập huấn giáo viên", audience: "GV hướng nghiệp", conversionRate: 6, costPerActivity: 18 },
    { label: "Hoạt động trực tuyến", audience: "Học sinh vùng xa", conversionRate: 9, costPerActivity: 5 },
  ];
  const recommendedByGroup: Record<SchoolClassification, ActivityGroupLabel[]> = {
    "Trọng điểm": ["Cuộc thi học thuật", "Ngày hội hướng nghiệp", "Tư vấn tại lớp", "Tham quan cơ sở"],
    "Mở rộng": ["Tập huấn giáo viên", "Ngày hội hướng nghiệp"],
    "Duy trì": ["Ngày hội hướng nghiệp", "Hoạt động trực tuyến"],
    "Sàng lọc": ["Hoạt động trực tuyến"],
  };
  const activityStats = activityBaseline.map((item, index) => ({
    ...item,
    conversionRate: Math.max(3, item.conversionRate + (((seed + index * 7) % 9) - 4)),
    recommended: recommendedByGroup[classification].includes(item.label),
  }));
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

  const hasPrimaryContact = relationshipIndex >= 2;
  const contacts: SchoolContact[] = [
    {
      role: "Ban giám hiệu",
      hasContact: hasPrimaryContact,
      name: hasPrimaryContact ? "Nguyễn Văn Minh" : undefined,
      lastTouch: hasPrimaryContact ? "15/05/2026 · Thăm trường" : undefined,
      note: hasPrimaryContact ? "Phó hiệu trưởng · đầu mối phê duyệt hoạt động" : "Chưa có kênh làm việc chính thức",
    },
    {
      role: "GVCN khối 12",
      hasContact: relationshipIndex >= 1,
      name: relationshipIndex >= 1 ? "Trần Thị Hạnh" : undefined,
      lastTouch: relationshipIndex >= 1 ? "28/05/2026 · Zalo" : undefined,
      note: "Người giới thiệu tự nhiên nhất tới học sinh",
    },
    {
      role: "GV phụ trách hướng nghiệp",
      hasContact: relationshipIndex >= 2,
      name: relationshipIndex >= 2 ? "Lê Quang Huy" : undefined,
      lastTouch: relationshipIndex >= 2 ? "20/05/2026 · Email" : undefined,
      note: "Phối hợp nội dung, cung cấp tài liệu hướng nghiệp",
    },
    {
      role: "Đoàn trường",
      hasContact: relationshipIndex >= 3,
      name: relationshipIndex >= 3 ? "Phạm Thu Trang" : undefined,
      lastTouch: relationshipIndex >= 3 ? "10/05/2026 · Gặp trực tiếp" : undefined,
      note: "Đồng tổ chức hoạt động ngoại khoá cho khối 10, 11",
    },
    {
      role: "Cựu học sinh đang học",
      hasContact: relationshipIndex >= 3,
      name: relationshipIndex >= 3 ? "Đỗ Gia Bảo · K15" : undefined,
      lastTouch: relationshipIndex >= 3 ? "05/05/2026 · Về trường cũ" : undefined,
      note: "Hiệu quả cao, chi phí thấp nhất — dễ bị bỏ quên",
    },
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
    geography,
    demographics,
    subjectMix,
    earlyForecast,
    activityStats,
    relationship: {
      level: relationshipLevel,
      score: relationshipScore,
      contact: hasPrimaryContact ? "Nguyễn Văn Minh" : "Chưa có đầu mối chính",
      contactRole: hasPrimaryContact ? "Phó hiệu trưởng · Người phụ trách phối hợp" : "Cần xác định người phụ trách",
      lastTouch: relationshipIndex >= 1 ? "15/05/2026 · Thăm trường" : "Chưa ghi nhận điểm chạm",
      nextTouch: relationshipIndex >= 2 ? "12/06/2026 · Career Talk" : "Đặt lịch giới thiệu trong 30 ngày",
      source: "Ghi nhận đội ngũ địa bàn · 15/05/2026",
    },
    classification: { group: classification, isKeyAccount: classification === "Trọng điểm", ...classificationCopy[classification] },
    quadrantPeers,
    scoreBands,
    examScoreBands,
    potentialIndicators,
    academicGap,
    postGraduationChoices,
    competitionContext,
    dataFreshness: "Cập nhật 15/05/2026 · 4 nguồn dữ liệu",
    dataSources: {
      directory: "Danh mục ngành giáo dục · hồ sơ trường & địa chỉ",
      examScore: "Phổ điểm tốt nghiệp do Bộ công bố, đối chiếu thống kê của Sở",
      reportCard: "Dữ liệu hồ sơ nội bộ các mùa trước",
      relationship: "Ghi nhận đội ngũ địa bàn · 15/05/2026",
    },
    contacts,
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
        type: "Tư vấn",
        title: "Gửi danh sách học sinh cần tư vấn 1:1",
        date: "28/05/2026 · 09:30",
        owner: "Huy L. · Phụ trách tuyển sinh",
        status: "completed",
        outcome: "Đã nhận danh sách học sinh quan tâm",
      },
      {
        id: "activity-3",
        type: "Thăm trường",
        title: "Thăm trường & cập nhật đầu mối tư vấn",
        date: "15/05/2026 · 10:00",
        owner: "Trang N. · Phụ trách tuyển sinh",
        status: "completed",
        outcome: "Đã xác nhận đầu mối phòng công tác học sinh",
      },
    ],
  };
}
