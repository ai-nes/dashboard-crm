"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import type { ConditionFieldMetadata, RuleCondition } from "@/services/api/nba-admin";

interface RuleConditionBuilderProps {
  title: string;
  conditions: RuleCondition[];
  metadata: ConditionFieldMetadata[];
  disabled?: boolean;
  onChange: (conditions: RuleCondition[]) => void;
}

const operatorLabels: Record<string, string> = {
  equals: "Bằng",
  not_equals: "Không bằng",
  in: "Thuộc một trong",
  not_in: "Không thuộc",
  gt: "Lớn hơn",
  gte: "Lớn hơn hoặc bằng",
  lt: "Nhỏ hơn",
  lte: "Nhỏ hơn hoặc bằng",
  is_empty: "Để trống",
  not_empty: "Có giá trị",
};

function displayValue(value: RuleCondition["value"]): string {
  return Array.isArray(value) ? value.join(", ") : value === null || value === undefined ? "" : String(value);
}

function parseValue(value: string, operator: string): RuleCondition["value"] {
  if (operator === "in" || operator === "not_in") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return value;
}

export default function RuleConditionBuilder({ title, conditions, metadata, disabled, onChange }: RuleConditionBuilderProps) {
  const addCondition = () => {
    const first = metadata[0];
    if (!first) return;
    onChange([...conditions, { field: first.field, operator: first.operators[0] ?? "equals", value: first.options?.[0] ?? "" }]);
  };

  const updateCondition = (index: number, change: Partial<RuleCondition>) => {
    onChange(conditions.map((condition, conditionIndex) => conditionIndex === index ? { ...condition, ...change } : condition));
  };

  const updateField = (index: number, field: string) => {
    const selectedField = metadata.find((item) => item.field === field);
    updateCondition(index, {
      field,
      operator: selectedField?.operators[0] ?? "equals",
      value: selectedField?.options?.[0] ?? "",
    });
  };

  return (
    <section className="space-y-3" aria-labelledby={`${title}-conditions-heading`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`${title}-conditions-heading`} className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Trường và phép so sánh được cung cấp từ cấu hình hệ thống.</p>
        </div>
        <Button size="xs" appearance="outline" onPress={addCondition} isDisabled={disabled || metadata.length === 0}>Thêm điều kiện</Button>
      </div>

      <div className="space-y-2 rounded-lg border border-card-border bg-background-gray-secondary_alt p-3">
        {conditions.map((condition, index) => {
          const field = metadata.find((item) => item.field === condition.field);
          const options = field?.options ?? [];
          const isValueFree = condition.operator === "is_empty" || condition.operator === "not_empty";
          const isListOperator = condition.operator === "in" || condition.operator === "not_in";
          return (
            <div key={`${condition.field}-${index}`} className="grid gap-2 sm:grid-cols-[1.25fr_1fr_1.2fr_auto] sm:items-end">
              <div className="space-y-1"><span className="text-[11px] font-medium text-text-tertiary">Trường</span><Select value={condition.field} onChange={(value) => updateField(index, String(value))} isDisabled={disabled} aria-label={`Trường điều kiện ${index + 1}`}><SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{metadata.map((item) => <SelectItem key={item.field} id={item.field}>{item.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><span className="text-[11px] font-medium text-text-tertiary">Phép so sánh</span><Select value={condition.operator} onChange={(value) => updateCondition(index, { operator: String(value), value: value === "is_empty" || value === "not_empty" ? null : condition.value })} isDisabled={disabled || !field} aria-label={`Phép so sánh ${index + 1}`}><SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{(field?.operators ?? []).map((operator) => <SelectItem key={operator} id={operator}>{operatorLabels[operator] ?? operator}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><span className="text-[11px] font-medium text-text-tertiary">Giá trị</span>{options.length > 0 && !isValueFree && !isListOperator ? <Select value={displayValue(condition.value)} onChange={(value) => updateCondition(index, { value: parseValue(String(value), condition.operator) })} isDisabled={disabled} aria-label={`Giá trị điều kiện ${index + 1}`}><SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} id={option}>{option}</SelectItem>)}</SelectContent></Select> : <Input value={isValueFree ? "" : displayValue(condition.value)} onChange={(event) => updateCondition(index, { value: parseValue(event.target.value, condition.operator) })} disabled={disabled || isValueFree} placeholder={isValueFree ? "Không cần nhập" : isListOperator ? "Nhập các giá trị, cách nhau bằng dấu phẩy" : "Nhập giá trị"} className="h-9 w-full" aria-label={`Giá trị điều kiện ${index + 1}`} />}</div>
              <Button size="xs" appearance="ghost" onPress={() => onChange(conditions.filter((_, conditionIndex) => conditionIndex !== index))} isDisabled={disabled} className="text-text-secondary hover:text-alert-danger-title">Xóa</Button>
            </div>
          );
        })}
        {conditions.length === 0 && <p className="py-3 text-xs text-text-tertiary">Chưa có điều kiện. Nếu để trống, Rule sẽ không giới hạn theo trường này.</p>}
      </div>
    </section>
  );
}
