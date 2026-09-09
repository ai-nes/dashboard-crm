export enum LeadNeedCategory {
  NEED_CONTACT = "NEED_CONTACT",
  NEED_INFORMATION = "NEED_INFORMATION",
  NEED_ENGAGEMENT = "NEED_ENGAGEMENT",
  NEED_APPLICATION = "NEED_APPLICATION",
  NEED_CONVERSION = "NEED_CONVERSION",
  NEED_PARENT = "NEED_PARENT",
  NEED_RECOVERY = "NEED_RECOVERY",
}

export const LEAD_NEED_CATEGORY_LABEL: Record<LeadNeedCategory, string> = {
  [LeadNeedCategory.NEED_CONTACT]: "Cần liên hệ",
  [LeadNeedCategory.NEED_INFORMATION]: "Cần thông tin",
  [LeadNeedCategory.NEED_ENGAGEMENT]: "Cần tương tác",
  [LeadNeedCategory.NEED_APPLICATION]: "Cần hỗ trợ hồ sơ",
  [LeadNeedCategory.NEED_CONVERSION]: "Cần hỗ trợ chuyển đổi",
  [LeadNeedCategory.NEED_PARENT]: "Cần hỗ trợ phụ huynh",
  [LeadNeedCategory.NEED_RECOVERY]: "Cần phục hồi",
};

export enum LeadNeedSubtype {
  FIRST_CONTACT = "FIRST_CONTACT",
  FOLLOW_UP = "FOLLOW_UP",
  CALLBACK = "CALLBACK",
  PROGRAM_INFORMATION = "PROGRAM_INFORMATION",
  ADMISSION_INFORMATION = "ADMISSION_INFORMATION",
  TUITION_INFORMATION = "TUITION_INFORMATION",
  SCHOLARSHIP_INFORMATION = "SCHOLARSHIP_INFORMATION",
  CAREER_INFORMATION = "CAREER_INFORMATION",
  COUNSELING = "COUNSELING",
  EVENT_ENGAGEMENT = "EVENT_ENGAGEMENT",
  CAMPUS_EXPERIENCE = "CAMPUS_EXPERIENCE",
  APPLICATION_GUIDANCE = "APPLICATION_GUIDANCE",
  APPLICATION_INCOMPLETE = "APPLICATION_INCOMPLETE",
  DOCUMENT_SUPPORT = "DOCUMENT_SUPPORT",
  APPLICATION_DEADLINE = "APPLICATION_DEADLINE",
  DECISION_SUPPORT = "DECISION_SUPPORT",
  ENROLLMENT_SUPPORT = "ENROLLMENT_SUPPORT",
  FINANCIAL_SUPPORT = "FINANCIAL_SUPPORT",
  PARENT_ENGAGEMENT = "PARENT_ENGAGEMENT",
  PARENT_COUNSELING = "PARENT_COUNSELING",
  RE_ENGAGEMENT = "RE_ENGAGEMENT",
  NO_RESPONSE = "NO_RESPONSE",
  NOT_READY = "NOT_READY",
}

export const NEED_CATEGORY_SUBTYPES: Record<
  LeadNeedCategory,
  LeadNeedSubtype[]
> = {
  [LeadNeedCategory.NEED_CONTACT]: [
    LeadNeedSubtype.FIRST_CONTACT,
    LeadNeedSubtype.FOLLOW_UP,
    LeadNeedSubtype.CALLBACK,
  ],
  [LeadNeedCategory.NEED_INFORMATION]: [
    LeadNeedSubtype.PROGRAM_INFORMATION,
    LeadNeedSubtype.ADMISSION_INFORMATION,
    LeadNeedSubtype.TUITION_INFORMATION,
    LeadNeedSubtype.SCHOLARSHIP_INFORMATION,
    LeadNeedSubtype.CAREER_INFORMATION,
  ],
  [LeadNeedCategory.NEED_ENGAGEMENT]: [
    LeadNeedSubtype.COUNSELING,
    LeadNeedSubtype.EVENT_ENGAGEMENT,
    LeadNeedSubtype.CAMPUS_EXPERIENCE,
  ],
  [LeadNeedCategory.NEED_APPLICATION]: [
    LeadNeedSubtype.APPLICATION_GUIDANCE,
    LeadNeedSubtype.APPLICATION_INCOMPLETE,
    LeadNeedSubtype.DOCUMENT_SUPPORT,
    LeadNeedSubtype.APPLICATION_DEADLINE,
  ],
  [LeadNeedCategory.NEED_CONVERSION]: [
    LeadNeedSubtype.DECISION_SUPPORT,
    LeadNeedSubtype.ENROLLMENT_SUPPORT,
    LeadNeedSubtype.FINANCIAL_SUPPORT,
  ],
  [LeadNeedCategory.NEED_PARENT]: [
    LeadNeedSubtype.PARENT_ENGAGEMENT,
    LeadNeedSubtype.PARENT_COUNSELING,
  ],
  [LeadNeedCategory.NEED_RECOVERY]: [
    LeadNeedSubtype.RE_ENGAGEMENT,
    LeadNeedSubtype.NO_RESPONSE,
    LeadNeedSubtype.NOT_READY,
  ],
};

export const LEAD_NEED_SUBTYPE_LABEL: Record<LeadNeedSubtype, string> = {
  [LeadNeedSubtype.FIRST_CONTACT]: "Liên hệ lần đầu",
  [LeadNeedSubtype.FOLLOW_UP]: "Theo dõi tiếp",
  [LeadNeedSubtype.CALLBACK]: "Gọi lại",
  [LeadNeedSubtype.PROGRAM_INFORMATION]: "Thông tin ngành học",
  [LeadNeedSubtype.ADMISSION_INFORMATION]: "Thông tin tuyển sinh",
  [LeadNeedSubtype.TUITION_INFORMATION]: "Thông tin học phí",
  [LeadNeedSubtype.SCHOLARSHIP_INFORMATION]: "Thông tin học bổng",
  [LeadNeedSubtype.CAREER_INFORMATION]: "Thông tin nghề nghiệp",
  [LeadNeedSubtype.COUNSELING]: "Tư vấn",
  [LeadNeedSubtype.EVENT_ENGAGEMENT]: "Tham gia sự kiện",
  [LeadNeedSubtype.CAMPUS_EXPERIENCE]: "Trải nghiệm trường",
  [LeadNeedSubtype.APPLICATION_GUIDANCE]: "Hướng dẫn hồ sơ",
  [LeadNeedSubtype.APPLICATION_INCOMPLETE]: "Hồ sơ chưa hoàn tất",
  [LeadNeedSubtype.DOCUMENT_SUPPORT]: "Hỗ trợ giấy tờ",
  [LeadNeedSubtype.APPLICATION_DEADLINE]: "Hạn nộp hồ sơ",
  [LeadNeedSubtype.DECISION_SUPPORT]: "Hỗ trợ ra quyết định",
  [LeadNeedSubtype.ENROLLMENT_SUPPORT]: "Hỗ trợ nhập học",
  [LeadNeedSubtype.FINANCIAL_SUPPORT]: "Hỗ trợ tài chính",
  [LeadNeedSubtype.PARENT_ENGAGEMENT]: "Tương tác phụ huynh",
  [LeadNeedSubtype.PARENT_COUNSELING]: "Tư vấn phụ huynh",
  [LeadNeedSubtype.RE_ENGAGEMENT]: "Tái kết nối",
  [LeadNeedSubtype.NO_RESPONSE]: "Không phản hồi",
  [LeadNeedSubtype.NOT_READY]: "Chưa sẵn sàng",
};

export enum TagCategory {
  ATTENTION = "ATTENTION",
  RELATIONSHIP = "RELATIONSHIP",
  CONTEXT = "CONTEXT",
  OPERATIONAL = "OPERATIONAL",
}

export const TAG_CATEGORY_LABEL: Record<TagCategory, string> = {
  [TagCategory.ATTENTION]: "Cần chú ý",
  [TagCategory.RELATIONSHIP]: "Quan hệ",
  [TagCategory.CONTEXT]: "Bối cảnh",
  [TagCategory.OPERATIONAL]: "Vận hành",
};

export enum TagSubtype {
  VIP = "VIP",
  HIGH_PRIORITY = "HIGH_PRIORITY",
  SPECIAL_ATTENTION = "SPECIAL_ATTENTION",
  PARENT_INVOLVED = "PARENT_INVOLVED",
  PARENT_DECISION_MAKER = "PARENT_DECISION_MAKER",
  OTHER_DECISION_MAKER = "OTHER_DECISION_MAKER",
  SPECIAL_CASE = "SPECIAL_CASE",
  HARD_TO_REACH = "HARD_TO_REACH",
  SPECIAL_REQUIREMENT = "SPECIAL_REQUIREMENT",
  MANUAL_REVIEW = "MANUAL_REVIEW",
  SPECIAL_HANDLING = "SPECIAL_HANDLING",
  ESCALATED = "ESCALATED",
}

export const TAG_CATEGORY_SUBTYPES: Record<TagCategory, TagSubtype[]> = {
  [TagCategory.ATTENTION]: [
    TagSubtype.VIP,
    TagSubtype.HIGH_PRIORITY,
    TagSubtype.SPECIAL_ATTENTION,
  ],
  [TagCategory.RELATIONSHIP]: [
    TagSubtype.PARENT_INVOLVED,
    TagSubtype.PARENT_DECISION_MAKER,
    TagSubtype.OTHER_DECISION_MAKER,
  ],
  [TagCategory.CONTEXT]: [
    TagSubtype.SPECIAL_CASE,
    TagSubtype.HARD_TO_REACH,
    TagSubtype.SPECIAL_REQUIREMENT,
  ],
  [TagCategory.OPERATIONAL]: [
    TagSubtype.MANUAL_REVIEW,
    TagSubtype.SPECIAL_HANDLING,
    TagSubtype.ESCALATED,
  ],
};

export const TAG_SUBTYPE_LABEL: Record<TagSubtype, string> = {
  [TagSubtype.VIP]: "Ưu tiên đặc biệt",
  [TagSubtype.HIGH_PRIORITY]: "Ưu tiên cao",
  [TagSubtype.SPECIAL_ATTENTION]: "Cần quan tâm đặc biệt",
  [TagSubtype.PARENT_INVOLVED]: "Phụ huynh tham gia",
  [TagSubtype.PARENT_DECISION_MAKER]: "Phụ huynh quyết định",
  [TagSubtype.OTHER_DECISION_MAKER]: "Người khác quyết định",
  [TagSubtype.SPECIAL_CASE]: "Trường hợp đặc biệt",
  [TagSubtype.HARD_TO_REACH]: "Khó liên hệ",
  [TagSubtype.SPECIAL_REQUIREMENT]: "Yêu cầu đặc biệt",
  [TagSubtype.MANUAL_REVIEW]: "Cần rà soát thủ công",
  [TagSubtype.SPECIAL_HANDLING]: "Xử lý đặc biệt",
  [TagSubtype.ESCALATED]: "Đã leo thang",
};
