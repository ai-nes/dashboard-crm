export interface SchoolDirectoryRecord {
  id: string;
  provinceCode: string;
  province: string;
  districtCode: string;
  district: string;
  schoolCode: string;
  name: string;
  address: string;
  area: string;
  isBoardingSchool: boolean;
}

export interface TrendPoint {
  label: string;
  prospects: number;
  applications: number;
  enrollment: number;
}

export interface SchoolActivity {
  id: string;
  type: "Thăm trường" | "Career Talk" | "Hội thảo" | "Gặp phụ huynh" | "Tư vấn";
  title: string;
  date: string;
  owner: string;
  status: "completed" | "scheduled";
  outcome?: string;
}

export type ActivityGroupLabel =
  | "Cuộc thi học thuật"
  | "Ngày hội hướng nghiệp"
  | "Tư vấn tại lớp"
  | "Tham quan cơ sở"
  | "Tập huấn giáo viên"
  | "Hoạt động trực tuyến";

export interface SchoolActivityStat {
  label: ActivityGroupLabel;
  audience: string;
  conversionRate: number;
  costPerActivity: number;
  recommended: boolean;
}

export interface SchoolDemographics {
  occupationProfile: string;
  relativeIncome: "Thấp" | "Trung bình" | "Cao";
  tuitionAffordability: string;
  awayFromHomeRate: string;
  parentInvolvement: "Thấp" | "Trung bình" | "Cao";
}

export interface SchoolSubjectMix {
  naturalScienceShare: number;
  socialScienceShare: number;
  recommendedMajorGroup: string;
}

export interface SchoolEarlyForecast {
  grade10CutoffScore: number;
  priorCohortResult: string;
  grade11SubjectSignal: string;
}

export type SchoolRelationshipLevel =
  | "Chưa tiếp xúc"
  | "Đã tiếp xúc"
  | "Có đầu mối"
  | "Hợp tác thường xuyên"
  | "Đối tác chiến lược";

export type SchoolClassification =
  | "Trọng điểm"
  | "Mở rộng"
  | "Duy trì"
  | "Sàng lọc";

export type SchoolContactRole =
  | "Ban giám hiệu"
  | "GVCN khối 12"
  | "GV phụ trách hướng nghiệp"
  | "Đoàn trường"
  | "Cựu học sinh đang học";

export interface SchoolContact {
  role: SchoolContactRole;
  hasContact: boolean;
  name?: string;
  lastTouch?: string;
  note: string;
}

export interface SchoolQuadrantPoint {
  id: string;
  name: string;
  potential: number;
  relationship: number;
  availableStudents: number;
  enrollment: number;
  isCurrent?: boolean;
}

export interface SchoolScoreBand {
  label: string;
  students: number;
  share: number;
  available?: boolean;
}

export interface SchoolChoiceBreakdown {
  label: string;
  students: number;
  share: number;
}

export interface SchoolIntelligenceData {
  school: SchoolDirectoryRecord;
  potentialScore: number;
  grade12Students: number;
  availableStudents: number;
  prospects: number;
  applications: number;
  enrollment: number;
  changes: {
    prospects: number;
    applications: number;
    enrollment: number;
  };
  performance: Record<"6m" | "year", TrendPoint[]>;
  geography: {
    cluster: string;
    clusterMeaning: string;
    travelTime: string;
    distanceTier: "Dưới 1 giờ" | "1–3 giờ" | "Trên 3 giờ";
    competitionDensity: "Thấp" | "Trung bình" | "Cao";
  };
  demographics: SchoolDemographics;
  subjectMix: SchoolSubjectMix;
  earlyForecast: SchoolEarlyForecast;
  activityStats: SchoolActivityStat[];
  relationship: {
    level: SchoolRelationshipLevel;
    score: number;
    contact: string;
    contactRole: string;
    lastTouch: string;
    nextTouch: string;
    source: string;
  };
  classification: {
    group: SchoolClassification;
    isKeyAccount: boolean;
    label: string;
    action: string;
  };
  quadrantPeers: SchoolQuadrantPoint[];
  scoreBands: SchoolScoreBand[];
  academicGap: {
    reportCard: number;
    examScore: number;
  };
  postGraduationChoices: SchoolChoiceBreakdown[];
  competitionContext: {
    leadingChoice: string;
    lostReason: string;
    externalPresence: string;
  };
  dataFreshness: string;
  dataSources: {
    directory: string;
    examScore: string;
    reportCard: string;
    relationship: string;
  };
  contacts: SchoolContact[];
  activities: SchoolActivity[];
}

export type SchoolRegion = "Miền Bắc" | "Miền Trung" | "Miền Nam";

export interface ProvinceSchoolReport {
  province: string;
  region: SchoolRegion;
  schools: number;
  prioritySchools: number;
  averagePotential: number;
}

export interface PrioritySchoolReport {
  school: SchoolDirectoryRecord;
  region: SchoolRegion;
  potentialScore: number;
  grade12Students: number;
  enrollmentForecast: number;
}

export interface SchoolReportData {
  totalSchools: number;
  totalProvinces: number;
  prioritySchools: number;
  averagePotential: number;
  regions: {
    region: SchoolRegion;
    schools: number;
    prioritySchools: number;
    averagePotential: number;
  }[];
  provinces: ProvinceSchoolReport[];
  priorityList: PrioritySchoolReport[];
}
