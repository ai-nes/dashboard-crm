"use client";
import { Input } from "@/components/tailgrids/core/input";
import type {
  RecordExportField,
  RecordExportCondition,
} from "@/services/api/record-export/types";
import { RecordExportSelect } from "./record-export-select";
export function RecordExportConditionValue({
  field,
  condition,
  index,
  onChange,
}: {
  field?: RecordExportField;
  condition: RecordExportCondition;
  index: number;
  onChange: (condition: RecordExportCondition) => void;
}) {
  if (!field || ["empty", "not_empty"].includes(condition.operator))
    return <p className="text-sm text-text-tertiary">Không cần nhập giá trị</p>;
  if (field.options || field.type === "boolean")
    return (
      <RecordExportSelect
        label={`Giá trị điều kiện ${index + 1}`}
        triggerClassName="h-11 bg-card-surface-area"
        value={String(condition.value ?? "")}
        options={
          field.options ?? [
            { value: "true", label: "Có" },
            { value: "false", label: "Không" },
          ]
        }
        onChange={(value) =>
          onChange({
            ...condition,
            value: field.type === "boolean" ? value === "true" : value,
          })
        }
      />
    );
  const type =
    field.type === "number"
      ? "number"
      : field.type === "date" || field.type === "datetime"
        ? "date"
        : "text";
  return (
    <div className="flex min-w-0 gap-2">
      <Input
        aria-label={`Giá trị điều kiện ${index + 1}`}
        type={type}
        step={type === "number" ? (field.integer ? "1" : "any") : undefined}
        maxLength={2000}
        value={String(condition.value ?? "")}
        onChange={(event) =>
          onChange({ ...condition, value: event.target.value })
        }
        className="h-11 min-w-0 w-full bg-card-surface-area"
      />
      {condition.operator === "between" && (
        <Input
          aria-label={`Giá trị kết thúc điều kiện ${index + 1}`}
          type={type}
          step={type === "number" ? (field.integer ? "1" : "any") : undefined}
          value={String(condition.valueTo ?? "")}
          onChange={(event) =>
            onChange({ ...condition, valueTo: event.target.value })
          }
          className="h-11 min-w-0 w-full bg-card-surface-area"
        />
      )}
    </div>
  );
}
