"use client";

import { Calendar } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";

import type { ResultsDataset, ResultsPeriod } from "./data";

interface ResultsHeaderProps {
  data: ResultsDataset;
  period: ResultsPeriod;
  onPeriodChange: (period: ResultsPeriod) => void;
}

export default function ResultsHeader({ data, period, onPeriodChange }: ResultsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-sm sm:flex-row sm:items-end sm:justify-between lg:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge color="primary">CTV SALE · HIỆU SUẤT</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
            <Calendar size={14} aria-hidden="true" />
            {data.dateLabel}
          </span>
        </div>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.5px] text-text-primary">
          Kết quả của tôi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Theo dõi tiến độ tư vấn, tỷ lệ chuyển đổi và chất lượng xử lý hồ sơ.
        </p>
      </div>

      <Select
        value={period}
        onChange={(value) => onPeriodChange(value as ResultsPeriod)}
        className="w-fit shrink-0"
        aria-label="Chọn khoảng thời gian xem kết quả"
      >
        <SelectTrigger size="sm" className="min-w-32">
          <SelectValue />
          <SelectIndicator className="text-button-primary-outline-text" />
        </SelectTrigger>
        <SelectContent className="min-w-32">
          <SelectItem id="current" textValue="Tháng này" className="whitespace-nowrap">Tháng này</SelectItem>
          <SelectItem id="previous" textValue="Tháng trước" className="whitespace-nowrap">Tháng trước</SelectItem>
        </SelectContent>
      </Select>
    </header>
  );
}
