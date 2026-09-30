"use client";

import { MenuFriesLeft1 } from "@tailgrids/icons";
import { closestCenter } from "@dnd-kit/collision";
import { useDraggable, useDroppable } from "@dnd-kit/react";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { Badge } from "@/components/tailgrids/core/badge";
import { Toggle } from "@/components/tailgrids/core/toggle";
import type {
  LeadRoutingLayer,
  LeadRoutingLayerKey,
} from "@/services/api/lead-sale";

export const LEAD_ROUTING_LAYER_LABELS: Record<LeadRoutingLayerKey, string> = {
  campaign: "Theo chiến dịch",
  group: "Theo Team Group / tỉnh",
  global: "Chia đều trong campus",
};

const LAYER_DESCRIPTIONS: Record<LeadRoutingLayerKey, string> = {
  campaign: "Ưu tiên Team/Group được liên kết với chiến dịch của Lead.",
  group: "Chia cho Sale/CTV trong Group phụ trách tỉnh của Lead.",
  global: "Chia trong các Team Sales cùng campus, không xét tỉnh hoặc Group.",
};

interface LeadRoutingLayerRowProps {
  layer: LeadRoutingLayer;
  index: number;
  count: number;
  onMove: (key: LeadRoutingLayerKey, position: number) => void;
  canEdit: boolean;
  isSaving: boolean;
  onToggle: (key: LeadRoutingLayerKey, enabled: boolean) => void;
}

export default function LeadRoutingLayerRow({
  layer,
  index,
  canEdit,
  count,
  onMove,
  isSaving,
  onToggle,
}: LeadRoutingLayerRowProps) {
  const disabled = !canEdit || isSaving;
  const {
    isDragging,
    handleRef,
    ref: draggableRef,
  } = useDraggable({
    id: `lead-routing-layer-${layer.key}`,
    data: { layerKey: layer.key },
    disabled,
  });
  const { isDropTarget, ref: droppableRef } = useDroppable({
    id: `lead-routing-layer-drop-${layer.key}`,
    data: { layerKey: layer.key },
    collisionDetector: closestCenter,
    disabled,
  });

  return (
    <div
      ref={droppableRef}
      role="listitem"
      className={`first:rounded-t-lg last:rounded-b-lg transition-colors motion-reduce:transition-none ${
        isDropTarget ? "bg-badge-primary-background" : "bg-card-background"
      } ${isDragging ? "opacity-60" : ""}`}
    >
      <div
        ref={draggableRef}
        className="flex flex-wrap items-center gap-3 rounded-[inherit] px-3 py-4 sm:flex-nowrap"
      >
        {canEdit && (
          <button
            ref={handleRef}
            type="button"
            disabled={disabled}
            aria-label={`Kéo ${LEAD_ROUTING_LAYER_LABELS[layer.key]} để đổi thứ tự ưu tiên`}
            title="Kéo để đổi thứ tự ưu tiên"
            className="hidden size-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-text-secondary outline-none hover:bg-background-gray-secondary focus-visible:ring-2 focus-visible:ring-primary-500 active:cursor-grabbing disabled:cursor-default disabled:opacity-50 sm:flex"
          >
            <MenuFriesLeft1 size={16} aria-hidden="true" />
          </button>
        )}
        {canEdit ? (
          <Select
            aria-label={`Vị trí ưu tiên của ${LEAD_ROUTING_LAYER_LABELS[layer.key]}`}
            value={String(index)}
            isDisabled={disabled}
            onChange={(value) => {
              if (value !== null) onMove(layer.key, Number(value));
            }}
            className="w-20 shrink-0"
          >
            <SelectTrigger size="sm" className="h-9 w-full gap-3 px-3">
              <SelectValue className="min-w-4 text-left tabular-nums" />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent className="min-w-20">
              {Array.from({ length: count }, (_, position) => (
                <SelectItem
                  key={position}
                  id={String(position)}
                  textValue={String(position + 1)}
                >
                  {position + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background-gray-secondary text-sm text-text-secondary">
            {index + 1}
          </span>
        )}
        <div className="min-w-0 flex-1 basis-40">
          <p className="text-sm font-medium text-text-primary">
            {LEAD_ROUTING_LAYER_LABELS[layer.key]}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-text-secondary">
            {LAYER_DESCRIPTIONS[layer.key]}
          </p>
        </div>
        <div className="ml-auto shrink-0">
          {canEdit ? (
            <Toggle
              label={layer.enabled ? "Bật" : "Tắt"}
              aria-label={`Bật ${LEAD_ROUTING_LAYER_LABELS[layer.key]}`}
              checked={layer.enabled}
              disabled={disabled}
              onChange={(event) => onToggle(layer.key, event.target.checked)}
            />
          ) : (
            <Badge color="gray">{layer.enabled ? "Bật" : "Tắt"}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
