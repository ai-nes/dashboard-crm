"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { Button } from "@/components/tailgrids/core/button";
import LeadRoutingProvinceDialog from "./lead-routing-province-dialog";

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
  const [isAdding, setIsAdding] = useState(false);
  const provinces = [
    ...new Map(
      options.map((team) => [team.province, team.provinceLabel]),
    ).entries(),
  ];
  const availableOptions = options.filter(
    (team) => !(team.province in priorities),
  );

  return (
    <div className="space-y-3 border-t border-card-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Team ưu tiên theo tỉnh
        </h4>
        {canEdit && availableOptions.length > 0 && (
          <Button
            appearance="outline"
            size="sm"
            isDisabled={isSaving}
            onPress={() => setIsAdding(true)}
          >
            Thêm tỉnh
          </Button>
        )}
      </div>
      {Object.entries(priorities).map(([province, teamId]) => (
        <div
          key={province}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-background-gray-secondary/60 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
        >
          <span className="text-sm text-text-primary">
            {provinces.find(([id]) => id === province)?.[1] ?? province}
          </span>
          <div className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:row-start-auto">
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
          </div>
          {canEdit && (
            <Button
              appearance="ghost"
              size="sm"
              className="col-start-2 row-start-1 sm:col-start-auto sm:row-start-auto"
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
      {canEdit && isAdding && (
        <LeadRoutingProvinceDialog
          options={availableOptions}
          isSaving={isSaving}
          onClose={() => setIsAdding(false)}
          onAdd={(team) => {
            if (
              isSaving ||
              !availableOptions.some((option) => option.id === team.id)
            )
              return;
            onChange({ ...priorities, [team.province]: team.id });
            setIsAdding(false);
          }}
        />
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
