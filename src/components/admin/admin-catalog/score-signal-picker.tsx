"use client";

import { useMemo, useState } from "react";

import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";
import { useScoreSignalsQuery } from "@/hooks/use-admin-catalog-queries";
import type { ScoreSignal } from "@/services/api/admin-catalog";

interface ScoreSignalPickerProps {
  value?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  allowedCategories?: readonly string[];
}

function isSignalCategoryAllowed(
  signal: ScoreSignal,
  allowedCategories?: readonly string[],
): boolean {
  return (
    !allowedCategories?.length ||
    allowedCategories.some(
      (category) =>
        category.trim().toLowerCase() === signal.category.trim().toLowerCase(),
    )
  );
}

export default function ScoreSignalPicker({
  value = "",
  onChange,
  isDisabled = false,
  allowedCategories,
}: ScoreSignalPickerProps) {
  const [search, setSearch] = useState("");
  const query = useScoreSignalsQuery({
    search,
    start: 0,
    pageLength: 100,
  });

  const signals = useMemo(() => {
    const rows = query.data?.signals ?? [];
    const filteredRows = rows.filter(
      (signal) =>
        signal.name === value ||
        isSignalCategoryAllowed(signal, allowedCategories),
    );
    if (!value || filteredRows.some((signal) => signal.name === value)) {
      return filteredRows;
    }
    return [
      {
        name: value,
        signal_key: value,
        label: value,
        category: "",
        signal_type: "",
        is_active: false,
        description: "Tín hiệu hiện không có trong danh sách đang tải.",
      } satisfies ScoreSignal,
      ...filteredRows,
    ];
  }, [allowedCategories, query.data?.signals, value]);

  const categoryHint = allowedCategories?.join(" / ");

  return (
    <div className="space-y-1">
      <Combobox
        value={value || null}
        onChange={(key) => {
          setSearch("");
          onChange(key?.toString() ?? "");
        }}
        onInputChange={setSearch}
        placeholder="Tìm theo tên hoặc signal key…"
        emptyMessage={
          query.isPending
            ? "Đang tải tín hiệu…"
            : categoryHint
              ? `Không có tín hiệu thuộc nhóm ${categoryHint}.`
              : "Không tìm thấy tín hiệu phù hợp."
        }
        aria-label="Chọn tín hiệu chấm điểm"
        isDisabled={isDisabled}
      >
        {signals.map((signal) => (
          <ComboboxItem
            key={signal.name}
            id={signal.name}
            textValue={`${signal.label} ${signal.signal_key} ${signal.category} ${signal.signal_type}`}
            isDisabled={
              !signal.is_active ||
              !isSignalCategoryAllowed(signal, allowedCategories)
            }
          >
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium text-text-primary">
                  {signal.label}
                </span>
                <span
                  className={
                    signal.is_active &&
                    isSignalCategoryAllowed(signal, allowedCategories)
                      ? "shrink-0 text-[11px] text-success-600 dark:text-success-400"
                      : "shrink-0 text-[11px] text-text-tertiary"
                  }
                >
                  {!signal.is_active
                    ? "Đã tắt"
                    : !isSignalCategoryAllowed(signal, allowedCategories)
                      ? "Khác loại"
                      : "Đang dùng"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-text-tertiary">
                {signal.signal_key}
                {signal.category ? ` · ${signal.category}` : ""}
                {signal.signal_type ? ` · ${signal.signal_type}` : ""}
              </p>
            </div>
          </ComboboxItem>
        ))}
      </Combobox>
      {query.isError ? (
        <div className="flex items-center justify-between gap-2 text-xs text-danger-600 dark:text-danger-400">
          <span>Không thể tải danh sách tín hiệu.</span>
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={() => void query.refetch()}
          >
            Thử lại
          </button>
        </div>
      ) : null}
    </div>
  );
}
