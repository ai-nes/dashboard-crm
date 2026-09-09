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
  getInitialConditionValue,
  getOperatorLabel,
  isConditionComplete,
  isCascadingProperty,
  conditionValueLabel,
  CASCADING_PROPERTIES,
  CASCADING_PROPERTY_CONFIG,
  SEGMENT_PROPERTIES,
  SEGMENT_PROPERTY_CONFIG,
  STUDENT_SEGMENT_PROPERTY_LABEL,
  StudentSegmentProperty,
  type SegmentCondition,
  SegmentOperator,
} from "./segment-filter-config";
import { SegmentFilterConditionValue } from "./segment-filter-condition-value";

interface SegmentFilterConditionRowProps {
  condition: SegmentCondition;
  onChange: (condition: SegmentCondition) => void;
  onRemove: () => void;
}

// Cascading properties (NEED, TAG) show their category options nested in the
// property select, so their key encodes both: "<property>:<category>".
function toPropertyKey(condition: SegmentCondition): string {
  return isCascadingProperty(condition.property) && condition.category
    ? `${condition.property}:${condition.category}`
    : condition.property;
}

function fromPropertyKey(
  key: string,
): { property: StudentSegmentProperty; category: string | null } {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex === -1)
    return { property: key as StudentSegmentProperty, category: null };
  return {
    property: key.slice(0, separatorIndex) as StudentSegmentProperty,
    category: key.slice(separatorIndex + 1),
  };
}

export function SegmentFilterConditionRow({
  condition,
  onChange,
  onRemove,
}: SegmentFilterConditionRowProps) {
  const propertyConfig = SEGMENT_PROPERTY_CONFIG[condition.property];
  const displayLabel =
    isCascadingProperty(condition.property) && condition.category
      ? CASCADING_PROPERTY_CONFIG[condition.property]!.categoryLabel[
          condition.category
        ]
      : propertyConfig.label;
  const [editing, setEditing] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const complete = isConditionComplete(condition);

  useEffect(() => {
    if (!editing || !complete) return;
    const finish = (event: Event) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        rowRef.current?.contains(target) ||
        target
          .closest("[data-condition-owner]")
          ?.getAttribute("data-condition-owner") === condition.id
      )
        return;
      setEditing(false);
    };
    document.addEventListener("pointerdown", finish, true);
    document.addEventListener("focusin", finish);
    return () => {
      document.removeEventListener("pointerdown", finish, true);
      document.removeEventListener("focusin", finish);
    };
  }, [editing, complete, condition.id]);

  const handlePropertyChange = (nextKey: string) => {
    const { property: nextProperty, category } = fromPropertyKey(nextKey);
    const nextOperator = SEGMENT_PROPERTY_CONFIG[nextProperty].operators[0];

    onChange({
      ...condition,
      property: nextProperty,
      operator: nextOperator,
      value: getInitialConditionValue(nextProperty, nextOperator),
      category,
    });
  };

  const handleOperatorChange = (nextOperator: SegmentOperator) => {
    onChange({
      ...condition,
      operator: nextOperator,
      value: getInitialConditionValue(condition.property, nextOperator),
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
            <strong>{displayLabel}</strong>{" "}
            <span className="font-normal">
              {getOperatorLabel(
                condition.property,
                condition.operator,
              ).toLocaleLowerCase("vi-VN")}
            </span>{" "}
            <strong>{conditionValueLabel(condition)}</strong>
          </span>
        </Button>
      ) : (
        <>
          <Select
            aria-label="Thuộc tính"
            value={toPropertyKey(condition)}
            onChange={(nextKey) => handlePropertyChange(nextKey as string)}
            className="min-w-40 flex-1"
          >
            <SelectTrigger
              size="lg"
              className="h-11 w-full bg-card-surface-area text-left"
            >
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent
              data-condition-owner={condition.id}
              className="max-h-80"
            >
              {SEGMENT_PROPERTIES.filter(
                (property) => !isCascadingProperty(property),
              ).map((property) => (
                <SelectItem
                  key={property}
                  id={property}
                  textValue={STUDENT_SEGMENT_PROPERTY_LABEL[property]}
                >
                  {STUDENT_SEGMENT_PROPERTY_LABEL[property]}
                </SelectItem>
              ))}
              {CASCADING_PROPERTIES.flatMap((property) =>
                CASCADING_PROPERTY_CONFIG[property]!.categoryOptions.map(
                  (option) => (
                    <SelectItem
                      key={`${property}:${option.value}`}
                      id={`${property}:${option.value}`}
                      textValue={option.label}
                    >
                      {option.label}
                    </SelectItem>
                  ),
                ),
              )}
            </SelectContent>
          </Select>

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
            <SelectContent
              data-condition-owner={condition.id}
              className="max-h-80"
            >
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
            category={condition.category}
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
