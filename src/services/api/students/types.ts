export type StudentJourneyStage =
  | "Quan tâm"
  | "Tìm hiểu"
  | "Tư vấn"
  | "Ứng tuyển"
  | "Nhập học";

export type StudentStage =
  | "New"
  | "Attempting"
  | "Connected"
  | "Qualified"
  | "Disqualified";

// Kept as an alias for the existing student status controls while the NBA
// contract uses the canonical StudentStage name.
export type StudentStatus = StudentStage;

export type StudentAssignmentStatus = "assigned" | "unassigned";

export type LeadProcessingStatus =
  | "NEW"
  | "PROCESSING"
  | "PROCESSED"
  | "ASSIGNED"
  | "CLOSED";

export type LeadResolution =
  | "PENDING"
  | "MATCHED"
  | "CREATED"
  | "DUPLICATE"
  | "INVALID"
  | "SPAM"
  | "FAILED";

export type StudentLifecycleStatus =
  | "Lead"
  | "MQL"
  | "Applicant"
  | "Enrolled"
  | "Lost";

export type StudentPriority = "Cao" | "Trung bình" | "Thấp";

export type StudentVerificationStatus =
  | "Đã xác thực"
  | "Chưa xác thực"
  | "Cần xác minh";

export type StudentConsentStatus =
  | "Đã đồng ý"
  | "Chưa đồng ý"
  | "Đã rút lại"
  | "Chưa xác định";

export interface StudentContactConsent {
  status: StudentConsentStatus;
  channels: ("Điện thoại" | "Zalo" | "Email")[];
  updatedAt?: string | null;
}

export interface StudentProbabilityTrendPoint {
  date: string;
  score: number;
  touches: number;
  eventTitle?: string | null;
  eventDetail?: string | null;
  channel?: string | null;
}

export interface StudentChannelActivity {
  title: string;
  time?: string | null;
  description?: string | null;
}

export interface StudentChannelPerformanceItem {
  channel: string;
  touches: number;
  response: number;
  activities?: StudentChannelActivity[];
  effectiveness?: string | null;
  notes?: string | null;
}

export type StudentTaskType = "call" | "email" | "todo";

export type StudentZaloDirection = "inbound" | "outbound";

export type StudentZaloMessageStatus = "sent" | "delivered" | "read" | "failed";

export interface StudentZaloMessage {
  id: string;
  time: string;
  senderName: string;
  senderRole?: string;
  recipientName: string;
  recipientRole?: string;
  content: string;
  direction: StudentZaloDirection;
  status?: StudentZaloMessageStatus;
  conversationTitle?: string;
  attachmentName?: string;
}

export interface StudentChatwootInteraction {
  name: string;
  student?: string | null;
  crm_contact?: string | null;
  interaction_type: string;
  interaction_datetime: string;
  summary?: string | null;
  notes?: string | null;
  channel?: string | null;
  direction?: StudentZaloDirection | null;
  conversation_id?: string | null;
  agent_id?: string | null;
  outcome?: string | null;
  actor?: string | null;
  source_namespace?: string | null;
  source_record_id?: string | null;
  creation?: string | null;
}

export interface StudentChatwootInteractionsResponse {
  student_id: string;
  data: StudentChatwootInteraction[];
  zalo_messages: StudentZaloMessage[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    has_next_page: boolean;
  };
}

export type StudentCallDirection = "inbound" | "outbound" | "missed";

export type StudentCallOutcome =
  | "connected"
  | "missed"
  | "no-answer"
  | "callback";

export type StudentCallSummaryStatus =
  | "COMPLETED"
  | "PENDING"
  | "NOT_AVAILABLE";

export interface StudentCallRecord {
  id: string;
  interactionId?: string | null;
  evidenceId?: string | null;
  time: string;
  direction: StudentCallDirection;
  outcome: StudentCallOutcome;
  callerName: string;
  receiverName: string;
  callerRole?: string;
  receiverRole?: string;
  phoneNumber?: string;
  durationSeconds?: number;
  topic?: string;
  summary?: string;
  summaryAvailable?: boolean;
  summaryStatus?: StudentCallSummaryStatus;
  transcript?: string | null;
  recordingUrl?: string;
  interactionId?: string | null;
}

export interface StudentInteractionsResponse {
  student_id: string;
  zalo_messages: StudentZaloMessage[];
  calls: StudentCallRecord[];
  total_interactions: number;
}

export type StudentClassificationTone =
  | "primary"
  | "success"
  | "warning"
  | "sky"
  | "gray";

export interface StudentFitFactor {
  label:
    | "Ngành"
    | "Hồ sơ học tập"
    | "Phương thức xét tuyển"
    | "Chi phí"
    | "Địa lý";
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
  /** Canonical CRM Student name used by Student stage commands. */
  studentId?: string | null;
  initials: string;
  name: string;
  code: string;
  school: string;
  province: string;
  provinceId?: string | null;
  major: string;
  stage: StudentJourneyStage;
  /** Contact-stage enum used by the editable status control. */
  studentStage?: StudentStatus | null;
  processingStatus?: LeadProcessingStatus | null;
  resolution?: LeadResolution | null;
  sourceLead?: string | null;
  recordType?: "student";
  assignmentStatus?: StudentAssignmentStatus;
  lifecycleStatus?: StudentLifecycleStatus | null;
  score: number;
  scoreDelta: number;
  lastActivity: string;
  nextAction: string;
  owner: string;
  /** Ownership CAS revision returned by the student list API. */
  revision: number;
  source: string;
  priority: StudentPriority;
}

export interface StudentTaskItem {
  id: string;
  title: string;
  actionCode?: string;
  assignee: string;
  assigneeId?: string;
  activityDate?: string;
  dueDate: string;
  dueTime?: string;
  status: "todo" | "in-progress" | "done" | "canceled";
  priority: StudentPriority;
  taskType?: StudentTaskType;
  notes?: string;
}

export interface StudentNoteItem {
  name?: string;
  author: string;
  date: string;
  content: string;
}

export interface StudentJourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  channel: "Website" | "Sự kiện" | "Cuộc gọi" | "Zalo" | "Hồ sơ";
  status: "completed" | "current" | "upcoming";
}

export interface StudentProfilePersonalDetails {
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  idNumber?: string | null;
  birthPlace?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  nationality?: string | null;
  idIssuedDate?: string | null;
  idIssuedPlace?: string | null;
  phone?: string | null;
  otherPhone?: string | null;
  email?: string | null;
  otherEmail?: string | null;
  source?: string | null;
  campaign?: string | null;
  owner?: string | null;
  convertedFromLead?: string | null;
  sourceLeadId?: string | null;
  sourceLead?: string | null;
  majorId?: string | null;
  major?: string | null;
  admissionYearId?: string | null;
  admissionYear?: string | null;
  branchId?: string | null;
  branch?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
}

export interface StudentProfileContactDetails {
  name?: string | null;
  phone?: string | null;
  otherPhone?: string | null;
  email?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  fatherEmail?: string | null;
  fatherName?: string | null;
  fatherPhone?: string | null;
  fatherOccupation?: string | null;
  motherPhone?: string | null;
  motherName?: string | null;
  motherEmail?: string | null;
  motherOccupation?: string | null;
}

export interface StudentProfileAddressDetails {
  province?: string | null;
  provinceId?: string | null;
  ward?: string | null;
  wardId?: string | null;
  fullAddress?: string | null;
}

export interface StudentProfileDetails {
  personal?: StudentProfilePersonalDetails | null;
  contact?: StudentProfileContactDetails | null;
  address?: StudentProfileAddressDetails | null;
}

export interface StudentAdmissionDocument {
  id: string;
  student?: string | null;
  profile?: string | null;
  documentType: string;
  application?: string | null;
  file?: string | null;
  isPrivate?: boolean;
  status: string;
  version: number;
  sourceReference?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  modifiedAt?: string | null;
}

export interface StudentAdmissionRequirement {
  sectionCode: string;
  documentType: string;
  documentCode: string;
  documentLabel: string;
  category?: string | null;
  description?: string | null;
  requirementGroup: string;
  requirementMode: "ALL" | "ANY";
  isRequired: boolean;
  minimumRequired: number;
  quantity: number;
  orderDisplay: number;
  conditionKey?: string | null;
  instruction?: string | null;
  documents: StudentAdmissionDocument[];
  hasDocument: boolean;
}

export interface StudentAdmissionProfile {
  id: string;
  student: string;
  profileTemplate: string;
  profileTemplateCode?: string | null;
  profileTemplateName?: string | null;
  admissionMethodCode?: string | null;
  admissionMethodName?: string | null;
  preference?: "Primary" | "Alternative" | string | null;
  preferenceOrder?: number | null;
  offering?: string | null;
  offeringKey?: string | null;
  admissionYear: string;
  attemptNumber: number;
  application?: string | null;
  specialProfileOptions?: {
    id: string;
    code: string;
    name: string;
  }[];
  profileStatus: string;
  enrollmentStatus: string;
  revision: number;
  documentCompleteness?: Record<string, unknown> | null;
  requirements: StudentAdmissionRequirement[];
}

export interface Student360Data {
  student: {
    /** CRM Lead name used to load the Student 360 projection. */
    id?: string;
    /** Canonical CRM Student name used by Student stage commands. */
    studentId?: string | null;
    initials: string;
    name: string;
    code: string;
    school: string;
    schoolId?: string | null;
    grade: string;
    admissionYear?: string | null;
    admissionMethod?: string | null;
    /** Contact-stage enum used by the editable status control. */
    studentStage?: StudentStatus | null;
    studyStage?: string | null;
    major: string;
    phone: string;
    email: string;
    province: string;
    provinceId?: string | null;
    ward?: string | null;
    wardId?: string | null;
    currentGrade?: string | null;
    counselor: string;
    ownerId?: string | null;
    /** Ownership revision used as the CAS token when changing the owner. */
    revision?: number;
    /** Engagement revision used as the CAS token for admission application commands. */
    engagementRevision?: number;
    priority?: StudentPriority | null;
    verificationStatus?: StudentVerificationStatus | null;
    contactConsent?: StudentContactConsent | null;
    lastUpdatedAt?: string | null;
    aspiration?: string | null;
    aspirationId?: string | null;
    profileDetails?: StudentProfileDetails | null;
  };
  readiness: {
    label: string;
    value: number;
    tone: "success" | "warning" | "error";
    detail: string;
  }[];
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
    sourceGroup:
      | "Trực tuyến chủ động"
      | "Trực tuyến qua quảng cáo"
      | "Thực địa"
      | "Giới thiệu";
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
    signalScore: number | null;
    probability: number | null;
    potentialLabel?: "Tiềm năng cao" | "Tiềm năng vừa" | "Cần chú ý" | null;
    priorityThreshold?: number | null;
    scoreDelta?: number;
    baseline?: number;
    confidence?: number;
    concern: string;
    decisionMaker: string;
    evidence: string[];
    recommendation: string;
  };
  journey: StudentJourneyEvent[];
  engagement: {
    label: string;
    value: string;
    level: "Cao" | "Trung bình" | "Thấp";
  }[];
  application: {
    label: string;
    value: string;
    status?: "success" | "warning" | "primary";
  }[];
  admissionProfiles?: StudentAdmissionProfile[];
  probabilityTrend?: StudentProbabilityTrendPoint[];
  channelPerformance?: StudentChannelPerformanceItem[];
  documents?: {
    name: string;
    type: string;
    status: string;
    tone: "success" | "warning" | "gray" | "primary" | "error";
    date: string;
  }[];
  notes?: StudentNoteItem[];
  tasks?: StudentTaskItem[];
  zaloMessages?: StudentZaloMessage[];
  calls?: StudentCallRecord[];
  auditEvents?: {
    actor: string;
    action: string;
    time: string;
    status: string;
    tone: "success" | "primary" | "warning" | "error";
  }[];
}

export interface DirectorStudentsParams {
  admissionYear?: number;
  page?: number;
  pageSize?: number;
  q?: string;
  stage?: StudentJourneyStage | "all" | string;
  province?: string;
  provinceId?: string;
  ownerId?: string;
  campaign?: string;
  assignmentStatus?: StudentAssignmentStatus | "all" | string;
  lifecycleStatus?: StudentLifecycleStatus | "all" | string;
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
    assignmentStatus?: string;
    lifecycleStatus?: string;
    campaign?: string;
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
