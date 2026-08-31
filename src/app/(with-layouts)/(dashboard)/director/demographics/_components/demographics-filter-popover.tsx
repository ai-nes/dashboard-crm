"use client";

import { Filter } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { Dialog, DialogTrigger } from "react-aria-components";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type {
  DemographicsFilterOptions,
  DirectorDemographicsOverviewParams,
} from "@/services/api/demographics/types";

const fallbackOptions: DemographicsFilterOptions = {
  provinces: ["Cần Thơ", "Đà Nẵng", "Hà Nội", "TP. Hồ Chí Minh", "Đồng Nai"],
  majors: ["Kỹ thuật phần mềm", "Trí tuệ nhân tạo", "Kinh doanh quốc tế", "Thiết kế vi mạch"],
  stages: ["Quan tâm", "Tìm hiểu", "Tư vấn", "Ứng tuyển", "Nhập học"],
  priorities: ["Cao", "Trung bình", "Thấp"],
  owners: [],
  sourceGroups: ["Trực tuyến chủ động", "Trực tuyến qua quảng cáo", "Thực địa", "Giới thiệu"],
};

const filterKeys = ["province", "major", "stage", "priority", "owner", "sourceGroup"] as const;
type FilterKey = (typeof filterKeys)[number];

interface DemographicsFilterPopoverProps {
  filters: DirectorDemographicsOverviewParams;
  options?: DemographicsFilterOptions;
  onApply: (filters: DirectorDemographicsOverviewParams) => void;
}

export default function DemographicsFilterPopover({
  filters,
  options,
  onApply,
}: DemographicsFilterPopoverProps) {
  const [draft, setDraft] = useState(filters);
  const availableOptions = useMemo(() => mergeOptions(options), [options]);

  const activeCount = countActiveFilters(filters);

  const updateDraft = (key: FilterKey | "period", value: string) => {
    setDraft((current) => ({
      ...current,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const reset = () => {
    const nextFilters: DirectorDemographicsOverviewParams = {
      admissionYear: filters.admissionYear,
      period: "season",
      scope: filters.scope ?? "all",
    };
    setDraft(nextFilters);
    onApply(nextFilters);
  };

  return (
    <DialogTrigger onOpenChange={(isOpen) => isOpen && setDraft(filters)}>
      <Button
        size="sm"
        appearance={activeCount > 0 ? "fill" : "outline"}
        aria-label="Mở bộ lọc overview"
      >
        <Filter size={16} aria-hidden="true" />
        Bộ lọc
        {activeCount > 0 ? <Badge color="gray">{activeCount}</Badge> : null}
      </Button>
      <Popover
        placement="bottom end"
        className="w-[min(36rem,calc(100vw-2rem))] overflow-y-auto p-0 shadow-lg"
      >
        <Dialog aria-label="Bộ lọc dữ liệu overview" className="p-4 outline-none sm:p-5">
          {({ close }) => (
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-card-border pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Bộ lọc dữ liệu</h2>
                  <p className="mt-1 text-xs leading-5 text-text-tertiary">
                    Áp dụng đồng thời cho toàn bộ overview và snapshot hiện tại.
                  </p>
                </div>
                <Button size="xs" appearance="ghost" onPress={reset}>
                  Đặt lại
                </Button>
              </div>

              <div className="grid gap-3 py-4 sm:grid-cols-2">
                <FilterSelect
                  label="Khoảng báo cáo"
                  value={draft.period ?? "season"}
                  options={[
                    { value: "season", label: "Cả mùa tuyển sinh" },
                    { value: "6m", label: "6 tháng gần nhất" },
                    { value: "12m", label: "12 tháng gần nhất" },
                  ]}
                  onChange={(value) => updateDraft("period", value)}
                />
                <FilterSelect
                  label="Tỉnh / thành"
                  value={draft.province ?? "all"}
                  options={availableOptions.provinces}
                  onChange={(value) => updateDraft("province", value)}
                />
                <FilterSelect
                  label="Ngành quan tâm"
                  value={draft.major ?? "all"}
                  options={availableOptions.majors}
                  onChange={(value) => updateDraft("major", value)}
                />
                <FilterSelect
                  label="Giai đoạn"
                  value={draft.stage ?? "all"}
                  options={availableOptions.stages}
                  onChange={(value) => updateDraft("stage", value)}
                />
                <FilterSelect
                  label="Ưu tiên"
                  value={draft.priority ?? "all"}
                  options={availableOptions.priorities}
                  onChange={(value) => updateDraft("priority", value)}
                />
                <FilterSelect
                  label="Người phụ trách"
                  value={draft.owner ?? "all"}
                  options={availableOptions.owners}
                  onChange={(value) => updateDraft("owner", value)}
                />
                <FilterSelect
                  label="Nhóm nguồn đầu tiên"
                  value={draft.sourceGroup ?? "all"}
                  options={availableOptions.sourceGroups}
                  onChange={(value) => updateDraft("sourceGroup", value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-card-border pt-4">
                <Button size="sm" appearance="ghost" onPress={close}>
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onPress={() => {
                    onApply(normalizeFilters(draft));
                    close();
                  }}
                >
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[] | Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  return (
    <Select value={value} onChange={(nextValue) => onChange(String(nextValue ?? "all"))}>
      <SelectLabel>{label}</SelectLabel>
      <SelectTrigger size="sm" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem id="all" textValue="Tất cả">
          Tất cả
        </SelectItem>
        {normalizedOptions.map((option) => (
          <SelectItem key={option.value} id={option.value} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function mergeOptions(options?: DemographicsFilterOptions): DemographicsFilterOptions {
  return {
    provinces: options?.provinces?.length ? options.provinces : fallbackOptions.provinces,
    majors: options?.majors?.length ? options.majors : fallbackOptions.majors,
    stages: options?.stages?.length ? options.stages : fallbackOptions.stages,
    priorities: options?.priorities?.length ? options.priorities : fallbackOptions.priorities,
    owners: options?.owners ?? fallbackOptions.owners,
    sourceGroups: options?.sourceGroups?.length ? options.sourceGroups : fallbackOptions.sourceGroups,
  };
}

function countActiveFilters(filters: DirectorDemographicsOverviewParams): number {
  const dimensionCount = filterKeys.filter((key) => Boolean(filters[key])).length;
  const periodCount = filters.period && filters.period !== "season" ? 1 : 0;
  return dimensionCount + periodCount;
}

function normalizeFilters(filters: DirectorDemographicsOverviewParams): DirectorDemographicsOverviewParams {
  const nextFilters = { ...filters, period: filters.period ?? "season" };

  for (const key of filterKeys) {
    if (!nextFilters[key] || nextFilters[key] === "all") {
      delete nextFilters[key];
    }
  }

  return nextFilters;
}
