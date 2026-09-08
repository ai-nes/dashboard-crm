"use client";

import type { Dispatch, SetStateAction } from "react";
import { SegmentLogicSelect } from "./segment-logic-select";

import {
  getInitialConditionValue,
  SEGMENT_PROPERTY_CONFIG,
  SegmentOperator,
  type SegmentCondition,
  type SegmentFilterGroup,
  type StudentSegmentProperty,
} from "./segment-filter-config";
import { SegmentFilterGroup as SegmentFilterGroupView } from "./segment-filter-group";
import { SegmentFilterPropertyPicker } from "./segment-filter-property-picker";

let filterId = 0;

function createFilterId(prefix: string) {
  filterId += 1;
  return `${prefix}-${filterId}`;
}

function createCondition(property: StudentSegmentProperty): SegmentCondition {
  const operator =
    SEGMENT_PROPERTY_CONFIG[property].operators[0] ?? SegmentOperator.IS_KNOWN;

  return {
    id: createFilterId("condition"),
    property,
    operator,
    value: getInitialConditionValue(property, operator),
  };
}

export function SegmentFilterBuilder({
  groups,
  setGroups,
  groupLogic,
  setGroupLogic,
}: {
  groups: SegmentFilterGroup[];
  setGroups: Dispatch<SetStateAction<SegmentFilterGroup[]>>;
  groupLogic: "AND" | "OR";
  setGroupLogic: Dispatch<SetStateAction<"AND" | "OR">>;
}) {
  const addCondition = (
    groupId: string | undefined,
    property: StudentSegmentProperty,
  ) => {
    const condition = createCondition(property);

    setGroups((currentGroups) => {
      if (!groupId) {
        return [
          ...currentGroups,
          {
            id: createFilterId("group"),
            name: `Nhóm ${currentGroups.length + 1}`,
            logic: "AND",
            conditions: [condition],
          },
        ];
      }

      return currentGroups.map((group) =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, condition] }
          : group,
      );
    });
  };

  const updateCondition = (
    groupId: string,
    nextCondition: SegmentCondition,
  ) => {
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === nextCondition.id ? nextCondition : condition,
              ),
            }
          : group,
      ),
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setGroups((currentGroups) =>
      currentGroups
        .map((group) =>
          group.id === groupId
            ? {
                ...group,
                conditions: group.conditions.filter(
                  (condition) => condition.id !== conditionId,
                ),
              }
            : group,
        )
        .filter((group) => group.conditions.length > 0),
    );
  };

  const duplicateGroup = (groupId: string) => {
    setGroups((currentGroups) => {
      const groupIndex = currentGroups.findIndex(
        (group) => group.id === groupId,
      );
      const sourceGroup = currentGroups[groupIndex];
      if (!sourceGroup) return currentGroups;

      const duplicate: SegmentFilterGroup = {
        id: createFilterId("group"),
        name: `${sourceGroup.name} (bản sao)`,
        logic: sourceGroup.logic,
        conditions: sourceGroup.conditions.map((condition) => ({
          ...condition,
          id: createFilterId("condition"),
          value: Array.isArray(condition.value)
            ? [...condition.value]
            : condition.value,
        })),
      };

      return [
        ...currentGroups.slice(0, groupIndex + 1),
        duplicate,
        ...currentGroups.slice(groupIndex + 1),
      ];
    });
  };

  const deleteGroup = (groupId: string) => {
    setGroups((currentGroups) =>
      currentGroups.filter((group) => group.id !== groupId),
    );
  };

  const addGroup = (property: StudentSegmentProperty) => {
    const condition = createCondition(property);
    setGroups((currentGroups) => [
      ...currentGroups,
      {
        id: createFilterId("group"),
        name: `Nhóm ${currentGroups.length + 1}`,
        logic: "AND",
        conditions: [condition],
      },
    ]);
  };

  if (groups.length === 0) {
    return (
      <div className="flex min-h-full items-start justify-center px-4 pt-8 sm:pt-12">
        <div className="text-center">
          <p className="text-base text-text-primary sm:text-lg">
            Segment này chưa có bộ lọc
          </p>
          <SegmentFilterPropertyPicker
            triggerLabel="Thêm bộ lọc"
            onSelect={(property) => addCondition(undefined, property)}
            className="mt-5"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-8 sm:py-8">
      {groups.map((group, index) => (
        <div key={group.id}>
          {index > 0 && (
            <div className="relative flex items-center gap-3 py-5 pl-8 before:absolute before:inset-y-0 before:left-20 before:border-l before:border-card-border">
              <div className="relative">
                <SegmentLogicSelect
                  value={groupLogic}
                  onChange={setGroupLogic}
                  label="Liên kết các nhóm"
                />
              </div>
            </div>
          )}
          <SegmentFilterGroupView
            group={group}
            index={index}
            canDelete={groups.length > 1}
            onNameChange={(name) =>
              setGroups((current) =>
                current.map((item) =>
                  item.id === group.id ? { ...item, name } : item,
                ),
              )
            }
            onLogicChange={(logic) =>
              setGroups((current) =>
                current.map((item) =>
                  item.id === group.id ? { ...item, logic } : item,
                ),
              )
            }
            onAddCondition={(property) => addCondition(group.id, property)}
            onUpdateCondition={(condition) =>
              updateCondition(group.id, condition)
            }
            onRemoveCondition={(conditionId) =>
              removeCondition(group.id, conditionId)
            }
            onDuplicate={() => duplicateGroup(group.id)}
            onDelete={() => deleteGroup(group.id)}
          />
        </div>
      ))}

      <div className="relative flex items-center gap-3 pt-6 pl-8 before:absolute before:top-0 before:left-20 before:h-6 before:border-l before:border-card-border">
        <SegmentLogicSelect
          value={groupLogic}
          onChange={setGroupLogic}
          label="Liên kết nhóm tiếp theo"
        />
        <SegmentFilterPropertyPicker
          triggerLabel="Thêm nhóm bộ lọc"
          onSelect={addGroup}
        />
      </div>
    </div>
  );
}
