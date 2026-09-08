"use client";

import { Input } from "@/components/tailgrids/core/input";

import {
  CASCADING_PROPERTY_CONFIG,
  getCascadingSubtypeOptions,
  getOptionsForProperty,
  isCascadingProperty,
  isPresenceOperator,
  SEGMENT_PROPERTY_CONFIG,
  SegmentOperator,
  STUDENT_SEGMENT_PROPERTY_LABEL,
  type SegmentConditionValue,
  type SegmentOperator as SegmentOperatorType,
  type StudentSegmentProperty,
} from "./segment-filter-config";
import { SegmentFilterValuePicker } from "./segment-filter-value-picker";

interface SegmentFilterConditionValueProps {
  ownerId: string;
  property: StudentSegmentProperty;
  operator: SegmentOperatorType;
  value: SegmentConditionValue;
  category?: string | null;
  onChange: (value: SegmentConditionValue) => void;
}

export function SegmentFilterConditionValue({
  ownerId,
  property,
  operator,
  value,
  category,
  onChange,
}: SegmentFilterConditionValueProps) {
  const valueType = SEGMENT_PROPERTY_CONFIG[property].valueType;

  if (isPresenceOperator(operator) || valueType === "PRESENCE") return null;

  if (isCascadingProperty(property)) {
    const categoryLabel = category
      ? CASCADING_PROPERTY_CONFIG[property]!.categoryLabel[category]
      : STUDENT_SEGMENT_PROPERTY_LABEL[property];

    return (
      <SegmentFilterValuePicker
        ownerId={ownerId}
        label={categoryLabel}
        options={getCascadingSubtypeOptions(property, category)}
        value={value}
        onChange={(nextValue) => onChange(nextValue)}
      />
    );
  }

  if (valueType === "MULTI_SELECT") {
    return (
      <SegmentFilterValuePicker
        ownerId={ownerId}
        label={STUDENT_SEGMENT_PROPERTY_LABEL[property]}
        options={getOptionsForProperty(property)}
        value={value}
        onChange={(nextValue) => onChange(nextValue)}
      />
    );
  }

  if (operator === SegmentOperator.BETWEEN) {
    const range = Array.isArray(value) ? value : ["", ""];

    return (
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          aria-label="Giá trị từ"
          value={range[0] ?? ""}
          onChange={(event) => onChange([event.target.value, range[1] ?? ""])}
          placeholder="Từ"
          className="h-11 min-w-0 flex-1 bg-card-surface-area"
        />
        <span className="shrink-0 text-sm text-text-tertiary">đến</span>
        <Input
          type="number"
          inputMode="decimal"
          aria-label="Giá trị đến"
          value={range[1] ?? ""}
          onChange={(event) => onChange([range[0] ?? "", event.target.value])}
          placeholder="Đến"
          className="h-11 min-w-0 flex-1 bg-card-surface-area"
        />
      </div>
    );
  }

  return (
    <Input
      type="number"
      inputMode="decimal"
      aria-label="Giá trị điều kiện"
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={valueType === "YEAR" ? "Nhập năm" : "Nhập giá trị"}
      className="h-11 min-w-0 flex-1 bg-card-surface-area"
    />
  );
}
