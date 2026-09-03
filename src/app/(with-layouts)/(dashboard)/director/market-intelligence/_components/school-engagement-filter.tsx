"use client";

import { useState } from "react";
import { Filter, Megaphone1, Rocket1 } from "@tailgrids/icons";
import { DialogTrigger } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";
import type { SchoolClassification } from "@/services/api/schools/types";

export interface SchoolEngagementOption {
  id: string;
  name: string;
  type: "event" | "campaign";
  schoolCount: number;
}

export type SchoolPotentialBand = "all" | "80-plus" | "60-to-79" | "under-60";

export interface SchoolMarkerFilters {
  schoolGroups: SchoolPriorityGroup[];
  engagementIds: string[];
  potentialBand: SchoolPotentialBand;
}

export type SchoolPriorityGroup = SchoolClassification;

interface SchoolEngagementFilterProps {
  onChange: (filters: SchoolMarkerFilters) => void;
  options: SchoolEngagementOption[];
  value: SchoolMarkerFilters;
}

const potentialBands: Array<{ value: SchoolPotentialBand; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "80-plus", label: "Từ 80 điểm" },
  { value: "60-to-79", label: "60 – 79 điểm" },
  { value: "under-60", label: "Dưới 60 điểm" },
];
const schoolGroups: Array<{ label: string; value: SchoolPriorityGroup }> = [
  { value: "Trọng điểm", label: "Trọng điểm" },
  { value: "Mở rộng", label: "Mở rộng" },
  { value: "Duy trì", label: "Duy trì" },
  { value: "Sàng lọc", label: "Sàng lọc" },
];

export default function SchoolEngagementFilter({
  onChange,
  options,
  value,
}: SchoolEngagementFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<SchoolMarkerFilters>(value);
  const activeCount =
    Number(value.potentialBand !== "all") +
    value.schoolGroups.length +
    value.engagementIds.length;
  const toggle = <T,>(items: T[], item: T) =>
    items.includes(item)
      ? items.filter((entry) => entry !== item)
      : [...items, item];
  const openChange = (open: boolean) => {
    if (open) setDraft(value);
    setIsOpen(open);
  };
  const reset = () =>
    setDraft({ schoolGroups: [], engagementIds: [], potentialBand: "all" });
  const apply = () => {
    onChange(draft);
    setIsOpen(false);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={openChange}>
      <Button
        appearance="outline"
        className="relative"
        size="xs"
        variant="primary"
      >
        <Filter size={13} />
        Bộ lọc
        {activeCount > 0 && (
          <span className="-mr-1 rounded-full bg-brand-500 px-1.5 py-px text-[10px] font-bold text-white-100">
            {activeCount}
          </span>
        )}
      </Button>
      <Popover
        aria-label="Bộ lọc marker trường"
        className="w-[min(23rem,calc(100vw-2rem))] p-0"
        placement="bottom start"
      >
        <div className="max-h-[min(32rem,calc(100vh-8rem))] overflow-y-auto p-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Lọc trường trên bản đồ
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              Áp dụng đồng thời cho map và danh sách.
            </p>
          </div>
          <FilterSection title="Điểm cơ hội">
            <div className="grid grid-cols-2 gap-2">
              {potentialBands.map((band) => (
                <FilterChip
                  active={draft.potentialBand === band.value}
                  key={band.value}
                  label={band.label}
                  onPress={() =>
                    setDraft({ ...draft, potentialBand: band.value })
                  }
                />
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Loại trường">
            <div className="flex flex-wrap gap-2">
              {schoolGroups.map((schoolGroup) => (
                <FilterChip
                  active={draft.schoolGroups.includes(schoolGroup.value)}
                  key={schoolGroup.value}
                  label={schoolGroup.label}
                  onPress={() =>
                    setDraft({
                      ...draft,
                      schoolGroups: toggle(
                        draft.schoolGroups,
                        schoolGroup.value,
                      ),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Sự kiện & chiến dịch">
            {options.length ? (
              <div className="space-y-1.5">
                {options.map((option) => {
                  const Icon =
                    option.type === "campaign" ? Rocket1 : Megaphone1;
                  const active = draft.engagementIds.includes(option.id);
                  return (
                    <button
                      aria-pressed={active}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-button-primary-focus-ring ${active ? "bg-brand-500/10 font-medium text-brand-600" : "text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"}`}
                      key={option.id}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          engagementIds: toggle(draft.engagementIds, option.id),
                        })
                      }
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="shrink-0" size={13} />
                        <span className="truncate">{option.name}</span>
                      </span>
                      <span className="shrink-0 text-[10px] text-text-tertiary">
                        {option.schoolCount} trường
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg bg-background-soft-50 px-3 py-2.5 text-xs text-text-secondary">
                CRM chưa có dữ liệu trường tham gia sự kiện hoặc chiến dịch.
              </p>
            )}
          </FilterSection>
        </div>
        <div className="flex items-center justify-between border-t border-card-border px-4 py-3">
          <Button
            appearance="ghost"
            onPress={reset}
            size="xs"
            variant="primary"
          >
            Xóa bộ lọc
          </Button>
          <Button onPress={apply} size="xs" variant="primary">
            Áp dụng
          </Button>
        </div>
      </Popover>
    </DialogTrigger>
  );
}

function FilterSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="mt-5">
      <h4 className="mb-2 text-xs font-semibold text-text-primary">{title}</h4>
      {children}
    </section>
  );
}
function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-button-primary-focus-ring ${active ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-card-border bg-card-background text-text-secondary hover:bg-background-soft-50 hover:text-text-primary"}`}
      onClick={onPress}
      type="button"
    >
      {label}
    </button>
  );
}
