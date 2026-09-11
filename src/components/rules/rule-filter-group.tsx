"use client";

import { Trash1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tailgrids/core/tooltip";
import type { CrmFactMetadata } from "@/services/api/rules-config";

import type { RuleFilterCondition, RuleFilterGroup as RuleFilterGroupData, RuleFilterLogic } from "./rule-condition-model";
import { RuleFactPicker } from "./rule-fact-picker";
import { RuleFilterConditionRow } from "./rule-filter-condition-row";
import { RuleFilterLogicSelect } from "./rule-filter-logic-select";

interface RuleFilterGroupProps {
  group: RuleFilterGroupData;
  index: number;
  facts: CrmFactMetadata[];
  disabled?: boolean;
  canDelete: boolean;
  onLogicChange: (logic: RuleFilterLogic) => void;
  onNegateChange: (negate: boolean) => void;
  onAddCondition: (fact: string) => void;
  onUpdateCondition: (condition: RuleFilterCondition) => void;
  onRemoveCondition: (conditionId: string) => void;
  onDelete: () => void;
}

export function RuleFilterGroup({
  group,
  index,
  facts,
  disabled,
  canDelete,
  onLogicChange,
  onNegateChange,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onDelete,
}: RuleFilterGroupProps) {
  return (
    <section className="rounded-2xl border border-card-border bg-card-surface-area p-3 shadow-xs sm:p-4">
      <header className="flex items-center justify-between gap-3 px-1 pb-3">
        <span className="text-sm font-semibold text-title-50">Nhóm {index + 1}</span>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  size="sm"
                  variant={group.negate ? "danger" : "primary"}
                  appearance={group.negate ? "fill" : "outline"}
                  isDisabled={disabled}
                  aria-pressed={group.negate}
                  className="whitespace-nowrap"
                  onPress={() => onNegateChange(!group.negate)}
                >
                  Phủ định (NOT)
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Đảo ngược kết quả của cả nhóm này — dùng khi điều kiện không được đúng.</p>
            </TooltipContent>
          </Tooltip>
          {canDelete ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="danger"
                    appearance="ghost"
                    iconOnly
                    size="sm"
                    aria-label="Xóa nhóm"
                    isDisabled={disabled}
                    className="hover:bg-badge-error-background"
                    onPress={onDelete}
                  >
                    <Trash1 size={17} aria-hidden="true" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa nhóm</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </header>

      <div className="space-y-2">
        {group.conditions.length === 0 ? (
          <div className="rounded-lg bg-background-gray-secondary p-3">
            <RuleFactPicker facts={facts} disabled={disabled} onSelect={onAddCondition} />
          </div>
        ) : (
          group.conditions.map((condition, conditionIndex) => (
            <div key={condition.id} className="space-y-2">
              {conditionIndex > 0 ? (
                <RuleFilterLogicSelect value={group.logic} onChange={onLogicChange} ariaLabel="Toán tử giữa các điều kiện trong nhóm" />
              ) : null}
              <RuleFilterConditionRow
                condition={condition}
                facts={facts}
                disabled={disabled}
                onChange={onUpdateCondition}
                onRemove={() => onRemoveCondition(condition.id)}
              />
            </div>
          ))
        )}
      </div>

      {group.conditions.length > 0 ? (
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-background-gray-secondary p-3">
          <RuleFilterLogicSelect value={group.logic} onChange={onLogicChange} ariaLabel="Toán tử khi thêm điều kiện vào nhóm" />
          <RuleFactPicker facts={facts} disabled={disabled} onSelect={onAddCondition} />
        </div>
      ) : null}
    </section>
  );
}
