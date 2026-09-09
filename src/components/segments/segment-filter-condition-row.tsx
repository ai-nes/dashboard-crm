"use client";

import { Close } from "@tailgrids/icons";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import {
  conditionValueLabel,
  getClassificationGroups,
  getInitialConditionValue,
  getOperatorLabel,
  isConditionComplete,
  isClassificationProperty,
  SEGMENT_PROPERTY_CONFIG,
  STUDENT_SEGMENT_PROPERTY_LABEL,
  SegmentOperator,
  type SegmentCondition,
  type SegmentFilterOptions,
  type SegmentOperator as SegmentOperatorType,
  type StudentSegmentProperty,
} from "./segment-filter-config";
import { SegmentFilterConditionValue } from "./segment-filter-condition-value";
import { SegmentFilterPropertyPicker } from "./segment-filter-property-picker";

interface SegmentFilterConditionRowProps {
  condition: SegmentCondition;
  options?: SegmentFilterOptions;
  onChange: (condition: SegmentCondition) => void;
  onRemove: () => void;
}

export function SegmentFilterConditionRow({
  condition,
  options,
  onChange,
  onRemove,
}: SegmentFilterConditionRowProps) {
  const propertyConfig = SEGMENT_PROPERTY_CONFIG[condition.property];
  const [editing, setEditing] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const complete = isConditionComplete(condition);

  useEffect(() => {
    if (!editing || !complete) return;
    const finish = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const owner = target.closest<HTMLElement>("[data-condition-owner]");
      if (
        rowRef.current?.contains(target) ||
        owner?.dataset.conditionOwner === condition.id
      ) {
        return;
      }

      setEditing(false);
    };
    document.addEventListener("pointerdown", finish, true);
    document.addEventListener("focusin", finish);
    return () => {
      document.removeEventListener("pointerdown", finish, true);
      document.removeEventListener("focusin", finish);
    };
  }, [condition.id, editing, complete]);

  const handlePropertyChange = (nextProperty: StudentSegmentProperty) => {
    const nextOperator = SEGMENT_PROPERTY_CONFIG[nextProperty].operators[0];
    onChange({
      ...condition,
      property: nextProperty,
      operator: nextOperator,
      value: getInitialConditionValue(),
      classificationGroupName: undefined,
    });
  };

  const handleOperatorChange = (nextOperator: SegmentOperatorType) => {
    onChange({
      ...condition,
      operator: nextOperator,
      value: getInitialConditionValue(),
    });
  };

  return (
    <div
      ref={rowRef}
      className="flex flex-wrap items-center gap-2 rounded-lg bg-background-gray-secondary p-3"
    >
      {!editing && complete ? (
        <Button
          appearance="ghost"
          className="h-auto min-w-0 flex-1 justify-start whitespace-normal py-2 text-left text-text-primary"
          onPress={() => setEditing(true)}
        >
          <span>
            <strong>
              {STUDENT_SEGMENT_PROPERTY_LABEL[condition.property]}
            </strong>{" "}
            <span className="font-normal">
              {getOperatorLabel(
                condition.property,
                condition.operator,
              ).toLocaleLowerCase("vi-VN")}
            </span>{" "}
            <strong>{conditionValueLabel(condition, options)}</strong>
          </span>
        </Button>
      ) : (
        <>
          <SegmentFilterPropertyPicker
            options={options}
            ownerId={condition.id}
            triggerLabel={getConditionPropertyLabel(condition, options)}
            showPlus={false}
            selectedProperty={condition.property}
            selectedValues={
              Array.isArray(condition.value) ? condition.value : []
            }
            selectedGroupName={condition.classificationGroupName}
            onSelect={(nextProperty, values, groupName) =>
              values
                ? onChange({
                    ...condition,
                    property: nextProperty,
                    operator:
                      SEGMENT_PROPERTY_CONFIG[nextProperty].operators[0],
                    value: values,
                    classificationGroupName: groupName,
                  })
                : handlePropertyChange(nextProperty)
            }
            className="h-11 min-w-40 flex-1"
          />

          <Select
            aria-label="Toán tử"
            value={condition.operator}
            onChange={(nextOperator) =>
              handleOperatorChange(nextOperator as SegmentOperator)
            }
            className="min-w-40 flex-1"
          >
            <SelectTrigger
              size="lg"
              className="h-11 w-full bg-card-surface-area text-left"
            >
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent data-condition-owner={condition.id}>
              {propertyConfig.operators.map((operator) => {
                const label = getOperatorLabel(condition.property, operator);
                return (
                  <SelectItem key={operator} id={operator} textValue={label}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <SegmentFilterConditionValue
            ownerId={condition.id}
            property={condition.property}
            operator={condition.operator}
            value={condition.value}
            classificationGroupName={condition.classificationGroupName}
            options={options}
            onChange={(value) => onChange({ ...condition, value })}
          />
        </>
      )}

      <Button
        variant="primary"
        appearance="ghost"
        iconOnly
        size="sm"
        aria-label="Xóa điều kiện"
        className="self-end text-text-secondary hover:bg-card-surface-area hover:text-text-primary md:self-auto"
        onPress={onRemove}
      >
        <Close size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}

function getConditionPropertyLabel(
  condition: SegmentCondition,
  options?: SegmentFilterOptions,
): string {
  if (!isClassificationProperty(condition.property)) {
    return STUDENT_SEGMENT_PROPERTY_LABEL[condition.property];
  }

  if (condition.classificationGroupName) {
    const selectedGroup = getClassificationGroups(
      condition.property,
      options,
    ).find((group) => group.groupName === condition.classificationGroupName);
    if (selectedGroup) return selectedGroup.label;
  }

  const selectedValues = Array.isArray(condition.value)
    ? new Set(condition.value)
    : new Set<string>();
  const selectedGroup = getClassificationGroups(
    condition.property,
    options,
  ).find(
    (group) =>
      group.options.length > 0 &&
      group.options.every((option) => selectedValues.has(option.value)),
  );

  return (
    selectedGroup?.label ?? STUDENT_SEGMENT_PROPERTY_LABEL[condition.property]
  );
}
