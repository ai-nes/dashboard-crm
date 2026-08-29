export type StudentJourneyStage = "Quan tâm" | "Tìm hiểu" | "Tư vấn" | "Ứng tuyển" | "Nhập học";

export interface StudentJourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  channel: "Website" | "Sự kiện" | "Cuộc gọi" | "Zalo" | "Hồ sơ";
  status: "completed" | "current" | "upcoming";
}

export interface Student360Data {
  student: {
    initials: string;
    name: string;
    code: string;
    school: string;
    grade: string;
    major: string;
    phone: string;
    email: string;
    province: string;
    counselor: string;
  };
  readiness: { label: string; value: number; tone: "success" | "warning" | "error"; detail: string }[];
  profile: { label: string; value: string }[];
  academics: { label: string; value: string }[];
  family: { label: string; value: string; emphasis?: boolean }[];
  insight: {
    summary: string;
    probability: number;
    concern: string;
    decisionMaker: string;
    evidence: string[];
    recommendation: string;
  };
  journey: StudentJourneyEvent[];
  engagement: { label: string; value: string; level: "Cao" | "Trung bình" | "Thấp" }[];
  application: { label: string; value: string; status?: "success" | "warning" | "primary" }[];
}
