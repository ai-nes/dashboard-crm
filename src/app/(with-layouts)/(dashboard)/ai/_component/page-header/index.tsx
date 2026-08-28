"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { AiGranularity } from "@/services/api/ai";

type PageHeaderProps = {
  granularity: AiGranularity;
  setGranularity: (value: AiGranularity) => void;
};

export default function PageHeader({ granularity, setGranularity }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 px-2 sm:flex-row sm:items-center lg:px-6">
      <div>
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">AI</h1>
        <p className="text-sm leading-5 text-text-tertiary">
          Manage agents, monitor usage, and optimize workflows.
        </p>
      </div>

      <Select
        onChange={(value) => setGranularity(value as AiGranularity)}
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
