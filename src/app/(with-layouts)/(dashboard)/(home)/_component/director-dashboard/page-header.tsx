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

type FilterValue = "all" | "hanoi" | "hcm" | "danang";

const CAMPUS_LABELS: Record<FilterValue, string> = {
  all: "Tất cả cơ sở",
  hanoi: "Hà Nội",
  hcm: "TP. Hồ Chí Minh",
  danang: "Đà Nẵng",
};

const PERIOD_LABELS: Record<string, string> = {
  today: "Hôm nay",
  "this-week": "Tuần này",
  "this-month": "Tháng này",
  "admission-year": "Niên khóa 2026",
};

export default function DirectorPageHeader() {
  const [campus, setCampus] = useState<FilterValue>("all");
  const [period, setPeriod] = useState("this-month");

  return (
    <header className="px-2 lg:px-6">
      <div className="rounded-2xl border border-card-border bg-background-gray-primary p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-medium text-badge-success-text">
              <span className="size-1.5 animate-pulse rounded-full bg-badge-success-icon-color" />
              Tổng quan trực tuyến
            </span>
            <span className="text-xs text-text-tertiary">Cập nhật 2 phút trước</span>
          </div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
            Tổng quan tuyển sinh
          </h1>
          <p className="max-w-2xl text-sm leading-5 text-text-tertiary">
            Toàn cảnh tuyển sinh, hiệu suất vận hành và các quyết định cần ưu tiên hôm nay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:shrink-0">
          <Select
            className="w-auto"
            value={campus}
            onChange={(value) => setCampus(value as FilterValue)}
            aria-label="Lọc theo cơ sở"
          >
            <SelectTrigger size="sm" className="min-w-36">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all" textValue="Tất cả cơ sở">
                Tất cả cơ sở
              </SelectItem>
              <SelectItem id="hanoi" textValue="Hà Nội">
                Hà Nội
              </SelectItem>
              <SelectItem id="hcm" textValue="TP. Hồ Chí Minh">
                TP. Hồ Chí Minh
              </SelectItem>
              <SelectItem id="danang" textValue="Đà Nẵng">
                Đà Nẵng
              </SelectItem>
            </SelectContent>
          </Select>

          <Select className="w-auto" value={period} onChange={setPeriod} aria-label="Lọc theo thời gian">
            <SelectTrigger size="sm" className="min-w-36">
              <Calendar size={16} className="shrink-0 text-icon-tertiary" />
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="today" textValue="Hôm nay">
                Hôm nay
              </SelectItem>
              <SelectItem id="this-week" textValue="Tuần này">
                Tuần này
              </SelectItem>
              <SelectItem id="this-month" textValue="Tháng này">
                Tháng này
              </SelectItem>
              <SelectItem id="admission-year" textValue="Niên khóa 2026">
                Niên khóa 2026
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="primary" size="md" className="gap-2">
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
        <span>{CAMPUS_LABELS[campus]}</span>
        <span className="hidden h-3 w-px bg-card-border sm:block" />
        <span>{PERIOD_LABELS[period]}</span>
      </div>
    </header>
  );
}
