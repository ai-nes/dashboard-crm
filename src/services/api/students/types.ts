export type StudentJourneyStage = "Quan tâm" | "Tìm hiểu" | "Tư vấn" | "Ứng tuyển" | "Nhập học";

export type StudentPriority = "Cao" | "Trung bình" | "Thấp";

export type StudentClassificationTone = "primary" | "success" | "warning" | "sky" | "gray";

export interface StudentFitFactor {
  label: "Ngành" | "Hồ sơ học tập" | "Phương thức xét tuyển" | "Chi phí" | "Địa lý";
  value: string;
  tone: StudentClassificationTone;
}

export interface StudentClassificationDimension {
  id: "journey" | "interest" | "fit" | "barrier";
  label: string;
  value: string;
  description: string;
  evidence: string[];
  tone: StudentClassificationTone;
  fitFactors?: StudentFitFactor[];
}

export interface StudentListItem {
  id: string;
  initials: string;
  name: string;
  code: string;
  school: string;
  province: string;
  major: string;
  stage: StudentJourneyStage;
  score: number;
  scoreDelta: number;
  lastActivity: string;
  nextAction: string;
  owner: string;
  source: string;
  priority: StudentPriority;
}

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
  classification: {
    dimensions: StudentClassificationDimension[];
    combination: string;
    interpretation: string;
    action: string;
    updatedAt: string;
    updateTrigger: string;
    reviewStatus: "Đã xác nhận" | "Chờ xác nhận";
    reviewedBy: string;
  };
  acquisition: {
    firstTouch: string;
    sourceGroup: "Trực tuyến chủ động" | "Trực tuyến qua quảng cáo" | "Thực địa" | "Giới thiệu";
    campaign: string;
    capturedAt: string;
    attributionModel: string;
    consent: string;
  };
  segmentation: {
    learningStage: string;
    approachGoal: string;
    geographyTier: string;
    geographyImplication: string;
    schoolTier: string;
    economicContext: string;
    economicUsage: string;
  };
  parentProfile: {
    name: string;
    relation: string;
    involvement: "Cao" | "Trung bình" | "Thấp" | "Chưa xác định";
    role: string;
    concerns: string[];
    preferredChannel: string;
    bestContactTime: string;
    consentStatus: string;
    lastInteraction: string;
  };
  insight: {
    summary: string;
    signalScore: number;
    probability: number;
    scoreDelta?: number;
    baseline?: number;
    confidence?: number;
    concern: string;
    decisionMaker: string;
    evidence: string[];
    recommendation: string;
  };
  journey: StudentJourneyEvent[];
  engagement: { label: string; value: string; level: "Cao" | "Trung bình" | "Thấp" }[];
  application: { label: string; value: string; status?: "success" | "warning" | "primary" }[];
  probabilityTrend?: { date: string; score: number; touches: number }[];
  channelPerformance?: { channel: string; touches: number; response: number; fill?: string }[];
  documents?: { name: string; type: string; status: string; tone: "success" | "warning" | "gray" | "primary" | "error"; date: string }[];
  notes?: { author: string; date: string; content: string }[];
  auditEvents?: { actor: string; action: string; time: string; status: string; tone: "success" | "primary" | "warning" | "error" }[];
}

export interface DirectorStudentsParams {
  admissionYear?: number;
  page?: number;
  pageSize?: number;
  q?: string;
  stage?: StudentJourneyStage | "all" | string;
  province?: string;
  sort?: "score" | "priority" | "lastActivityAt" | "nextActionDueAt" | string;
  order?: "asc" | "desc";
}

export interface DirectorStudentsSummary {
  trackedStudents?: number | null;
  trackedStudentsDeltaPercent?: number | null;
  highIntentStudents?: number | null;
  highIntentRate?: number | null;
  actionsDueToday?: number | null;
  averageEnrollmentProbability?: number | null;
  averageEnrollmentProbabilityDelta?: number | null;
}

export interface DirectorStudentsActionSummary {
  actionsDueToday?: number | null;
  decliningInteractionStudents?: number | null;
  familyReadyStudents?: number | null;
}

export interface DirectorStudentsMeta {
  total: number;
  totalAll: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  admissionYear: number;
  query?: string;
  filters?: {
    stage?: string;
    province?: string;
  };
  sort?: {
    field?: string;
    order?: "asc" | "desc";
  };
  asOf?: string;
}

export interface DirectorStudentsResponse {
  data: StudentListItem[];
  summary: DirectorStudentsSummary;
  actionSummary: DirectorStudentsActionSummary;
  meta: DirectorStudentsMeta;
}

export interface FrappeMethodResponse<T> {
  message: T;
}
