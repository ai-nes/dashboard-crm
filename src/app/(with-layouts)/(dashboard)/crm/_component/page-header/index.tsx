"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useState } from "react";
import type { ReportPeriod, ReportPeriodOption } from "./types";

const PERIOD_OPTIONS: ReportPeriodOption[] = [
  { id: "last-week", label: "Last Week" },
  { id: "last-month", label: "Last Month" },
  { id: "last-year", label: "Last Year" },
];

export default function CrmPageHeader() {
  const [period, setPeriod] = useState<ReportPeriod>("last-month");

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">CRM</h1>
        <p className="text-sm leading-5 text-text-tertiary">
          Analyze trends, track growth, and make data-driven decisions.
        </p>
      </div>

      <Select
        onChange={(value) => setPeriod(value as ReportPeriod)}
        value={period}
        defaultValue="last-month"
        aria-label="Select report period"
      >
        <SelectTrigger size="sm">
          <SelectValue />
          <SelectIndicator className="text-button-primary-outline-text" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.id} textValue={option.label} id={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
