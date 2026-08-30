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
  type: "School visit" | "Career Talk" | "Workshop" | "Parent session" | "Counselling";
  title: string;
  date: string;
  owner: string;
  status: "completed" | "scheduled";
  outcome?: string;
}

export interface StudentSignal {
  id: string;
  name: string;
  major: string;
  stage: string;
  probability: number;
  signalType: "hot" | "highIntent" | "noActivity" | "applying";
  owner: string;
  lastInteraction: string;
  concern: string;
}

export interface SchoolEngagementHealth {
  score: number;
  status: "Khỏe" | "Theo dõi" | "Cần kích hoạt";
  factors: { label: string; value: number }[];
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
  potentialFactors: { label: string; value: number; description: string }[];
  engagementHealth: SchoolEngagementHealth;
  geography: {
    cluster: string;
    travelTime: string;
    distanceTier: "Dưới 1 giờ" | "1–3 giờ" | "Trên 3 giờ";
    competitionDensity: "Thấp" | "Trung bình" | "Cao";
  };
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
    label: string;
    action: string;
  };
  quadrantPeers: SchoolQuadrantPoint[];
  scoreBands: SchoolScoreBand[];
  academicDistribution: {
    p25: number;
    p50: number;
    p75: number;
  };
  postGraduationChoices: SchoolChoiceBreakdown[];
  competitionContext: {
    leadingChoice: string;
    lostReason: string;
    externalPresence: string;
  };
  dataFreshness: string;
  demographics: {
    gender: { label: string; value: number; color: string }[];
    academicProfile: { label: string; value: number }[];
    majorInterests: { label: string; value: number; change: number }[];
  };
  insight: {
    summary: string;
    recommendation: string;
    evidence: string[];
  };
  activities: SchoolActivity[];
  studentSignals: StudentSignal[];
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
