import { studentListData } from "@/services/api/students/data";
import type { StudentListItem } from "@/services/api/students/types";

import {
  getOptionsForProperty,
  isPresenceOperator,
  SEGMENT_PROPERTY_CONFIG,
  SegmentOperator,
  type SegmentCondition,
  type SegmentFilterGroup,
  type StudentSegmentProperty,
} from "./segment-filter-config";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

function studentJourneyStage(student: StudentListItem) {
  if (student.studentStage) return student.studentStage.toUpperCase();

  return {
    "Quan tâm": "NEW",
    "Tìm hiểu": "ATTEMPTING",
    "Tư vấn": "CONNECTED",
    "Ứng tuyển": "QUALIFIED",
    "Nhập học": "QUALIFIED",
  }[student.stage];
}

function getStudentPropertyValue(
  student: StudentListItem,
  property: StudentSegmentProperty,
) {
  switch (property) {
    case "HIGH_SCHOOL":
      return student.school;
    case "PROVINCE_AREA":
      return student.province;
    case "PROGRAM_INTEREST":
      return student.major;
    case "SOURCE":
      return student.source;
    case "LEAD_SCORE":
      return student.score;
    case "JOURNEY_STAGE":
      return studentJourneyStage(student);
    default:
      return null;
  }
}

function matchesOption(
  studentValue: string,
  property: StudentSegmentProperty,
  selectedValue: string,
) {
  const option = getOptionsForProperty(property).find(
    (item) => item.value === selectedValue,
  );
  const candidate = normalize(studentValue);
  const optionLabel = option ? normalize(option.label) : "";
  const optionValue = normalize(selectedValue.replaceAll("_", " "));

  return (
    candidate.includes(optionLabel) ||
    candidate.includes(optionValue) ||
    optionLabel.includes(candidate)
  );
}

function matchesCondition(
  student: StudentListItem,
  condition: SegmentCondition,
) {
  const studentValue = getStudentPropertyValue(student, condition.property);
  const hasValue = studentValue !== null && String(studentValue).trim() !== "";

  if (isPresenceOperator(condition.operator)) {
    return condition.operator === SegmentOperator.IS_KNOWN
      ? hasValue
      : !hasValue;
  }

  if (!hasValue) return false;

  if (
    SEGMENT_PROPERTY_CONFIG[condition.property].valueType === "MULTI_SELECT"
  ) {
    const selectedValues = Array.isArray(condition.value)
      ? condition.value
      : [];
    const hasSelectedMatch = selectedValues.some((value) =>
      matchesOption(String(studentValue), condition.property, value),
    );
    return condition.operator === SegmentOperator.IS_NONE_OF
      ? !hasSelectedMatch
      : hasSelectedMatch;
  }

  const currentNumber = Number(studentValue);
  const values = (
    Array.isArray(condition.value) ? condition.value : [condition.value]
  ).map(Number);
  if (
    !Number.isFinite(currentNumber) ||
    values.some((value) => !Number.isFinite(value))
  ) {
    return false;
  }

  switch (condition.operator) {
    case SegmentOperator.EQUAL:
      return currentNumber === values[0];
    case SegmentOperator.NOT_EQUAL:
      return currentNumber !== values[0];
    case SegmentOperator.GREATER_THAN:
      return currentNumber > values[0];
    case SegmentOperator.GREATER_THAN_OR_EQUAL:
      return currentNumber >= values[0];
    case SegmentOperator.LESS_THAN:
      return currentNumber < values[0];
    case SegmentOperator.LESS_THAN_OR_EQUAL:
      return currentNumber <= values[0];
    case SegmentOperator.BETWEEN:
      return currentNumber >= values[0] && currentNumber <= values[1];
    case SegmentOperator.BEFORE:
      return currentNumber < values[0];
    case SegmentOperator.AFTER:
      return currentNumber > values[0];
    default:
      return false;
  }
}

function matchesGroup(student: StudentListItem, group: SegmentFilterGroup) {
  const results = group.conditions.map((condition) =>
    matchesCondition(student, condition),
  );
  return group.logic === "OR" ? results.some(Boolean) : results.every(Boolean);
}

export function estimateSegmentSize(
  groups: SegmentFilterGroup[],
  groupLogic: "AND" | "OR",
) {
  if (
    groups.length === 0 ||
    groups.some((group) => group.conditions.length === 0)
  )
    return 0;

  return studentListData.filter((student) => {
    const results = groups.map((group) => matchesGroup(student, group));
    return groupLogic === "OR" ? results.some(Boolean) : results.every(Boolean);
  }).length;
}
