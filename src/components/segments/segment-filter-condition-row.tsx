"use client";

import { Close } from "@tailgrids/icons";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectHeader,
  SelectSection,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import {
  getInitialConditionValue,
  isConditionComplete,
  conditionValueLabel,
  SEGMENT_FILTER_CATEGORIES,
  SEGMENT_FILTER_CATEGORY_LABEL,
  SEGMENT_OPERATOR_LABEL,
  SEGMENT_PROPERTIES,
  SEGMENT_PROPERTY_CONFIG,
  STUDENT_SEGMENT_PROPERTY_LABEL,
  type SegmentCondition,
  SegmentOperator,
  type StudentSegmentProperty,
} from "./segment-filter-config";
import { SegmentFilterConditionValue } from "./segment-filter-condition-value";

interface SegmentFilterConditionRowProps {
  condition: SegmentCondition;
  onChange: (condition: SegmentCondition) => void;
  onRemove: () => void;
}

export function SegmentFilterConditionRow({
  condition,
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

  const handlePropertyChange = (nextProperty: StudentSegmentProperty) => {
    const nextOperator = SEGMENT_PROPERTY_CONFIG[nextProperty].operators[0];

    onChange({
      ...condition,
      property: nextProperty,
      operator: nextOperator,
      value: getInitialConditionValue(nextProperty, nextOperator),
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
            <strong>{propertyConfig.label}</strong>{" "}
            <span className="font-normal">
              {SEGMENT_OPERATOR_LABEL[condition.operator].toLocaleLowerCase(
                "vi-VN",
              )}
            </span>{" "}
            <strong>{conditionValueLabel(condition)}</strong>
          </span>
        </Button>
      ) : (
        <>
          <Select
            aria-label="Thuộc tính"
            value={condition.property}
            onChange={(nextProperty) =>
              handlePropertyChange(nextProperty as StudentSegmentProperty)
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
              {SEGMENT_FILTER_CATEGORIES.map((category) => (
                <SelectSection key={category}>
                  <SelectHeader>
                    {SEGMENT_FILTER_CATEGORY_LABEL[category]}
                  </SelectHeader>
                  {SEGMENT_PROPERTIES.filter(
                    (property) =>
                      SEGMENT_PROPERTY_CONFIG[property].category === category,
                  ).map((property) => (
                    <SelectItem
                      key={property}
                      id={property}
                      textValue={STUDENT_SEGMENT_PROPERTY_LABEL[property]}
                    >
                      {STUDENT_SEGMENT_PROPERTY_LABEL[property]}
                    </SelectItem>
                  ))}
                </SelectSection>
              ))}
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
              {propertyConfig.operators.map((operator) => (
                <SelectItem
                  key={operator}
                  id={operator}
                  textValue={SEGMENT_OPERATOR_LABEL[operator]}
                >
                  {SEGMENT_OPERATOR_LABEL[operator]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SegmentFilterConditionValue
            ownerId={condition.id}
            property={condition.property}
            operator={condition.operator}
            value={condition.value}
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
