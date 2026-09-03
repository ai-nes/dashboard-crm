"use client";

import { Search1 } from "@tailgrids/icons";
import { Input } from "@/components/tailgrids/core/input";

interface SchoolSearchFieldProps {
  onChange: (query: string) => void;
  value: string;
}

export default function SchoolSearchField({ onChange, value }: SchoolSearchFieldProps) {
  return (
    <div className="relative mt-3">
      <Search1 className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-tertiary" />
      <Input
        aria-label="Tìm theo tên trường"
        className="h-9 w-full rounded-lg border-card-border bg-card-background py-1 pr-3 pl-8.5 text-xs text-text-primary placeholder:text-text-tertiary"
        id="market-school-search"
        name="school-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tìm theo tên trường..."
        value={value}
      />
    </div>
  );
}
