"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import type { RuleFilterLogic } from "./rule-condition-model";

interface RuleFilterLogicSelectProps {
  value: RuleFilterLogic;
  onChange: (logic: RuleFilterLogic) => void;
  ariaLabel: string;
}

const LOGIC_OPTIONS: Array<{ value: RuleFilterLogic; label: string }> = [
  { value: "all", label: "và" },
  { value: "any", label: "hoặc" },
];

export function RuleFilterLogicSelect({ value, onChange, ariaLabel }: RuleFilterLogicSelectProps) {
  return (
    <Select
      aria-label={ariaLabel}
      value={value}
      onChange={(nextLogic) => onChange(nextLogic as RuleFilterLogic)}
      className="relative z-10 w-auto"
    >
      <SelectTrigger
        size="sm"
        className="h-9 min-w-20 justify-center border-0 bg-background-gray-secondary px-3 font-semibold text-text-secondary shadow-none hover:bg-background-gray-secondary_alt"
      >
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent className="min-w-24">
        {LOGIC_OPTIONS.map((logicOption) => (
          <SelectItem key={logicOption.value} id={logicOption.value} textValue={`${logicOption.label} ${logicOption.value}`}>
            {logicOption.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
