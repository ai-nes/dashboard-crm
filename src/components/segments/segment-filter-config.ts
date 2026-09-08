export enum SegmentFilterCategory {
  STUDENT_PROFILE = "STUDENT_PROFILE",
  SOURCE = "SOURCE",
  ACADEMIC = "ACADEMIC",
  SCORING_STATUS = "SCORING_STATUS",
}

export const SEGMENT_FILTER_CATEGORY_LABEL: Record<
  SegmentFilterCategory,
  string
> = {
  [SegmentFilterCategory.STUDENT_PROFILE]: "Thông tin thí sinh",
  [SegmentFilterCategory.SOURCE]: "Nguồn",
  [SegmentFilterCategory.ACADEMIC]: "Học tập",
  [SegmentFilterCategory.SCORING_STATUS]: "Điểm & trạng thái",
};

export enum StudentSegmentProperty {
  HIGH_SCHOOL = "HIGH_SCHOOL",
  PROVINCE_AREA = "PROVINCE_AREA",
  YEAR_OF_BIRTH = "YEAR_OF_BIRTH",
  PROGRAM_INTEREST = "PROGRAM_INTEREST",
  PARENT_INFORMATION = "PARENT_INFORMATION",
  SOURCE = "SOURCE",
  ACADEMIC_SCORE = "ACADEMIC_SCORE",
  LEAD_SCORE = "LEAD_SCORE",
  JOURNEY_STAGE = "JOURNEY_STAGE",
}

export const STUDENT_SEGMENT_PROPERTY_LABEL: Record<
  StudentSegmentProperty,
  string
> = {
  [StudentSegmentProperty.HIGH_SCHOOL]: "Trường THPT",
  [StudentSegmentProperty.PROVINCE_AREA]: "Tỉnh / Khu vực",
  [StudentSegmentProperty.YEAR_OF_BIRTH]: "Năm sinh",
  [StudentSegmentProperty.PROGRAM_INTEREST]: "Ngành quan tâm",
  [StudentSegmentProperty.PARENT_INFORMATION]: "Thông tin phụ huynh",
  [StudentSegmentProperty.SOURCE]: "Nguồn",
  [StudentSegmentProperty.ACADEMIC_SCORE]: "Điểm học tập / GPA",
  [StudentSegmentProperty.LEAD_SCORE]: "Điểm Lead",
  [StudentSegmentProperty.JOURNEY_STAGE]: "Trạng thái Lead",
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
const NUMBER_OPERATORS = [
  SegmentOperator.EQUAL,
  SegmentOperator.NOT_EQUAL,
  SegmentOperator.GREATER_THAN,
  SegmentOperator.GREATER_THAN_OR_EQUAL,
  SegmentOperator.LESS_THAN,
  SegmentOperator.LESS_THAN_OR_EQUAL,
  SegmentOperator.BETWEEN,
  ...PRESENCE_OPERATORS,
];

export const SEGMENT_PROPERTY_CONFIG: Record<
  StudentSegmentProperty,
  SegmentPropertyConfig
> = {
  [StudentSegmentProperty.HIGH_SCHOOL]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.HIGH_SCHOOL],
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.PROVINCE_AREA]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.PROVINCE_AREA],
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.YEAR_OF_BIRTH]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.YEAR_OF_BIRTH],
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "YEAR",
    operators: [
      SegmentOperator.EQUAL,
      SegmentOperator.NOT_EQUAL,
      SegmentOperator.BEFORE,
      SegmentOperator.AFTER,
      SegmentOperator.BETWEEN,
      ...PRESENCE_OPERATORS,
    ],
  },
  [StudentSegmentProperty.PROGRAM_INTEREST]: {
    label:
      STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.PROGRAM_INTEREST],
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.PARENT_INFORMATION]: {
    label:
      STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.PARENT_INFORMATION],
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "PRESENCE",
    operators: PRESENCE_OPERATORS,
  },
  [StudentSegmentProperty.SOURCE]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.SOURCE],
    category: SegmentFilterCategory.SOURCE,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
  [StudentSegmentProperty.ACADEMIC_SCORE]: {
    label:
      STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.ACADEMIC_SCORE],
    category: SegmentFilterCategory.ACADEMIC,
    valueType: "NUMBER",
    operators: NUMBER_OPERATORS,
  },
  [StudentSegmentProperty.LEAD_SCORE]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.LEAD_SCORE],
    category: SegmentFilterCategory.SCORING_STATUS,
    valueType: "NUMBER",
    operators: NUMBER_OPERATORS,
  },
  [StudentSegmentProperty.JOURNEY_STAGE]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.JOURNEY_STAGE],
    category: SegmentFilterCategory.SCORING_STATUS,
    valueType: "MULTI_SELECT",
    operators: MULTI_SELECT_OPERATORS,
  },
};

export interface SegmentOption {
  value: string;
  label: string;
  description?: string;
}

export const JOURNEY_STAGE_OPTIONS: SegmentOption[] = Object.values(
  JourneyStage,
).map((value) => ({
  value,
  label: JOURNEY_STAGE_LABEL[value],
}));

/**
 * Temporary master-data fixtures for the builder UI. These lists should be
 * replaced by the corresponding API/master-data query when it is available.
 */
export const MOCK_SEGMENT_MASTER_OPTIONS: Partial<
  Record<StudentSegmentProperty, SegmentOption[]>
> = {
  [StudentSegmentProperty.HIGH_SCHOOL]: [
    { value: "LE_HONG_PHONG", label: "THPT chuyên Lê Hồng Phong" },
    { value: "NGUYEN_THUONG_HIEN", label: "THPT Nguyễn Thượng Hiền" },
    { value: "TRAN_DAI_NGHIA", label: "THPT chuyên Trần Đại Nghĩa" },
    { value: "OTHER_HIGH_SCHOOL", label: "Trường THPT khác" },
  ],
  [StudentSegmentProperty.PROVINCE_AREA]: [
    { value: "HO_CHI_MINH", label: "TP. Hồ Chí Minh" },
    { value: "HA_NOI", label: "Hà Nội" },
    { value: "DONG_NAI", label: "Đồng Nai" },
    { value: "BINH_DUONG", label: "Bình Dương" },
  ],
  [StudentSegmentProperty.PROGRAM_INTEREST]: [
    { value: "SOFTWARE_ENGINEERING", label: "Kỹ thuật phần mềm" },
    { value: "COMPUTER_SCIENCE", label: "Khoa học máy tính" },
    { value: "BUSINESS_ADMINISTRATION", label: "Quản trị kinh doanh" },
    { value: "DIGITAL_MARKETING", label: "Marketing số" },
  ],
  [StudentSegmentProperty.SOURCE]: [
    { value: "OPEN_DAY", label: "Ngày hội Open Day" },
    { value: "WEBSITE", label: "Website" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "REFERRAL", label: "Giới thiệu" },
  ],
  [StudentSegmentProperty.JOURNEY_STAGE]: JOURNEY_STAGE_OPTIONS,
};

export const SEGMENT_FILTER_CATEGORIES = Object.values(SegmentFilterCategory);
export const SEGMENT_PROPERTIES = Object.values(StudentSegmentProperty);

export type SegmentConditionValue = string[] | string | null;

export interface SegmentCondition {
  id: string;
  property: StudentSegmentProperty;
  operator: SegmentOperator;
  value: SegmentConditionValue;
}

export interface SegmentFilterGroup {
  id: string;
  name: string;
  logic: "AND" | "OR";
  conditions: SegmentCondition[];
}

export function isConditionComplete(condition: SegmentCondition): boolean {
  if (isPresenceOperator(condition.operator)) return true;
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
  return property === StudentSegmentProperty.JOURNEY_STAGE
    ? JOURNEY_STAGE_OPTIONS
    : (MOCK_SEGMENT_MASTER_OPTIONS[property] ?? []);
}
