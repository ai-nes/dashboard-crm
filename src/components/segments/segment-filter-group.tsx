"use client";

import { Layers2, Trash1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";

import type {
  SegmentCondition,
  SegmentFilterGroup as SegmentFilterGroupData,
  StudentSegmentProperty,
} from "./segment-filter-config";
import { SegmentFilterConditionRow } from "./segment-filter-condition-row";
import { SegmentFilterPropertyPicker } from "./segment-filter-property-picker";
import { SegmentLogicSelect } from "./segment-logic-select";
import { SegmentFilterGroupName } from "./segment-filter-group-name";

interface SegmentFilterGroupProps {
  group: SegmentFilterGroupData;
  index: number;
  canDelete: boolean;
  onNameChange: (name: string) => void;
  onLogicChange: (logic: "AND" | "OR") => void;
  onAddCondition: (
    property: StudentSegmentProperty,
    category?: string,
  ) => void;
  onUpdateCondition: (condition: SegmentCondition) => void;
  onRemoveCondition: (conditionId: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SegmentFilterGroup({
  group,
  index,
  canDelete,
  onNameChange,
  onLogicChange,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onDuplicate,
  onDelete,
}: SegmentFilterGroupProps) {
  return (
    <section className="rounded-2xl border border-card-border bg-card-surface-area p-3 shadow-xs sm:p-4">
      <header className="flex items-center justify-between gap-3 px-1 pb-3">
        <SegmentFilterGroupName
          name={group.name || `Nhóm ${index + 1}`}
          onChange={onNameChange}
        />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="primary"
                  appearance="ghost"
                  iconOnly
                  size="sm"
                  aria-label="Nhân bản nhóm"
                  className="text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
                  onPress={onDuplicate}
                >
                  <Layers2 size={17} aria-hidden="true" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nhân bản nhóm</p>
            </TooltipContent>
          </Tooltip>
          {canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="danger"
                    appearance="ghost"
                    iconOnly
                    size="sm"
                    aria-label="Xóa nhóm"
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
          )}
        </div>
      </header>

      <div className="space-y-2">
        {group.conditions.length === 0 ? (
          <div className="rounded-lg bg-background-gray-secondary p-3">
            <SegmentFilterPropertyPicker onSelect={onAddCondition} />
          </div>
        ) : (
          group.conditions.map((condition, conditionIndex) => (
            <div key={condition.id} className="space-y-2">
              {conditionIndex > 0 && (
                <p className="px-2 text-sm font-medium text-text-secondary">
                  {group.logic === "AND" ? "và" : "hoặc"}
                </p>
              )}
              <SegmentFilterConditionRow
                condition={condition}
                onChange={onUpdateCondition}
                onRemove={() => onRemoveCondition(condition.id)}
              />
            </div>
          ))
        )}
      </div>

      {group.conditions.length > 0 && (
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-background-gray-secondary p-3">
          <SegmentLogicSelect
            value={group.logic}
            onChange={onLogicChange}
            label="Liên kết điều kiện trong nhóm"
          />
          <SegmentFilterPropertyPicker onSelect={onAddCondition} />
        </div>
      )}
    </section>
  );
}
