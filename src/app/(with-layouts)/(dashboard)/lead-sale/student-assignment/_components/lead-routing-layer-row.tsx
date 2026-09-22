"use client";

import { MenuFriesLeft1 } from "@tailgrids/icons";
import { closestCenter } from "@dnd-kit/collision";
import { useDraggable, useDroppable } from "@dnd-kit/react";

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
  campaign:
    "Lead có Campaign mapping hợp lệ sẽ được ưu tiên vào Team/Group của Campaign.",
  group:
    "Tỉnh xác định Group; toàn bộ Sale/CTV trong Group cùng tham gia chia tải.",
  global:
    "Bỏ qua tỉnh và Group, chia trong các Team Sales cùng campus của Lead.",
};

interface LeadRoutingLayerRowProps {
  layer: LeadRoutingLayer;
  index: number;
  canEdit: boolean;
  isSaving: boolean;
  onToggle: (key: LeadRoutingLayerKey, enabled: boolean) => void;
}

export default function LeadRoutingLayerRow({
  layer,
  index,
  canEdit,
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
      className={`rounded-lg border transition-colors ${
        isDropTarget
          ? "border-primary-400 bg-primary-50/60"
          : "border-card-border"
      } ${isDragging ? "opacity-60" : ""}`}
    >
      <div
        ref={draggableRef}
        className="flex items-center gap-3 bg-card-background px-3 py-2.5"
      >
        <button
          ref={handleRef}
          type="button"
          disabled={disabled}
          aria-label={`Kéo ${LEAD_ROUTING_LAYER_LABELS[layer.key]} để đổi thứ tự ưu tiên`}
          title="Kéo để đổi thứ tự ưu tiên"
          className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-text-tertiary outline-none transition hover:bg-background-soft-50 hover:text-text-primary active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-default disabled:opacity-50"
        >
          <MenuFriesLeft1 size={16} aria-hidden="true" />
        </button>
        <div className="flex w-7 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">
            {LEAD_ROUTING_LAYER_LABELS[layer.key]}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-text-tertiary">
            {LAYER_DESCRIPTIONS[layer.key]}
          </p>
        </div>
        <Toggle
          aria-label={`Bật ${LEAD_ROUTING_LAYER_LABELS[layer.key]}`}
          checked={layer.enabled}
          disabled={disabled}
          onChange={(event) => onToggle(layer.key, event.target.checked)}
        />
      </div>
    </div>
  );
}
