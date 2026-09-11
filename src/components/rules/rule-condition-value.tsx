"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { Input } from "@/components/tailgrids/core/input";
import type { CrmFactMetadata, CrmRuleScalar } from "@/services/api/rules-config";

import {
  factLabel,
  getFactType,
  operatorRequiresValue,
  operatorSupportsFactRef,
  parseConditionValueInput,
  readConditionValue,
  type RuleFilterCondition,
} from "./rule-condition-model";
import { RuleFactPicker } from "./rule-fact-picker";

interface RuleConditionValuePatch {
  value?: CrmRuleScalar | CrmRuleScalar[] | null;
  factRef?: string;
}

interface RuleConditionValueProps {
  condition: RuleFilterCondition;
  facts: CrmFactMetadata[];
  disabled?: boolean;
  onChange: (patch: RuleConditionValuePatch) => void;
}

export function RuleConditionValue({ condition, facts, disabled, onChange }: RuleConditionValueProps) {
  if (!operatorRequiresValue(condition.op)) {
    return <span className="px-2 text-sm text-text-tertiary">Không cần giá trị</span>;
  }

  const type = getFactType(condition.fact, facts);
  const canCompareFacts = operatorSupportsFactRef(condition.op);
  const comparableFacts = facts.filter((item) => item.fact !== condition.fact && item.type === type);
  const mode = condition.factRef ? "fact" : "value";

  const modeSwitch = canCompareFacts && comparableFacts.length > 0 ? (
    <Select
      aria-label="Kiểu so sánh"
      isDisabled={disabled}
      value={mode}
      onChange={(next) => {
        if (next === "fact") onChange({ factRef: comparableFacts[0]?.fact, value: undefined });
        else onChange({ value: "", factRef: undefined });
      }}
      className="w-40 shrink-0"
    >
      <SelectTrigger size="lg" className="h-11 w-full bg-card-surface-area text-left">
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent>
        <SelectItem id="value" textValue="Giá trị cố định">
          Giá trị cố định
        </SelectItem>
        <SelectItem id="fact" textValue="So sánh với fact khác">
          So sánh với fact khác
        </SelectItem>
      </SelectContent>
    </Select>
  ) : null;

  if (mode === "fact") {
    return (
      <div className="flex min-w-40 flex-1 flex-wrap items-center gap-2">
        {modeSwitch}
        <RuleFactPicker
          facts={comparableFacts}
          triggerLabel={factLabel(condition.factRef ?? "") || "Chọn fact"}
          showPlus={false}
          disabled={disabled}
          selectedFact={condition.factRef}
          onSelect={(fact) => onChange({ factRef: fact, value: undefined })}
          className="h-11 min-w-40 flex-1"
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-40 flex-1 flex-wrap items-center gap-2">
      {modeSwitch}
      {type === "boolean" ? (
        <Select
          aria-label="Giá trị"
          isDisabled={disabled}
          value={readConditionValue(condition.value) || "true"}
          onChange={(next) => onChange({ value: parseConditionValueInput(next, "boolean", condition.op) })}
          className="min-w-32 flex-1"
        >
          <SelectTrigger size="lg" className="h-11 w-full bg-card-surface-area text-left">
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="true" textValue="Đúng">Đúng</SelectItem>
            <SelectItem id="false" textValue="Sai">Sai</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          aria-label="Giá trị"
          disabled={disabled}
          className="h-11 min-w-40 flex-1 bg-card-surface-area"
          type={type === "number" ? "number" : type === "datetime" ? "datetime-local" : "text"}
          value={readConditionValue(condition.value)}
          placeholder={condition.op === "in" || condition.op === "not_in" ? "Giá trị, cách nhau bằng dấu phẩy" : "Giá trị"}
          onChange={(event) => onChange({ value: parseConditionValueInput(event.target.value, type, condition.op) })}
        />
      )}
    </div>
  );
}
