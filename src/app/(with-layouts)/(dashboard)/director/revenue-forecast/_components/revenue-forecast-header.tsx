"use client";

import { Calendar, Download1, Filter } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectIndicator,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

type Scope = "all" | "hcm" | "dong-nai" | "north";

const SCOPE_LABELS: Record<Scope, string> = {
  all: "Tất cả khu vực",
  hcm: "TP. Hồ Chí Minh",
  "dong-nai": "Đồng Nai",
  north: "Miền Bắc",
};

const PERIOD_LABELS = {
  "this-month": "Tháng này",
  "this-quarter": "Quý này",
  "admission-year": "Niên khóa 2026",
};

type Period = keyof typeof PERIOD_LABELS;

export default function RevenueForecastHeader() {
  const [scope, setScope] = useState<Scope>("all");
  const [period, setPeriod] = useState<Period>("admission-year");

  return (
    <header className="min-w-0 px-2 lg:px-6">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-background-gray-primary p-5 lg:p-6">
        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-medium text-badge-primary-text">
                <span className="size-1.5 rounded-full bg-badge-primary-icon-color" />
                Mô hình tài chính tuyển sinh
              </span>
              <span className="text-xs text-text-tertiary">Cập nhật 2 phút trước</span>
            </div>
            <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Doanh thu & dự báo</h1>
            <p className="max-w-2xl text-sm leading-5 text-text-tertiary">
              Theo dõi doanh thu thực tế, dự báo cuối kỳ và mô phỏng các đòn bẩy tăng trưởng tuyển sinh.
            </p>
          </div>

          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 xl:shrink-0">
            <Select
              className="w-full sm:w-auto"
              value={scope}
              onChange={(value) => setScope(value as Scope)}
              aria-label="Lọc doanh thu theo khu vực"
            >
              <SelectTrigger size="sm" className="w-full min-w-36 sm:w-auto">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SCOPE_LABELS).map(([id, label]) => (
                  <SelectItem key={id} id={id} textValue={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              className="w-full sm:w-auto"
              value={period}
              onChange={(value) => setPeriod(value as Period)}
              aria-label="Lọc doanh thu theo thời gian"
            >
              <SelectTrigger size="sm" className="w-full min-w-36 sm:w-auto">
                <Calendar size={16} className="shrink-0 text-icon-tertiary" />
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIOD_LABELS).map(([id, label]) => (
                  <SelectItem key={id} id={id} textValue={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="primary" size="md" className="w-full gap-2 sm:w-auto">
              <Download1 size={16} />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-card-border bg-background-gray-primary px-4 py-3 text-xs text-text-tertiary">
        <span className="flex items-center gap-2 font-medium text-text-secondary">
          <Filter size={14} className="text-icon-tertiary" />
          Bộ lọc đang áp dụng
        </span>
        <span>Niên khóa 2026</span>
        <span className="hidden h-3 w-px bg-card-border sm:block" />
        <span>{SCOPE_LABELS[scope]}</span>
        <span className="hidden h-3 w-px bg-card-border sm:block" />
        <span>{PERIOD_LABELS[period]}</span>
      </div>
    </header>
  );
}
