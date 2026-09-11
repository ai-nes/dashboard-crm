"use client";

import { Search1 } from "@tailgrids/icons";
import { Label } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import type { StudentStatus } from "@/services/api/students/types";
import {
  studentStatusLabel,
  studentStatusOptions,
} from "../../students/_components/student-status";
import { cn } from "@/utils/cn";

export type CampaignDetailStudentStatusFilter = StudentStatus | "all";

interface CampaignDetailStudentToolbarProps {
  query: string;
  status: CampaignDetailStudentStatusFilter;
  counts: Record<CampaignDetailStudentStatusFilter, number>;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: CampaignDetailStudentStatusFilter) => void;
}

export default function CampaignDetailStudentToolbar({
  query,
  status,
  counts,
  onQueryChange,
  onStatusChange,
}: CampaignDetailStudentToolbarProps) {
  return (
    <div className="space-y-3">
      <TextField
        value={query}
        onChange={onQueryChange}
        className="w-full sm:max-w-sm"
      >
        <Label className="sr-only">Tìm học sinh trong chiến dịch</Label>
        <div className="relative">
          <Search1
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-3 left-3 text-text-tertiary"
          />
          <Input
            placeholder="Tìm theo tên, mã, trường…"
            className="h-10 w-full pl-9 text-sm"
          />
        </div>
      </TextField>

      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Lọc học sinh theo trạng thái"
      >
        <Button
          appearance="ghost"
          size="sm"
          aria-pressed={status === "all"}
          className={cn(
            "text-text-secondary",
            status === "all" &&
              "bg-badge-primary-background text-badge-primary-text",
          )}
          onPress={() => onStatusChange("all")}
        >
          Tất cả <span className="tabular-nums opacity-70">{counts.all}</span>
        </Button>
        {studentStatusOptions.map((item) => (
          <Button
            key={item}
            appearance="ghost"
            size="sm"
            aria-pressed={status === item}
            className={cn(
              "text-text-secondary",
              status === item &&
                "bg-badge-primary-background text-badge-primary-text",
            )}
            onPress={() => onStatusChange(item)}
          >
            {studentStatusLabel[item]}{" "}
            <span className="tabular-nums opacity-70">{counts[item]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
