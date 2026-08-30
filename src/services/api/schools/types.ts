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

export interface SchoolIntelligenceData {
  school: SchoolDirectoryRecord;
  potentialScore: number;
  grade12Students: number;
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
