"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { Granularity } from "@/services/api/saas";
import type { PageHeaderProps } from "./types";

export default function PageHeader({ granularity, onGranularityChange }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">SaaS</h1>
        <p className="text-sm leading-5 text-text-tertiary">
          Monitor subscriptions, revenue, customer growth, and product performance.
        </p>
      </div>

      <Select
        onChange={(value) => onGranularityChange(value as Granularity)}
        value={granularity}
        defaultValue="monthly"
        aria-label="Select time range"
      >
        <SelectTrigger size="sm">
          <SelectValue />
          <SelectIndicator className="text-button-primary-outline-text" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem textValue="monthly" id="monthly">
            Monthly
          </SelectItem>
          <SelectItem textValue="yearly" id="yearly">
            Yearly
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
