"use client";

import {
  getOptionsForProperty,
  SEGMENT_PROPERTY_CONFIG,
  STUDENT_SEGMENT_PROPERTY_LABEL,
  type SegmentConditionValue,
  type SegmentFilterOptions,
  type SegmentOperator,
  type StudentSegmentProperty,
} from "./segment-filter-config";
import { SegmentFilterValuePicker } from "./segment-filter-value-picker";

interface SegmentFilterConditionValueProps {
  ownerId: string;
  property: StudentSegmentProperty;
  operator: SegmentOperator;
  value: SegmentConditionValue;
  classificationGroupName?: string;
  options?: SegmentFilterOptions;
  onChange: (value: SegmentConditionValue) => void;
}

export function SegmentFilterConditionValue({
  ownerId,
  property,
  value,
  classificationGroupName,
  options,
  onChange,
}: SegmentFilterConditionValueProps) {
  if (SEGMENT_PROPERTY_CONFIG[property].valueType !== "MULTI_SELECT") {
    return null;
  }

  return (
    <SegmentFilterValuePicker
      ownerId={ownerId}
      label={STUDENT_SEGMENT_PROPERTY_LABEL[property]}
      options={getOptionsForProperty(property, options)}
      value={value}
      selectedGroupName={classificationGroupName}
      onChange={(nextValue) => onChange(nextValue)}
    />
  );
}
