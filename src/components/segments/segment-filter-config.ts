export enum SegmentFilterCategory {
  ADMISSION_STAGE = "ADMISSION_STAGE",
}

export const SEGMENT_FILTER_CATEGORY_LABEL: Record<
  SegmentFilterCategory,
  string
> = {
  [SegmentFilterCategory.ADMISSION_STAGE]: "Giai đoạn tuyển sinh",
};

export enum StudentSegmentProperty {
  JOURNEY_STAGE = "JOURNEY_STAGE",
  POTENTIAL = "POTENTIAL",
  INTENT = "INTENT",
  NEED = "NEED",
  TAG = "TAG",
}

export const STUDENT_SEGMENT_PROPERTY_LABEL: Record<
  StudentSegmentProperty,
  string
> = {
  [StudentSegmentProperty.JOURNEY_STAGE]: "Giai đoạn tuyển sinh",
  [StudentSegmentProperty.POTENTIAL]: "Tiềm năng",
  [StudentSegmentProperty.INTENT]: "Ý định",
  [StudentSegmentProperty.NEED]: "Nhu cầu",
  [StudentSegmentProperty.TAG]: "Thẻ",
};

export enum SegmentOperator {
  IS_ANY_OF = "IS_ANY_OF",
  IS_NONE_OF = "IS_NONE_OF",
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN = "LESS_THAN",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  BETWEEN = "BETWEEN",
  BEFORE = "BEFORE",
  AFTER = "AFTER",
  IS_KNOWN = "IS_KNOWN",
  IS_UNKNOWN = "IS_UNKNOWN",
}

export const SEGMENT_OPERATOR_LABEL: Record<SegmentOperator, string> = {
  [SegmentOperator.IS_ANY_OF]: "Là một trong",
  [SegmentOperator.IS_NONE_OF]: "Không thuộc",
  [SegmentOperator.EQUAL]: "Bằng",
  [SegmentOperator.NOT_EQUAL]: "Không bằng",
  [SegmentOperator.GREATER_THAN]: "Lớn hơn",
  [SegmentOperator.GREATER_THAN_OR_EQUAL]: "Lớn hơn hoặc bằng",
  [SegmentOperator.LESS_THAN]: "Nhỏ hơn",
  [SegmentOperator.LESS_THAN_OR_EQUAL]: "Nhỏ hơn hoặc bằng",
  [SegmentOperator.BETWEEN]: "Trong khoảng",
  [SegmentOperator.BEFORE]: "Trước",
  [SegmentOperator.AFTER]: "Sau",
  [SegmentOperator.IS_KNOWN]: "Đã có dữ liệu",
  [SegmentOperator.IS_UNKNOWN]: "Chưa có dữ liệu",
};

/**
 * IS_ANY_OF/IS_NONE_OF read as "là một trong" / "không thuộc" by default,
 * which doesn't fit every property's grammar (a journey stage is one of
 * several "giai đoạn", a level like tiềm năng/ý định is "ở mức", a need or
 * tag is one of several "nhu cầu"/"thẻ"). This overrides the phrasing per
 * property so the built sentence reads naturally in Vietnamese.
 */
const PROPERTY_OPERATOR_PHRASE: Partial<
  Record<StudentSegmentProperty, Partial<Record<SegmentOperator, string>>>
> = {
  [StudentSegmentProperty.JOURNEY_STAGE]: {
    [SegmentOperator.IS_ANY_OF]: "Là một trong những giai đoạn",
    [SegmentOperator.IS_NONE_OF]: "Không thuộc những giai đoạn",
  },
  [StudentSegmentProperty.POTENTIAL]: {
    [SegmentOperator.IS_ANY_OF]: "Ở mức",
    [SegmentOperator.IS_NONE_OF]: "Không ở mức",
  },
  [StudentSegmentProperty.INTENT]: {
    [SegmentOperator.IS_ANY_OF]: "Ở mức",
    [SegmentOperator.IS_NONE_OF]: "Không ở mức",
  },
  [StudentSegmentProperty.NEED]: {
    [SegmentOperator.IS_ANY_OF]: "Là một trong những nhu cầu",
    [SegmentOperator.IS_NONE_OF]: "Không thuộc những nhu cầu",
  },
  [StudentSegmentProperty.TAG]: {
    [SegmentOperator.IS_ANY_OF]: "Là một trong những thẻ",
    [SegmentOperator.IS_NONE_OF]: "Không thuộc những thẻ",
  },
};

export function getOperatorLabel(
  property: StudentSegmentProperty,
  operator: SegmentOperator,
): string {
  return (
    PROPERTY_OPERATOR_PHRASE[property]?.[operator] ??
    SEGMENT_OPERATOR_LABEL[operator]
  );
}

export enum JourneyStage {
  NEW = "NEW",
  ATTEMPTING = "ATTEMPTING",
  CONNECTED = "CONNECTED",
  QUALIFIED = "QUALIFIED",
  DISQUALIFIED = "DISQUALIFIED",
}

export const JOURNEY_STAGE_LABEL: Record<JourneyStage, string> = {
  [JourneyStage.NEW]: "Mới",
  [JourneyStage.ATTEMPTING]: "Đang liên hệ",
  [JourneyStage.CONNECTED]: "Đã kết nối",
  [JourneyStage.QUALIFIED]: "Đủ điều kiện",
  [JourneyStage.DISQUALIFIED]: "Không đủ điều kiện",
};

export enum SegmentLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export const SEGMENT_LEVEL_LABEL: Record<SegmentLevel, string> = {
  [SegmentLevel.LOW]: "Thấp",
  [SegmentLevel.MEDIUM]: "Trung bình",
  [SegmentLevel.HIGH]: "Cao",
};

export interface SegmentOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Top-level lead-need categories. The filter only exposes these categories —
 * the underlying granular need sub-types (e.g. FIRST_CONTACT, CALLBACK under
 * NEED_CONTACT) are matched against downstream, at search time, via
 * NEED_CATEGORY_SUBTYPES.
 */
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

/**
 * Maps each lead-need category to its granular sub-types, so downstream
 * search/matching can resolve a selected category (as shown in the filter)
 * to the actual need values recorded on a lead.
 */
export const NEED_CATEGORY_SUBTYPES: Record<LeadNeedCategory, LeadNeedSubtype[]> = {
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

/**
 * Top-level lead-tag categories. Same shape as LeadNeedCategory: the filter
 * only exposes these categories, the granular tags underneath are matched
 * downstream via TAG_CATEGORY_SUBTYPES.
 */
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

export const JOURNEY_STAGE_OPTIONS: SegmentOption[] = Object.values(
  JourneyStage,
).map((value) => ({
  value,
  label: JOURNEY_STAGE_LABEL[value],
}));

export const SEGMENT_LEVEL_OPTIONS: SegmentOption[] = Object.values(
  SegmentLevel,
).map((value) => ({
  value,
  label: SEGMENT_LEVEL_LABEL[value],
}));

export const LEAD_NEED_CATEGORY_OPTIONS: SegmentOption[] = Object.values(
  LeadNeedCategory,
).map((value) => ({
  value,
  label: LEAD_NEED_CATEGORY_LABEL[value],
}));

export const TAG_CATEGORY_OPTIONS: SegmentOption[] = Object.values(
  TagCategory,
).map((value) => ({
  value,
  label: TAG_CATEGORY_LABEL[value],
}));

/**
 * Properties whose filter value is chosen in two steps: pick a top-level
 * category (shown directly in the property picker), then pick from the
 * granular sub-items scoped to that category (shown in the value picker).
 * NEED and TAG both follow this shape — this table drives the picker, the
 * condition row, and the value resolution generically for both.
 */
export interface CascadingPropertyConfig {
  categoryOptions: SegmentOption[];
  categoryLabel: Record<string, string>;
  subtypesByCategory: Record<string, SegmentOption[]>;
}

function buildSubtypesByCategory<Category extends string, Subtype extends string>(
  categorySubtypes: Record<Category, Subtype[]>,
  subtypeLabel: Record<Subtype, string>,
): Record<string, SegmentOption[]> {
  return Object.fromEntries(
    Object.entries(categorySubtypes).map(([category, subtypes]) => [
      category,
      (subtypes as Subtype[]).map((value) => ({
        value,
        label: subtypeLabel[value],
      })),
    ]),
  );
}

export const CASCADING_PROPERTY_CONFIG: Partial<
  Record<StudentSegmentProperty, CascadingPropertyConfig>
> = {
  [StudentSegmentProperty.NEED]: {
    categoryOptions: LEAD_NEED_CATEGORY_OPTIONS,
    categoryLabel: LEAD_NEED_CATEGORY_LABEL,
    subtypesByCategory: buildSubtypesByCategory(
      NEED_CATEGORY_SUBTYPES,
      LEAD_NEED_SUBTYPE_LABEL,
    ),
  },
  [StudentSegmentProperty.TAG]: {
    categoryOptions: TAG_CATEGORY_OPTIONS,
    categoryLabel: TAG_CATEGORY_LABEL,
    subtypesByCategory: buildSubtypesByCategory(
      TAG_CATEGORY_SUBTYPES,
      TAG_SUBTYPE_LABEL,
    ),
  },
};

export const CASCADING_PROPERTIES = Object.keys(
  CASCADING_PROPERTY_CONFIG,
) as StudentSegmentProperty[];

export function isCascadingProperty(property: StudentSegmentProperty) {
  return property in CASCADING_PROPERTY_CONFIG;
}

export function getCascadingSubtypeOptions(
  property: StudentSegmentProperty,
  category: string | null | undefined,
): SegmentOption[] {
  if (!category) return [];
  return CASCADING_PROPERTY_CONFIG[property]?.subtypesByCategory[category] ?? [];
}

export type SegmentValueType = "MULTI_SELECT" | "NUMBER" | "YEAR" | "PRESENCE";

export interface SegmentPropertyConfig {
  label: string;
  category: SegmentFilterCategory;
  valueType: SegmentValueType;
  operators: SegmentOperator[];
}

const PRESENCE_OPERATORS = [
  SegmentOperator.IS_KNOWN,
  SegmentOperator.IS_UNKNOWN,
];
const MULTI_SELECT_OPERATORS = [
  SegmentOperator.IS_ANY_OF,
  SegmentOperator.IS_NONE_OF,
  ...PRESENCE_OPERATORS,
];

export const SEGMENT_PROPERTY_CONFIG: Record<
  StudentSegmentProperty,
  SegmentPropertyConfig
> = {
  [StudentSegmentProperty.JOURNEY_STAGE]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.JOURNEY_STAGE],
    category: SegmentFilterCategory.ADMISSION_STAGE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.POTENTIAL]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.POTENTIAL],
    category: SegmentFilterCategory.ADMISSION_STAGE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.INTENT]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.INTENT],
    category: SegmentFilterCategory.ADMISSION_STAGE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.NEED]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.NEED],
    category: SegmentFilterCategory.ADMISSION_STAGE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.TAG]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.TAG],
    category: SegmentFilterCategory.ADMISSION_STAGE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
};

export const MOCK_SEGMENT_MASTER_OPTIONS: Record<
  StudentSegmentProperty,
  SegmentOption[]
> = {
  [StudentSegmentProperty.JOURNEY_STAGE]: JOURNEY_STAGE_OPTIONS,
  [StudentSegmentProperty.POTENTIAL]: SEGMENT_LEVEL_OPTIONS,
  [StudentSegmentProperty.INTENT]: SEGMENT_LEVEL_OPTIONS,
  [StudentSegmentProperty.NEED]: LEAD_NEED_CATEGORY_OPTIONS,
  [StudentSegmentProperty.TAG]: TAG_CATEGORY_OPTIONS,
};

export const SEGMENT_FILTER_CATEGORIES = Object.values(SegmentFilterCategory);
export const SEGMENT_PROPERTIES = Object.values(StudentSegmentProperty);

export type SegmentConditionValue = string[] | string | null;

export interface SegmentCondition {
  id: string;
  property: StudentSegmentProperty;
  operator: SegmentOperator;
  value: SegmentConditionValue;
  /** Only used for cascading properties (NEED, TAG): the chosen top-level category. */
  category?: string | null;
}

export interface SegmentFilterGroup {
  id: string;
  name: string;
  logic: "AND" | "OR";
  conditions: SegmentCondition[];
}

export function isConditionComplete(condition: SegmentCondition): boolean {
  if (isPresenceOperator(condition.operator)) return true;
  if (isCascadingProperty(condition.property))
    return (
      Boolean(condition.category) &&
      Array.isArray(condition.value) &&
      condition.value.length > 0
    );
  if (SEGMENT_PROPERTY_CONFIG[condition.property].valueType === "MULTI_SELECT")
    return Array.isArray(condition.value) && condition.value.length > 0;
  const values = Array.isArray(condition.value)
    ? condition.value
    : [condition.value];
  if (condition.operator === SegmentOperator.BETWEEN && values.length !== 2)
    return false;
  if (
    !values.every(
      (value) =>
        typeof value === "string" &&
        value.trim() !== "" &&
        Number.isFinite(Number(value)),
    )
  )
    return false;
  if (
    SEGMENT_PROPERTY_CONFIG[condition.property].valueType === "YEAR" &&
    !values.every(
      (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    )
  )
    return false;
  return (
    condition.operator !== SegmentOperator.BETWEEN ||
    Number(values[0]) <= Number(values[1])
  );
}

export function conditionValueLabel(condition: SegmentCondition): string {
  if (isPresenceOperator(condition.operator)) return "";
  if (isCascadingProperty(condition.property)) {
    const options = getCascadingSubtypeOptions(
      condition.property,
      condition.category,
    );
    return (Array.isArray(condition.value) ? condition.value : [])
      .map(
        (value) =>
          options.find((option) => option.value === value)?.label ?? value,
      )
      .join(", ");
  }
  if (
    SEGMENT_PROPERTY_CONFIG[condition.property].valueType === "MULTI_SELECT"
  ) {
    const options = getOptionsForProperty(condition.property);
    return (Array.isArray(condition.value) ? condition.value : [])
      .map(
        (value) =>
          options.find((option) => option.value === value)?.label ?? value,
      )
      .join(", ");
  }
  return Array.isArray(condition.value)
    ? condition.value.join(" đến ")
    : (condition.value ?? "");
}

export function isPresenceOperator(operator: SegmentOperator) {
  return (
    operator === SegmentOperator.IS_KNOWN ||
    operator === SegmentOperator.IS_UNKNOWN
  );
}

export function getInitialConditionValue(
  property: StudentSegmentProperty,
  operator: SegmentOperator,
): SegmentConditionValue {
  if (isPresenceOperator(operator)) return null;
  if (SEGMENT_PROPERTY_CONFIG[property].valueType === "MULTI_SELECT") return [];
  if (operator === SegmentOperator.BETWEEN) return ["", ""];
  return "";
}

export function getOptionsForProperty(property: StudentSegmentProperty) {
  return MOCK_SEGMENT_MASTER_OPTIONS[property] ?? [];
}
