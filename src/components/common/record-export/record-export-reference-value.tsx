"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SegmentFilterValuePicker } from "@/components/segments/segment-filter-value-picker";
import { useLimitInfinityScroll } from "@/hooks/use-limit-infinity-scroll";
import { nestRequest } from "@/services/api/nest/nest-client";

type Option = { value: string; label: string };
const getOptions = (response: { options: Option[] }) => response.options;

export function RecordExportReferenceValue({
  ownerId,
  label,
  optionField,
  value,
  onChange,
}: {
  ownerId: string;
  label: string;
  optionField: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const queryClient = useQueryClient();
  const labelsKey = ["export-reference-labels", optionField];
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(
    () => queryClient.getQueryData<Option[]>(labelsKey) ?? [],
  );
  const query = useLimitInfinityScroll({
    queryKey: ["export-reference-options", optionField, search],
    fetchPage: ({ limit }, signal) =>
      nestRequest<{ options: Option[] }>(
        `/api/v1/options/${encodeURIComponent(optionField)}`,
        { signal, query: { search, limit } },
      ),
    getItems: getOptions,
    enabled: isOpen,
  });
  const options = query.data?.options ?? [];
  return (
    <SegmentFilterValuePicker
      className="h-11"
      ownerId={ownerId}
      label={label}
      value={value}
      options={options.map(({ value, label }) => ({ value, label }))}
      selectedOptions={selectedOptions}
      onOpenChange={setIsOpen}
      pagination={{
        ...query.pagination,
        isError: query.isError,
        onSearchChange: setSearch,
      }}
      onRetry={() => {
        void query.refetch();
      }}
      onChange={(next) => {
        const known = [...selectedOptions, ...options];
        const labels = next.flatMap((value) => {
          const option = known.find((option) => option.value === value);
          return option ? [option] : [];
        });
        setSelectedOptions(labels);
        const cached = queryClient.getQueryData<Option[]>(labelsKey) ?? [];
        queryClient.setQueryData(
          labelsKey,
          Array.from(
            new Map(
              [...cached, ...known].map((option) => [option.value, option]),
            ).values(),
          ),
        );
        onChange(next);
      }}
    />
  );
}
