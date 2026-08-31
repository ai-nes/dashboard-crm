import type {
  DirectorSchoolActivity,
  DirectorSchoolContact,
  DirectorSchoolDetailData,
  SchoolActivity,
  SchoolContactRole,
  SchoolDirectoryRecord,
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

export function toSchoolIntelligenceData(detail: DirectorSchoolDetailData): SchoolIntelligenceData {
  const school = toDirectorySchool(detail.school);
  const relationshipScore = detail.relationship.score ?? 0;
  const relationshipLevel = normalizeRelationshipLevel(detail.relationship.level);

  return {
    school,
    potentialScore: detail.potentialScore ?? 0,
    grade12Students: detail.grade12Students ?? 0,
    availableStudents: detail.availableStudents ?? 0,
    prospects: detail.prospects ?? 0,
    applications: detail.applications ?? 0,
    enrollment: detail.enrollment ?? 0,
    changes: {
      prospects: 0,
      applications: 0,
      enrollment: 0,
    },
    performance: { "6m": [], year: [] },
    geography: {
      cluster: school.province || "-",
      clusterMeaning: "-",
      travelTime: "-",
      distanceTier: "Dưới 1 giờ",
      competitionDensity: "Trung bình",
    },
    demographics: {
      occupationProfile: "-",
      relativeIncome: "Trung bình",
      tuitionAffordability: "-",
      awayFromHomeRate: "-",
      parentInvolvement: "Trung bình",
    },
    subjectMix: {
      naturalScienceShare: 0,
      socialScienceShare: 0,
      recommendedMajorGroup: "-",
    },
    earlyForecast: {
      grade10CutoffScore: 0,
      priorCohortResult: "-",
      grade11SubjectSignal: "-",
    },
    activityStats: [],
    relationship: {
      level: relationshipLevel,
      score: relationshipScore,
      contact: detail.relationship.contact ?? "-",
      contactRole: detail.relationship.contactRole ?? "-",
      lastTouch: detail.relationship.lastTouch ?? "-",
      nextTouch: detail.relationship.nextTouch ?? "-",
      source: "-",
    },
    classification: {
      group: detail.classification.group ?? "Sàng lọc",
      isKeyAccount: detail.classification.isKeyAccount ?? false,
      label: detail.classification.label ?? "-",
      action: "-",
    },
    quadrantPeers: [],
    scoreBands: [],
    potentialIndicators: [],
    academicGap: { reportCard: 0, examScore: 0 },
    postGraduationChoices: [],
    competitionContext: {
      leadingChoice: "-",
      lostReason: "-",
      externalPresence: "-",
    },
    dataFreshness: detail.asOf ?? "-",
    dataSources: {
      directory: "-",
      examScore: "-",
      reportCard: "-",
      relationship: "-",
    },
    contacts: detail.contacts.map(toSchoolContact),
    activities: detail.activities.map(toSchoolActivity),
    dataAvailability: detail.dataAvailability,
  };
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
