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
import type { CrmFactMetadata, CrmRuleOperator } from "@/services/api/rules-config";

import {
  conditionValueLabel,
  factLabel,
  isConditionComplete,
  operatorLabel,
  RULE_OPERATORS,
  type RuleFilterCondition,
} from "./rule-condition-model";
import { RuleConditionValue } from "./rule-condition-value";
import { RuleFactPicker } from "./rule-fact-picker";

interface RuleFilterConditionRowProps {
  condition: RuleFilterCondition;
  facts: CrmFactMetadata[];
  disabled?: boolean;
  onChange: (condition: RuleFilterCondition) => void;
  onRemove: () => void;
}

export function RuleFilterConditionRow({ condition, facts, disabled, onChange, onRemove }: RuleFilterConditionRowProps) {
  const [editing, setEditing] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const complete = isConditionComplete(condition);

  useEffect(() => {
    if (!editing || !complete) return;
    const finish = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const owner = target.closest<HTMLElement>("[data-condition-owner]");
      if (rowRef.current?.contains(target) || owner?.dataset.conditionOwner === condition.id) return;
      setEditing(false);
    };
    document.addEventListener("pointerdown", finish, true);
    document.addEventListener("focusin", finish);
    return () => {
      document.removeEventListener("pointerdown", finish, true);
      document.removeEventListener("focusin", finish);
    };
  }, [condition.id, editing, complete]);

  return (
    <div ref={rowRef} className="flex flex-wrap items-center gap-2 rounded-lg bg-background-gray-secondary p-3">
      {!editing && complete ? (
        <Button
          appearance="ghost"
          className="h-auto min-w-0 flex-1 justify-start whitespace-normal py-2 text-left text-text-primary"
          isDisabled={disabled}
          onPress={() => setEditing(true)}
        >
          <span>
            <strong>{factLabel(condition.fact)}</strong>{" "}
            <span className="font-normal">{operatorLabel(condition.op).toLocaleLowerCase("vi-VN")}</span>{" "}
            {conditionValueLabel(condition, facts) ? <strong>{conditionValueLabel(condition, facts)}</strong> : null}
          </span>
        </Button>
      ) : (
        <>
          <RuleFactPicker
            facts={facts}
            ownerId={condition.id}
            triggerLabel={factLabel(condition.fact) || "Chọn fact"}
            showPlus={false}
            disabled={disabled}
            selectedFact={condition.fact}
            onSelect={(fact) => onChange({ ...condition, fact, value: "", factRef: undefined })}
            className="h-11 min-w-40 flex-1"
          />

          <Select
            aria-label="Toán tử"
            isDisabled={disabled}
            value={condition.op}
            onChange={(nextOperator) => {
              const op = nextOperator as CrmRuleOperator;
              onChange({ ...condition, op, value: "", factRef: undefined });
            }}
            className="min-w-40 flex-1"
          >
            <SelectTrigger size="lg" className="h-11 w-full bg-card-surface-area text-left">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent data-condition-owner={condition.id}>
              {RULE_OPERATORS.map((item) => (
                <SelectItem key={item.value} id={item.value} textValue={item.label}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <RuleConditionValue
            condition={condition}
            facts={facts}
            disabled={disabled}
            onChange={(patch) => onChange({ ...condition, ...patch })}
          />
        </>
      )}

      <Button
        variant="primary"
        appearance="ghost"
        iconOnly
        size="sm"
        aria-label="Xóa điều kiện"
        isDisabled={disabled}
        className="self-end text-text-secondary hover:bg-card-surface-area hover:text-text-primary md:self-auto"
        onPress={onRemove}
      >
        <Close size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}
