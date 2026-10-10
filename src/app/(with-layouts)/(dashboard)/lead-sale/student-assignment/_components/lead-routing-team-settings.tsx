"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/tailgrids/core/select";
import { Button } from "@/components/tailgrids/core/button";

export type RoutingTeamOption = {
  id: string;
  label: string;
  province: string;
  provinceLabel: string;
};
type Props = {
  options: RoutingTeamOption[];
  priorities: Record<string, string>;
  canEdit: boolean;
  isSaving: boolean;
  onChange: (priorities: Record<string, string>) => void;
};

export default function LeadRoutingTeamSettings({
  options,
  priorities,
  canEdit,
  isSaving,
  onChange,
}: Props) {
  const [newProvince, setNewProvince] = useState<string | null>(null);
  const provinces = [
    ...new Map(
      options.map((team) => [team.province, team.provinceLabel]),
    ).entries(),
  ];
  const available = provinces.filter(([id]) => !(id in priorities));
  const selected =
    newProvince && available.some(([id]) => id === newProvince)
      ? newProvince
      : null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-text-primary">
        Team ưu tiên theo tỉnh
      </h4>
      {Object.entries(priorities).map(([province, teamId]) => (
        <div
          key={province}
          className="grid items-center gap-3 rounded-lg border border-card-border p-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <span className="text-sm text-text-primary">
            {provinces.find(([id]) => id === province)?.[1] ?? province}
          </span>
          {canEdit ? (
            <Select
              value={teamId}
              isDisabled={isSaving}
              aria-label={`Team ưu tiên của ${province}`}
              onChange={(value) => {
                if (value)
                  onChange({ ...priorities, [province]: String(value) });
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {options
                  .filter((team) => team.province === province)
                  .map((team) => (
                    <SelectItem
                      key={team.id}
                      id={team.id}
                      textValue={team.label}
                    >
                      {team.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-text-secondary">
              {options.find((team) => team.id === teamId)?.label ?? teamId}
            </span>
          )}
          {canEdit && (
            <Button
              appearance="ghost"
              size="sm"
              isDisabled={isSaving}
              aria-label={`Bỏ team ưu tiên của ${province}`}
              onPress={() => {
                const next = { ...priorities };
                delete next[province];
                onChange(next);
              }}
            >
              Bỏ
            </Button>
          )}
        </div>
      ))}
      {!Object.keys(priorities).length && (
        <p className="text-sm text-text-tertiary">
          Chưa chọn team ưu tiên. Lead thuộc tỉnh chưa cấu hình sẽ chờ xử lý.
        </p>
      )}
      {canEdit && available.length > 0 && (
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <Select
            value={selected ?? ""}
            placeholder="Chọn tỉnh/thành phố"
            isDisabled={isSaving}
            onChange={(value) => setNewProvince(value ? String(value) : null)}
          >
            <SelectLabel>Thêm tỉnh</SelectLabel>
            <SelectTrigger size="sm">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {available.map(([id, label]) => (
                <SelectItem key={id} id={id} textValue={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            appearance="outline"
            size="sm"
            isDisabled={isSaving || !selected}
            onPress={() => {
              const team = options.find((entry) => entry.province === selected);
              if (team) {
                onChange({ ...priorities, [team.province]: team.id });
                setNewProvince(null);
              }
            }}
          >
            Thêm tỉnh
          </Button>
        </div>
      )}
      {canEdit && !options.length && (
        <p className="text-sm text-text-tertiary">
          Chưa có team Sales hoạt động được gắn tỉnh. Cần cấu hình Team Group và
          team trước.
        </p>
      )}
    </div>
  );
}
