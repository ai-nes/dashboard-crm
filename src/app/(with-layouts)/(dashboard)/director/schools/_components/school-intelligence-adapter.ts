import type {
  ActivityGroupLabel,
  DirectorSchoolActivity,
  DirectorSchoolContact,
  DirectorSchoolDetailData,
  SchoolActivity,
  SchoolContactRole,
  SchoolDirectoryRecord,
  SchoolPotentialIndicator,
  SchoolIntelligenceData,
  SchoolRelationshipLevel,
} from "@/services/api/schools/types";

const relationshipLevels: SchoolRelationshipLevel[] = [
  "Chưa tiếp xúc",
  "Đã tiếp xúc",
  "Có đầu mối",
  "Hợp tác thường xuyên",
  "Đối tác chiến lược",
];

const contactRoles: SchoolContactRole[] = [
  "Ban giám hiệu",
  "GVCN khối 12",
  "GV phụ trách hướng nghiệp",
  "Đoàn trường",
  "Cựu học sinh đang học",
];

const activityGroupLabels: ActivityGroupLabel[] = [
  "Cuộc thi học thuật",
  "Ngày hội hướng nghiệp",
  "Tư vấn tại lớp",
  "Tham quan cơ sở",
  "Tập huấn giáo viên",
  "Hoạt động trực tuyến",
];

const potentialIndicatorIds: SchoolPotentialIndicator["id"][] = ["P1", "P2", "P3", "P4", "P5", "P6"];
const unavailable = "Chưa có dữ liệu";

export function toSchoolIntelligenceData(detail: DirectorSchoolDetailData): SchoolIntelligenceData {
  const school = toDirectorySchool(detail.school);
  const relationshipScore = detail.relationship.score ?? 0;
  const relationshipLevel = normalizeRelationshipLevel(detail.relationship.level);
  const geography = detail.geography;
  const demographics = detail.demographics;
  const subjectMix = detail.subjectMix;
  const earlyForecast = detail.earlyForecast;

  return {
    school,
    locality: detail.locality,
    potentialScore: detail.potentialScore ?? 0,
    grade12Students: detail.grade12Students ?? 0,
    availableStudents: detail.availableStudents ?? 0,
    prospects: detail.prospects ?? 0,
    applications: detail.applications ?? 0,
    enrollment: detail.enrollment ?? 0,
    changes: {
      prospects: detail.changes.prospects ?? 0,
      applications: detail.changes.applications ?? 0,
      enrollment: detail.changes.enrollment ?? 0,
    },
    performance: {
      "6m": detail.performance["6m"],
      year: detail.performance.year,
    },
    geography: {
      cluster: geography?.cluster ?? unavailable,
      clusterMeaning: geography?.clusterMeaning ?? unavailable,
      travelTime: geography?.travelTime ?? detail.locality.travelTime ?? unavailable,
      distanceTier: normalizeDistanceTier(geography?.distanceTier ?? null),
      competitionDensity: normalizeCompetitionDensity(geography?.competitionDensity ?? null),
    },
    demographics: {
      occupationProfile: demographics?.occupationProfile ?? unavailable,
      relativeIncome: normalizeIncome(demographics?.relativeIncome ?? null),
      tuitionAffordability: demographics?.tuitionAffordability ?? unavailable,
      awayFromHomeRate: demographics?.awayFromHomeRate ?? unavailable,
      parentInvolvement: normalizeIncome(demographics?.parentInvolvement ?? null),
    },
    subjectMix: {
      naturalScienceShare: subjectMix?.naturalScienceShare ?? 0,
      socialScienceShare: subjectMix?.socialScienceShare ?? 0,
      recommendedMajorGroup: subjectMix?.recommendedMajorGroup ?? unavailable,
    },
    earlyForecast: {
      grade10CutoffScore: earlyForecast?.grade10CutoffScore ?? 0,
      priorCohortResult: earlyForecast?.priorCohortResult ?? unavailable,
      grade11SubjectSignal: earlyForecast?.grade11SubjectSignal ?? unavailable,
    },
    activityStats: toActivityStats(detail),
    relationship: {
      level: relationshipLevel,
      score: relationshipScore,
      contact: detail.relationship.contact ?? "-",
      contactRole: detail.relationship.contactRole ?? "-",
      lastTouch: detail.relationship.lastTouch ?? "-",
      nextTouch: detail.relationship.nextTouch ?? "-",
      source: detail.dataSources.relationship ?? unavailable,
    },
    classification: {
      group: detail.classification.group ?? "Sàng lọc",
      isKeyAccount: detail.classification.isKeyAccount ?? false,
      label: detail.classification.label ?? unavailable,
      action: unavailable,
    },
    quadrantPeers: toQuadrantPeers(detail),
    scoreBands: toScoreBands(detail),
    examScoreBands: detail.examScoreBands,
    potentialIndicators: toPotentialIndicators(detail),
    academicGap: {
      reportCard: detail.academicGap?.reportCard ?? 0,
      examScore: detail.academicGap?.examScore ?? 0,
    },
    postGraduationChoices: detail.postGraduationChoices
      .filter((item) => item.label !== null && item.students !== null && item.share !== null)
      .map((item) => ({ label: item.label!, students: item.students!, share: item.share! })),
    competitionContext: {
      leadingChoice: detail.competitionContext?.leadingChoice ?? unavailable,
      lostReason: detail.competitionContext?.lostReason ?? unavailable,
      externalPresence: detail.competitionContext?.externalPresence ?? unavailable,
    },
    dataFreshness: detail.asOf ?? unavailable,
    dataSources: {
      directory: detail.dataSources.directory ?? unavailable,
      examScore: detail.dataSources.examScore ?? unavailable,
      reportCard: detail.dataSources.reportCard ?? unavailable,
      relationship: detail.dataSources.relationship ?? unavailable,
    },
    contacts: detail.contacts.map(toSchoolContact),
    activities: detail.activities.map(toSchoolActivity),
    dataAvailability: detail.dataAvailability,
  };
}

function normalizeDistanceTier(value: string | null): SchoolIntelligenceData["geography"]["distanceTier"] {
  return value === "Dưới 1 giờ" || value === "1–3 giờ" || value === "Trên 3 giờ" ? value : unavailable;
}

function normalizeCompetitionDensity(value: string | null): SchoolIntelligenceData["geography"]["competitionDensity"] {
  return value === "Thấp" || value === "Trung bình" || value === "Cao" ? value : unavailable;
}

function normalizeIncome(value: string | null): SchoolIntelligenceData["demographics"]["relativeIncome"] {
  return value === "Thấp" || value === "Trung bình" || value === "Cao" ? value : unavailable;
}

function toActivityStats(detail: DirectorSchoolDetailData): SchoolIntelligenceData["activityStats"] {
  return detail.activityStats
    .filter((item) =>
      item.label !== null &&
      activityGroupLabels.includes(item.label as ActivityGroupLabel) &&
      item.conversionRate !== null &&
      item.costPerActivity !== null,
    )
    .map((item) => ({
      label: item.label as ActivityGroupLabel,
      audience: item.audience ?? unavailable,
      conversionRate: item.conversionRate!,
      costPerActivity: item.costPerActivity!,
      recommended: item.recommended ?? false,
    }));
}

function toPotentialIndicators(detail: DirectorSchoolDetailData): SchoolPotentialIndicator[] {
  return detail.potentialIndicators
    .filter((item) =>
      item.id !== null &&
      potentialIndicatorIds.includes(item.id as SchoolPotentialIndicator["id"]) &&
      item.label !== null &&
      item.weight !== null,
    )
    .map((item) => ({
      id: item.id as SchoolPotentialIndicator["id"],
      label: item.label!,
      score: item.score,
      weight: item.weight!,
      status: item.status === "available" || item.status === "estimated" || item.status === "unavailable" ? item.status : "unavailable",
    }));
}

function toQuadrantPeers(detail: DirectorSchoolDetailData): SchoolIntelligenceData["quadrantPeers"] {
  return detail.quadrantPeers
    .filter((item) =>
      item.id !== null &&
      item.name !== null &&
      item.potential !== null &&
      item.relationship !== null &&
      item.availableStudents !== null &&
      item.enrollment !== null,
    )
    .map((item) => ({
      id: item.id!,
      name: item.name!,
      potential: item.potential!,
      relationship: item.relationship!,
      availableStudents: item.availableStudents!,
      enrollment: item.enrollment!,
      isCurrent: item.isCurrent,
    }));
}

function toScoreBands(detail: DirectorSchoolDetailData): SchoolIntelligenceData["scoreBands"] {
  return detail.scoreBands
    .filter((item) => item.label !== null && item.students !== null && item.share !== null)
    .map((item) => ({ label: item.label!, students: item.students!, share: item.share!, available: item.available }));
}

function toDirectorySchool(school: DirectorSchoolDetailData["school"]): SchoolDirectoryRecord {
  return {
    id: school.id,
    provinceCode: school.provinceCode ?? "",
    province: school.province ?? "-",
    districtCode: school.wardCode ?? "",
    district: school.ward ?? "-",
    schoolCode: school.schoolCode ?? "-",
    name: school.name,
    address: school.address ?? "",
    area: school.area ?? "",
    isBoardingSchool: school.isBoardingSchool ?? false,
  };
}

function normalizeRelationshipLevel(value: string | null): SchoolRelationshipLevel {
  return relationshipLevels.find((level) => level === value) ?? "Chưa tiếp xúc";
}

function normalizeContactRole(value: string | null): SchoolContactRole {
  return contactRoles.find((role) => role === value) ?? "GV phụ trách hướng nghiệp";
}

function toSchoolContact(contact: DirectorSchoolContact) {
  const role = normalizeContactRole(contact.role);
  return {
    role,
    hasContact: Boolean(contact.fullName),
    name: contact.fullName ?? undefined,
    lastTouch: contact.lastTouch ?? undefined,
    note: contact.position ?? contact.relationshipStatus ?? "-",
  } satisfies {
    role: SchoolContactRole;
    hasContact: boolean;
    name?: string;
    lastTouch?: string;
    note: string;
  };
}

function toSchoolActivity(activity: DirectorSchoolActivity): SchoolActivity {
  const normalizedStatus = activity.status?.toLocaleLowerCase("vi-VN");
  const type = normalizeActivityType(activity.activityType);
  return {
    id: `${type}-${activity.scheduledAt ?? activity.occurredAt ?? "unknown"}`,
    type,
    title: activity.activityType ?? "-",
    date: activity.scheduledAt ?? activity.occurredAt ?? "-",
    owner: "-",
    status: normalizedStatus === "completed" ? "completed" : "scheduled",
    outcome: activity.outcome ?? undefined,
  };
}

function normalizeActivityType(value: string | null): SchoolActivity["type"] {
  if (value?.includes("Career")) return "Career Talk";
  if (value?.includes("hội thảo")) return "Hội thảo";
  if (value?.includes("thăm")) return "Thăm trường";
  if (value?.includes("phụ huynh")) return "Gặp phụ huynh";
  return "Tư vấn";
}
