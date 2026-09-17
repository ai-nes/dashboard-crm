"use client";

import { Reload } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import {
  DEFAULT_LEAD_SALE_FILTERS,
  LEAD_SALE_FILTER_OPTIONS,
  type LeadSaleDashboardFilters,
} from "./lead-sale-dashboard.types";

interface DashboardFiltersProps {
  filters: LeadSaleDashboardFilters;
  onChange: (filters: LeadSaleDashboardFilters) => void;
}

export default function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const updateFilter = (key: keyof LeadSaleDashboardFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onChange(DEFAULT_LEAD_SALE_FILTERS);
  };

  return (
    <section
      aria-label="Bộ lọc dashboard Lead Sales"
      className="rounded-2xl border border-card-border bg-card-background p-3 shadow-xs sm:p-4"
    >
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          appearance="ghost"
          onPress={resetFilters}
          className="self-start px-2 text-xs text-text-secondary xl:self-auto"
        >
          <Reload size={14} aria-hidden="true" />
          Đặt lại
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelect
          ariaLabel="Kỳ tuyển sinh"
          options={LEAD_SALE_FILTER_OPTIONS.period}
          value={filters.period}
          onChange={(value) => updateFilter("period", value)}
        />
        <FilterSelect
          ariaLabel="Chương trình"
          options={LEAD_SALE_FILTER_OPTIONS.program}
          value={filters.program}
          onChange={(value) => updateFilter("program", value)}
        />
        <FilterSelect
          ariaLabel="Nguồn Lead"
          options={LEAD_SALE_FILTER_OPTIONS.source}
          value={filters.source}
          onChange={(value) => updateFilter("source", value)}
        />
        <FilterSelect
          ariaLabel="Khu vực"
          options={LEAD_SALE_FILTER_OPTIONS.region}
          value={filters.region}
          onChange={(value) => updateFilter("region", value)}
        />
      </div>
    </section>
  );
}

function FilterSelect({
  ariaLabel,
  options,
  value,
  onChange,
}: {
  ariaLabel: string;
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      aria-label={ariaLabel}
      items={options}
      value={value}
      onChange={(nextValue) => onChange(String(nextValue))}
    >
      <SelectTrigger size="sm" className="h-10 w-full text-xs sm:text-sm">
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} id={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
