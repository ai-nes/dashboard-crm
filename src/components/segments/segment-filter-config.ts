import type {
  SegmentFilterLogic,
  SegmentFilterOptionsResponse,
  SegmentFilterPayload,
  SegmentTermRecord,
} from "@/services/api/segments/types";
import { getKnownStudentTagLabel } from "@/services/api/student-classification/tag-labels";
import {
  LEAD_NEED_CATEGORY_LABEL,
  LEAD_NEED_SUBTYPE_LABEL,
  TAG_CATEGORY_LABEL,
  TAG_SUBTYPE_LABEL,
} from "@/services/api/student-classification/classification-types";

export {
  LEAD_NEED_CATEGORY_LABEL,
  LEAD_NEED_SUBTYPE_LABEL,
  NEED_CATEGORY_SUBTYPES,
  LeadNeedCategory,
  LeadNeedSubtype,
  TAG_CATEGORY_LABEL,
  TAG_CATEGORY_SUBTYPES,
  TAG_SUBTYPE_LABEL,
  TagCategory,
  TagSubtype,
} from "@/services/api/student-classification/classification-types";

export type { SegmentFilterLogic } from "@/services/api/segments/types";

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
}

export const SEGMENT_OPERATOR_LABEL: Record<SegmentOperator, string> = {
  [SegmentOperator.IS_ANY_OF]: "Là một trong",
  [SegmentOperator.IS_NONE_OF]: "Không thuộc",
  [SegmentOperator.EQUAL]: "Bằng",
  [SegmentOperator.NOT_EQUAL]: "Không bằng",
};

const PROPERTY_OPERATOR_PHRASE: Partial<
  Record<StudentSegmentProperty, Partial<Record<SegmentOperator, string>>>
> = {
  [StudentSegmentProperty.POTENTIAL]: {
    [SegmentOperator.IS_ANY_OF]: "Ở mức",
    [SegmentOperator.IS_NONE_OF]: "Không ở mức",
  },
  [StudentSegmentProperty.INTENT]: {
    [SegmentOperator.IS_ANY_OF]: "Ở mức",
    [SegmentOperator.IS_NONE_OF]: "Không ở mức",
  },
  [StudentSegmentProperty.JOURNEY_STAGE]: {
    [SegmentOperator.IS_ANY_OF]: "Là một trong những giai đoạn",
    [SegmentOperator.IS_NONE_OF]: "Không thuộc những giai đoạn",
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

export const SEGMENT_LEVEL_BADGE_COLORS: Record<
  SegmentLevel,
  "success" | "warning" | "error"
> = {
  [SegmentLevel.LOW]: "error",
  [SegmentLevel.MEDIUM]: "warning",
  [SegmentLevel.HIGH]: "success",
};

export function getSegmentLevelLabel(value: string | null | undefined): string {
  if (!value) return "Chưa cập nhật";
  return SEGMENT_LEVEL_LABEL[value as SegmentLevel] ?? value;
}

export function getSegmentLevelBadgeColor(
  value: string | null | undefined,
): "success" | "warning" | "error" | "gray" {
  return value && value in SEGMENT_LEVEL_BADGE_COLORS
    ? SEGMENT_LEVEL_BADGE_COLORS[value as SegmentLevel]
    : "gray";
}

export const STUDENT_STAGE_VALUES = [
  "New",
  "Attempting",
  "Connected",
  "Qualified",
  "Disqualified",
] as const;

export const STUDENT_STAGE_LABEL: Record<
  (typeof STUDENT_STAGE_VALUES)[number],
  string
> = {
  New: "Mới",
  Attempting: "Đang liên hệ",
  Connected: "Đã kết nối",
  Qualified: "Đủ điều kiện",
  Disqualified: "Không đủ điều kiện",
};

export type StudentStageValue = (typeof STUDENT_STAGE_VALUES)[number];
export type StudentStageBadgeColor =
  | "sky"
  | "warning"
  | "violet"
  | "success"
  | "gray";

export const STUDENT_STAGE_BADGE_COLORS: Record<
  StudentStageValue,
  StudentStageBadgeColor
> = {
  New: "sky",
  Attempting: "warning",
  Connected: "violet",
  Qualified: "success",
  Disqualified: "gray",
};

export function getStudentStageLabel(value: string | null | undefined): string {
  if (!value) return "Chưa cập nhật";
  return STUDENT_STAGE_LABEL[value as StudentStageValue] ?? value;
}

export function getStudentStageBadgeColor(
  value: string | null | undefined,
): StudentStageBadgeColor {
  return value && value in STUDENT_STAGE_BADGE_COLORS
    ? STUDENT_STAGE_BADGE_COLORS[value as StudentStageValue]
    : "gray";
}

export const STUDENT_STAGE_OPTIONS: SegmentOption[] = STUDENT_STAGE_VALUES.map(
  (value) => ({
    value,
    label: STUDENT_STAGE_LABEL[value],
  }),
);

export interface SegmentOption {
  value: string;
  label: string;
  description?: string;
  groupName?: string;
}

export const CLASSIFICATION_PROPERTIES = [
  StudentSegmentProperty.NEED,
  StudentSegmentProperty.TAG,
] as const;

const CLASSIFICATION_GROUP_LABEL: Record<string, string> = {
  ...LEAD_NEED_CATEGORY_LABEL,
  ...TAG_CATEGORY_LABEL,
};

const CLASSIFICATION_TERM_LABEL: Record<string, string> = {
  "first contact": "Liên hệ lần đầu",
  "follow up": "Theo dõi tiếp",
  callback: "Gọi lại",
  "program information": "Thông tin ngành học",
  "admission information": "Thông tin tuyển sinh",
  "application deadline": "Hạn nộp hồ sơ",
  "application guidance": "Hướng dẫn hồ sơ",
  "application incomplete": "Hồ sơ chưa hoàn tất",
  "document support": "Hỗ trợ giấy tờ",
  "tuition information": "Thông tin học phí",
  "scholarship information": "Thông tin học bổng",
  "major information": "Thông tin ngành học",
  "career information": "Thông tin nghề nghiệp",
  counseling: "Tư vấn",
  "event engagement": "Tham gia sự kiện",
  "campus experience": "Trải nghiệm trường",
  "decision support": "Hỗ trợ ra quyết định",
  "enrollment support": "Hỗ trợ nhập học",
  "financial support": "Hỗ trợ tài chính",
  "re engagement": "Tái kết nối",
  "no response": "Không phản hồi",
  "not ready": "Chưa sẵn sàng",
  "admission requirements": "Điều kiện tuyển sinh",
  "high prior": "Ưu tiên cao",
};

const CONTROLLED_CLASSIFICATION_TERM_LABEL: Record<string, string> = {
  ...LEAD_NEED_SUBTYPE_LABEL,
  ...TAG_SUBTYPE_LABEL,
};

function normalizeClassificationTerm(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function getClassificationTermLabel(term: SegmentTermRecord): string {
  const candidates = [term.label, term.code, term.name].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  for (const candidate of candidates) {
    const normalizedCandidate = candidate
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
    const translated =
      getKnownStudentTagLabel(candidate) ??
      CONTROLLED_CLASSIFICATION_TERM_LABEL[normalizedCandidate] ??
      CLASSIFICATION_TERM_LABEL[normalizeClassificationTerm(candidate)];
    if (translated) return translated;
  }

  return candidates[0] ?? "Chưa đặt tên";
}

export function getClassificationGroupLabel(groupName: string): string {
  return CLASSIFICATION_GROUP_LABEL[groupName] ?? groupName;
}

export function isClassificationProperty(
  property: StudentSegmentProperty,
): boolean {
  return CLASSIFICATION_PROPERTIES.some(
    (classificationProperty) => classificationProperty === property,
  );
}

export type SegmentFilterOptions = Partial<
  Record<StudentSegmentProperty, SegmentOption[]>
>;

export const SEGMENT_LEVEL_OPTIONS: SegmentOption[] = Object.values(
  SegmentLevel,
).map((value) => ({
  value,
  label: SEGMENT_LEVEL_LABEL[value],
}));

export type SegmentValueType = "MULTI_SELECT";

export interface SegmentPropertyConfig {
  label: string;
  valueType: SegmentValueType;
  operators: SegmentOperator[];
}

const LEVEL_OPERATORS = [
  SegmentOperator.IS_ANY_OF,
  SegmentOperator.IS_NONE_OF,
  SegmentOperator.EQUAL,
  SegmentOperator.NOT_EQUAL,
];
const TERM_OPERATORS = [SegmentOperator.IS_ANY_OF, SegmentOperator.IS_NONE_OF];
const STAGE_OPERATORS = LEVEL_OPERATORS;

export const SEGMENT_PROPERTY_CONFIG: Record<
  StudentSegmentProperty,
  SegmentPropertyConfig
> = {
  [StudentSegmentProperty.JOURNEY_STAGE]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.JOURNEY_STAGE],
    valueType: "MULTI_SELECT",
    operators: STAGE_OPERATORS,
  },
  [StudentSegmentProperty.POTENTIAL]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.POTENTIAL],
    valueType: "MULTI_SELECT",
    operators: LEVEL_OPERATORS,
  },
  [StudentSegmentProperty.INTENT]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.INTENT],
    valueType: "MULTI_SELECT",
    operators: LEVEL_OPERATORS,
  },
  [StudentSegmentProperty.NEED]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.NEED],
    valueType: "MULTI_SELECT",
    operators: TERM_OPERATORS,
  },
  [StudentSegmentProperty.TAG]: {
    label: STUDENT_SEGMENT_PROPERTY_LABEL[StudentSegmentProperty.TAG],
    valueType: "MULTI_SELECT",
    operators: TERM_OPERATORS,
  },
};

const DEFAULT_OPTIONS: SegmentFilterOptions = {
  [StudentSegmentProperty.JOURNEY_STAGE]: STUDENT_STAGE_OPTIONS,
  [StudentSegmentProperty.POTENTIAL]: SEGMENT_LEVEL_OPTIONS,
  [StudentSegmentProperty.INTENT]: SEGMENT_LEVEL_OPTIONS,
};

export const SEGMENT_PROPERTIES = Object.values(StudentSegmentProperty);

export type SegmentConditionValue = string[] | string | null;

export interface SegmentCondition {
  id: string;
  property: StudentSegmentProperty;
  operator: SegmentOperator;
  value: SegmentConditionValue;
  /** UI-only scope used while a classification group awaits term selection. */
  classificationGroupName?: string;
}

export interface SegmentFilterGroup {
  id: string;
  name: string;
  logic: SegmentFilterLogic;
  conditions: SegmentCondition[];
}

export function getOptionsForProperty(
  property: StudentSegmentProperty,
  options: SegmentFilterOptions = {},
): SegmentOption[] {
  return options[property] ?? DEFAULT_OPTIONS[property] ?? [];
}

export interface ClassificationGroup {
  groupName: string;
  label: string;
  options: SegmentOption[];
}

export function getClassificationGroups(
  property: StudentSegmentProperty,
  options: SegmentFilterOptions = {},
): ClassificationGroup[] {
  if (!isClassificationProperty(property)) return [];

  const groups = new Map<string, SegmentOption[]>();
  for (const option of getOptionsForProperty(property, options)) {
    const groupName = option.groupName || "Khác";
    const group = groups.get(groupName) ?? [];
    group.push(option);
    groups.set(groupName, group);
  }

  return [...groups.entries()].map(([groupName, groupOptions]) => ({
    groupName,
    label: getClassificationGroupLabel(groupName),
    options: groupOptions,
  }));
}

export function getOptionsForSelectedClassificationGroup(
  selectedValues: string[],
  options: SegmentOption[],
  selectedGroupName?: string,
): SegmentOption[] {
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );
  const activeGroupName = selectedGroupName ?? selectedOptions[0]?.groupName;

  if (
    !activeGroupName ||
    (!selectedGroupName &&
      selectedOptions.some((option) => option.groupName !== activeGroupName))
  ) {
    return options;
  }

  const groupOptions = options.filter(
    (option) => option.groupName === activeGroupName,
  );
  return groupOptions.length > 0 ? groupOptions : options;
}

const API_FIELD_BY_PROPERTY: Record<StudentSegmentProperty, string> = {
  [StudentSegmentProperty.JOURNEY_STAGE]: "student_stage",
  [StudentSegmentProperty.POTENTIAL]: "potential",
  [StudentSegmentProperty.INTENT]: "intent",
  [StudentSegmentProperty.NEED]: "need",
  [StudentSegmentProperty.TAG]: "tag",
};

export function buildSegmentFilterOptions(
  response?: SegmentFilterOptionsResponse,
): SegmentFilterOptions {
  const options: SegmentFilterOptions = {};
  const fields = response?.fields ?? [];

  for (const property of [
    StudentSegmentProperty.JOURNEY_STAGE,
    StudentSegmentProperty.POTENTIAL,
    StudentSegmentProperty.INTENT,
  ]) {
    const field = fields.find(
      (item) => item.fieldname === API_FIELD_BY_PROPERTY[property],
    );
    const values = field?.options?.split("\n").filter(Boolean) ?? [];
    if (values.length === 0) continue;

    options[property] = values.map((value) => ({
      value,
      label:
        property === StudentSegmentProperty.JOURNEY_STAGE
          ? (STUDENT_STAGE_LABEL[value as keyof typeof STUDENT_STAGE_LABEL] ??
            value)
          : (SEGMENT_LEVEL_LABEL[value as keyof typeof SEGMENT_LEVEL_LABEL] ??
            value),
    }));
  }

  options[StudentSegmentProperty.NEED] = (response?.needs ?? []).map(
    (term) => ({
      value: term.name,
      label: getClassificationTermLabel(term),
      description: term.description ?? undefined,
      groupName: term.group_name ?? undefined,
    }),
  );
  options[StudentSegmentProperty.TAG] = (response?.tags ?? []).map((term) => ({
    value: term.name,
    label: getClassificationTermLabel(term),
    description: term.description ?? undefined,
    groupName: term.group_name ?? undefined,
  }));

  return options;
}

export function isConditionComplete(condition: SegmentCondition): boolean {
  return (
    SEGMENT_PROPERTY_CONFIG[condition.property].valueType === "MULTI_SELECT" &&
    Array.isArray(condition.value) &&
    condition.value.length > 0
  );
}

export function conditionValueLabel(
  condition: SegmentCondition,
  options: SegmentFilterOptions = {},
): string {
  const values = Array.isArray(condition.value) ? condition.value : [];
  const propertyOptions = getOptionsForProperty(condition.property, options);
  return getSelectedOptionLabels(values, propertyOptions).join(", ");
}

export function getSelectedOptionLabels(
  selectedValues: string[],
  options: SegmentOption[],
): string[] {
  const selected = new Set(selectedValues);
  const groupedOptions = new Map<string, SegmentOption[]>();

  for (const option of options) {
    if (!option.groupName) continue;
    const group = groupedOptions.get(option.groupName) ?? [];
    group.push(option);
    groupedOptions.set(option.groupName, group);
  }

  const labels: string[] = [];
  const groupedValues = new Set<string>();
  const renderedGroups = new Set<string>();

  for (const option of options) {
    if (!selected.has(option.value)) continue;

    if (option.groupName) {
      const groupOptions = groupedOptions.get(option.groupName) ?? [];
      const isGroupSelected = groupOptions.every((groupOption) =>
        selected.has(groupOption.value),
      );

      if (isGroupSelected) {
        if (!renderedGroups.has(option.groupName)) {
          labels.push(getClassificationGroupLabel(option.groupName));
          renderedGroups.add(option.groupName);
          groupOptions.forEach((groupOption) =>
            groupedValues.add(groupOption.value),
          );
        }
        continue;
      }
    }

    if (!groupedValues.has(option.value)) labels.push(option.label);
  }

  const knownValues = new Set(options.map((option) => option.value));
  for (const value of selectedValues) {
    if (!knownValues.has(value)) labels.push(value);
  }

  return labels;
}

export function getInitialConditionValue(): SegmentConditionValue {
  return [];
}

function parseSegmentLogic(
  value: unknown,
  fallback: SegmentFilterLogic,
): SegmentFilterLogic {
  return value === "AND" || value === "OR" ? value : fallback;
}

const UI_TO_BACKEND_FIELD: Record<
  StudentSegmentProperty,
  SegmentFilterPayload["groups"][number]["conditions"][number]["field"]
> = {
  [StudentSegmentProperty.JOURNEY_STAGE]: "student_stage",
  [StudentSegmentProperty.POTENTIAL]: "potential",
  [StudentSegmentProperty.INTENT]: "intent",
  [StudentSegmentProperty.NEED]: "need",
  [StudentSegmentProperty.TAG]: "tag",
};

const UI_TO_BACKEND_OPERATOR: Record<
  SegmentOperator,
  SegmentFilterPayload["groups"][number]["conditions"][number]["operator"]
> = {
  [SegmentOperator.IS_ANY_OF]: "in",
  [SegmentOperator.IS_NONE_OF]: "not in",
  [SegmentOperator.EQUAL]: "=",
  [SegmentOperator.NOT_EQUAL]: "!=",
};

const BACKEND_FIELD_TO_UI: Record<string, StudentSegmentProperty> = {
  student_stage: StudentSegmentProperty.JOURNEY_STAGE,
  potential: StudentSegmentProperty.POTENTIAL,
  intent: StudentSegmentProperty.INTENT,
  need: StudentSegmentProperty.NEED,
  tag: StudentSegmentProperty.TAG,
};

const BACKEND_OPERATOR_TO_UI: Record<string, SegmentOperator> = {
  in: SegmentOperator.IS_ANY_OF,
  "not in": SegmentOperator.IS_NONE_OF,
  "=": SegmentOperator.EQUAL,
  "!=": SegmentOperator.NOT_EQUAL,
};

export function toBackendSegmentFilters(
  groups: SegmentFilterGroup[],
  logic: SegmentFilterLogic = "OR",
): SegmentFilterPayload | null {
  if (
    groups.length === 0 ||
    groups.some(
      (group) =>
        group.conditions.length === 0 ||
        group.conditions.some((condition) => !isConditionComplete(condition)),
    )
  ) {
    return null;
  }

  return {
    logic,
    groups: groups.map((group) => ({
      logic: group.logic,
      name: group.name.trim() || undefined,
      conditions: group.conditions.map((condition) => ({
        field: UI_TO_BACKEND_FIELD[condition.property],
        operator: UI_TO_BACKEND_OPERATOR[condition.operator],
        value:
          condition.operator === SegmentOperator.EQUAL ||
          condition.operator === SegmentOperator.NOT_EQUAL
            ? (condition.value as string[])[0]
            : (condition.value as string[]),
      })),
    })),
  };
}

export function fromBackendSegmentFilters(rawFilters: unknown): {
  logic: SegmentFilterLogic;
  groups: SegmentFilterGroup[];
} {
  let filters = rawFilters;
  if (typeof filters === "string") {
    try {
      filters = JSON.parse(filters);
    } catch {
      return { logic: "OR", groups: [] };
    }
  }

  if (!filters || typeof filters !== "object") {
    return { logic: "OR", groups: [] };
  }

  const rawGroups = (filters as { groups?: unknown }).groups;
  if (!Array.isArray(rawGroups)) return { logic: "OR", groups: [] };
  const logic = parseSegmentLogic((filters as { logic?: unknown }).logic, "OR");

  const groups = rawGroups.flatMap((rawGroup, groupIndex) => {
    if (!rawGroup || typeof rawGroup !== "object") return [];
    const rawGroupData = rawGroup as {
      logic?: unknown;
      name?: unknown;
      conditions?: unknown;
    };
    const rawConditions = rawGroupData.conditions;
    if (!Array.isArray(rawConditions)) return [];

    const conditions = rawConditions.flatMap((rawCondition, conditionIndex) => {
      if (!rawCondition || typeof rawCondition !== "object") return [];
      const condition = rawCondition as {
        field?: unknown;
        operator?: unknown;
        value?: unknown;
      };
      const property =
        typeof condition.field === "string"
          ? BACKEND_FIELD_TO_UI[condition.field]
          : undefined;
      const operator =
        typeof condition.operator === "string"
          ? BACKEND_OPERATOR_TO_UI[condition.operator]
          : undefined;
      if (!property || !operator) return [];

      const value = Array.isArray(condition.value)
        ? condition.value.filter(
            (item): item is string => typeof item === "string",
          )
        : typeof condition.value === "string"
          ? [condition.value]
          : [];
      return [
        {
          id: `condition-${groupIndex + 1}-${conditionIndex + 1}`,
          property,
          operator,
          value,
        } satisfies SegmentCondition,
      ];
    });

    return conditions.length
      ? [
          {
            id: `group-${groupIndex + 1}`,
            name:
              typeof rawGroupData.name === "string" && rawGroupData.name.trim()
                ? rawGroupData.name.trim()
                : `Nhóm ${groupIndex + 1}`,
            logic: parseSegmentLogic(rawGroupData.logic, "AND"),
            conditions,
          },
        ]
      : [];
  });

  return { logic, groups };
}
