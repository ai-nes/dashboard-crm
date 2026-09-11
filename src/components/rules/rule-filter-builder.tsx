"use client";

import type { Dispatch, SetStateAction } from "react";

import type { CrmFactMetadata } from "@/services/api/rules-config";

import {
  createCondition,
  createGroup,
  type RuleFilterCondition,
  type RuleFilterGroup as RuleFilterGroupData,
  type RuleFilterLogic,
} from "./rule-condition-model";
import { RuleFactPicker } from "./rule-fact-picker";
import { RuleFilterGroup } from "./rule-filter-group";
import { RuleFilterLogicSelect } from "./rule-filter-logic-select";

interface RuleFilterBuilderProps {
  groups: RuleFilterGroupData[];
  setGroups: Dispatch<SetStateAction<RuleFilterGroupData[]>>;
  logic: RuleFilterLogic;
  setLogic: Dispatch<SetStateAction<RuleFilterLogic>>;
  facts: CrmFactMetadata[];
  disabled?: boolean;
}

export function RuleFilterBuilder({ groups, setGroups, logic, setLogic, facts, disabled }: RuleFilterBuilderProps) {
  const addCondition = (groupId: string | undefined, fact: string) => {
    setGroups((current) => {
      if (!groupId) return [...current, createGroup(fact)];
      return current.map((group) =>
        group.id === groupId ? { ...group, conditions: [...group.conditions, createCondition(fact)] } : group,
      );
    });
  };

  const updateCondition = (groupId: string, next: RuleFilterCondition) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? { ...group, conditions: group.conditions.map((condition) => (condition.id === next.id ? next : condition)) }
          : group,
      ),
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setGroups((current) =>
      current
        .map((group) =>
          group.id === groupId
            ? { ...group, conditions: group.conditions.filter((condition) => condition.id !== conditionId) }
            : group,
        )
        .filter((group) => group.conditions.length > 0),
    );
  };

  const deleteGroup = (groupId: string) => {
    setGroups((current) => current.filter((group) => group.id !== groupId));
  };

  const addGroup = (fact: string) => {
    setGroups((current) => [...current, createGroup(fact)]);
  };

  if (groups.length === 0) {
    return (
      <div className="flex min-h-full items-start justify-center px-4 pt-8 sm:pt-12">
        <div className="text-center">
          <p className="text-base text-text-primary sm:text-lg">Rule này chưa có điều kiện</p>
          <RuleFactPicker facts={facts} disabled={disabled} triggerLabel="Thêm điều kiện" onSelect={(fact) => addCondition(undefined, fact)} className="mt-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-8 sm:py-8">
      {groups.map((group, index) => (
        <div key={group.id}>
          {index > 0 ? (
            <div className="relative flex items-center gap-3 py-5 pl-8 before:absolute before:inset-y-0 before:left-20 before:border-l before:border-card-border">
              <RuleFilterLogicSelect value={logic} onChange={setLogic} ariaLabel="Toán tử giữa các nhóm điều kiện" />
            </div>
          ) : null}
          <RuleFilterGroup
            group={group}
            index={index}
            facts={facts}
            disabled={disabled}
            canDelete={groups.length > 1}
            onLogicChange={(nextLogic) =>
              setGroups((current) => current.map((item) => (item.id === group.id ? { ...item, logic: nextLogic } : item)))
            }
            onNegateChange={(negate) =>
              setGroups((current) => current.map((item) => (item.id === group.id ? { ...item, negate } : item)))
            }
            onAddCondition={(fact) => addCondition(group.id, fact)}
            onUpdateCondition={(condition) => updateCondition(group.id, condition)}
            onRemoveCondition={(conditionId) => removeCondition(group.id, conditionId)}
            onDelete={() => deleteGroup(group.id)}
          />
        </div>
      ))}

      {!disabled ? (
        <div className="relative flex items-center gap-3 pt-6 pl-8 before:absolute before:top-0 before:left-20 before:h-6 before:border-l before:border-card-border">
          <RuleFilterLogicSelect value={logic} onChange={setLogic} ariaLabel="Toán tử khi thêm nhóm điều kiện" />
          <RuleFactPicker facts={facts} triggerLabel="Thêm nhóm điều kiện" onSelect={addGroup} />
        </div>
      ) : null}
    </div>
  );
}
