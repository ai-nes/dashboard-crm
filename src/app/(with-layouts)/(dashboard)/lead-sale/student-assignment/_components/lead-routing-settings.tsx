"use client";

import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/tailgrids/core/select";
import { Badge } from "@/components/tailgrids/core/badge";
import { Toggle } from "@/components/tailgrids/core/toggle";
import type {
  LeadRoutingPolicy,
  LeadRoutingLayerKey,
  LeadRoutingStrategy,
} from "@/services/api/lead-sale";
import LeadRoutingLayerRow from "./lead-routing-layer-row";

type Props = {
  policy: LeadRoutingPolicy;
  canEdit: boolean;
  isSaving: boolean;
  onChange: (policy: LeadRoutingPolicy) => void;
};

const strategyLabels: Record<LeadRoutingStrategy, string> = {
  least_load: "Cân bằng theo tải",
  round_robin: "Luân phiên theo lượt",
};

export default function LeadRoutingSettings({
  policy,
  canEdit,
  isSaving,
  onChange,
}: Props) {
  const layers = policy?.layers ?? [];

  const reorderLayers = (sourceKey: unknown, targetKey: unknown) => {
    if (
      typeof sourceKey !== "string" ||
      typeof targetKey !== "string" ||
      !policy ||
      !canEdit ||
      isSaving
    )
      return;
    const sourceIndex = layers.findIndex((layer) => layer.key === sourceKey);
    const targetIndex = layers.findIndex((layer) => layer.key === targetKey);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex)
      return;
    const nextLayers = layers.slice();
    const [moved] = nextLayers.splice(sourceIndex, 1);
    nextLayers.splice(targetIndex, 0, moved);
    onChange({
      ...policy,
      layers: nextLayers.map((layer, index) => ({
        ...layer,
        priority: index + 1,
      })),
      layerOrder: nextLayers.map((layer) => layer.key),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;
    reorderLayers(
      event.operation.source?.data.layerKey,
      event.operation.target?.data.layerKey,
    );
  };

  const toggleLayer = (key: LeadRoutingLayerKey, enabled: boolean) => {
    if (!policy || !canEdit || isSaving) return;
    onChange({
      ...policy,
      layers: policy.layers.map((layer) =>
        layer.key === key ? { ...layer, enabled } : layer,
      ),
    });
  };

  if (!policy) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg bg-background-gray-secondary px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Phân bổ Lead tự động
          </h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {policy.enabled
              ? "Áp dụng thứ tự và điều kiện bên dưới."
              : "Đang tắt. Các thiết lập bên dưới được giữ để dùng khi bật lại."}
          </p>
        </div>
        <div className="shrink-0">
          {canEdit ? (
            <Toggle
              label={policy.enabled ? "Bật" : "Tắt"}
              aria-label="Phân bổ Lead tự động"
              checked={policy.enabled}
              disabled={isSaving}
              onChange={(event) =>
                onChange({ ...policy, enabled: event.target.checked })
              }
            />
          ) : (
            <Badge color="gray">{policy.enabled ? "Bật" : "Tắt"}</Badge>
          )}
        </div>
      </div>

      <section aria-labelledby="routing-priority-title" className="space-y-3">
        <div>
          <h3
            id="routing-priority-title"
            className="text-sm font-semibold text-text-primary"
          >
            Thứ tự ưu tiên
          </h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Xét từ trên xuống. Kéo thả hoặc chọn vị trí để đổi thứ tự.
          </p>
        </div>
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div
            className="divide-y divide-card-border rounded-lg border border-card-border"
            role="list"
            aria-label="Thứ tự lớp phân tuyến"
          >
            {layers.map((layer, index) => (
              <LeadRoutingLayerRow
                key={layer.key}
                layer={layer}
                index={index}
                canEdit={canEdit}
                isSaving={isSaving}
                onToggle={toggleLayer}
                count={layers.length}
                onMove={(key, position) =>
                  reorderLayers(key, layers[position]?.key)
                }
              />
            ))}
          </div>
        </DragDropProvider>
        <p className="text-xs leading-5 text-text-secondary">
          Nếu lớp đã khớp nhưng không có người đủ điều kiện, Lead chuyển vào
          “Cần lưu ý”, không chuyển xuống lớp tiếp theo.
        </p>
      </section>

      <section
        aria-labelledby="routing-distribution-title"
        className="space-y-4 border-t border-card-border pt-5"
      >
        <h3
          id="routing-distribution-title"
          className="text-sm font-semibold text-text-primary"
        >
          Cách chia Lead
        </h3>
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <div className="space-y-2">
            {canEdit ? (
              <Select
                value={policy.distributionStrategy}
                isDisabled={isSaving}
                onChange={(value) => {
                  if (value === "least_load" || value === "round_robin")
                    onChange({ ...policy, distributionStrategy: value });
                }}
              >
                <SelectLabel>Phương thức phân bổ</SelectLabel>
                <SelectTrigger size="sm" className="h-10 w-full">
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(strategyLabels).map(([value, label]) => (
                    <SelectItem key={value} id={value} textValue={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <p className="text-sm font-medium text-text-primary">
                  Phương thức phân bổ
                </p>
                <p className="text-sm text-text-primary">
                  {strategyLabels[policy.distributionStrategy]}
                </p>
              </>
            )}
            <p className="text-xs leading-5 text-text-secondary">
              {policy.distributionStrategy === "least_load"
                ? "Ưu tiên người có tải thấp hơn. Khuyến nghị sử dụng."
                : "Chia lần lượt cho những người đủ điều kiện."}
            </p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-text-primary">
                Kiểm tra sức chứa
              </h4>
              <p className="mt-2 text-xs leading-5 text-text-secondary">
                Yêu cầu còn sức chứa (capacity) trước khi nhận thêm Lead.
              </p>
            </div>
            <div className="shrink-0">
              {canEdit ? (
                <Toggle
                  aria-label="Bắt buộc capacity trước khi nhận Lead"
                  checked={policy.capacityRequired}
                  disabled={isSaving}
                  onChange={(event) =>
                    onChange({
                      ...policy,
                      capacityRequired: event.target.checked,
                    })
                  }
                />
              ) : (
                <Badge color="gray">
                  {policy.capacityRequired ? "Bắt buộc" : "Không bắt buộc"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
