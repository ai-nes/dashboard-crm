"use client";

import { Filter, Search1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import { Select, SelectContent, SelectItem, SelectIndicator, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type {
  StudentAssignmentStatus,
  StudentJourneyStage,
} from "@/services/api/students/types";

interface StudentListToolbarProps {
  query: string;
  stage: StudentJourneyStage | "all";
  province: string;
  assignmentStatus: StudentAssignmentStatus | "all";
  resultCount: number;
  onQueryChange: (value: string) => void;
  onStageChange: (value: StudentJourneyStage | "all") => void;
  onProvinceChange: (value: string) => void;
  onAssignmentStatusChange: (
    value: StudentAssignmentStatus | "all",
  ) => void;
  onReset: () => void;
}

const stages: (StudentJourneyStage | "all")[] = ["all", "Quan tâm", "Tìm hiểu", "Tư vấn", "Ứng tuyển", "Nhập học"];
const assignmentStatuses: (StudentAssignmentStatus | "all")[] = ["all", "unassigned", "assigned"];

function getStageLabel(stage: StudentJourneyStage | "all") {
  return stage === "all" ? "Tất cả giai đoạn" : stage;
}

export default function StudentListToolbar({ query, stage, province, assignmentStatus, resultCount, onQueryChange, onStageChange, onProvinceChange, onAssignmentStatusChange, onReset }: StudentListToolbarProps) {
  const hasFilter = query.trim().length > 0 || stage !== "all" || province !== "all" || assignmentStatus !== "all";
  const provinceOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Student",
    fieldname: "province",
    limit: 100,
  });
  const provinceOptions = provinceOptionsQuery.data?.options ?? [];

  return (
    <div className="border-b border-card-border p-4 lg:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-row">
          <InputGroup className="h-8 min-w-0 md:max-w-sm">
            <InputGroupAddon>
              <Search1 size={17} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput className="py-1" aria-label="Tìm học sinh" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm theo tên, mã, trường, tư vấn viên…" />
          </InputGroup>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <Select className="min-w-0 sm:w-44" value={province} onChange={(value) => onProvinceChange(String(value))} aria-label="Lọc theo các tỉnh">
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id="all" textValue="Tất cả các tỉnh">Tất cả các tỉnh</SelectItem>
                {provinceOptions.map((item) => <SelectItem key={item.value} id={item.value} textValue={item.label}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select className="min-w-0 sm:w-44" value={assignmentStatus} onChange={(value) => onAssignmentStatusChange(value as StudentAssignmentStatus | "all")} aria-label="Lọc theo trạng thái phân công">
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {assignmentStatuses.map((item) => {
                  const label = item === "all"
                    ? "Tất cả"
                    : item === "assigned"
                      ? "Đã phân công"
                      : "Chưa phân công";

                  return <SelectItem key={item} id={item} textValue={label}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p className="text-xs text-text-tertiary"><span className="font-semibold text-text-primary">{resultCount}</span> hồ sơ hiển thị</p>
          {hasFilter && <Button size="sm" variant="ghost" appearance="ghost" onPress={onReset}>Xóa bộ lọc</Button>}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 border-t border-card-border pt-3 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Filter size={15} className="text-icon-tertiary" aria-hidden="true" />
          <span>Giai đoạn</span>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo giai đoạn">
          {stages.map((item) => {
            const isSelected = stage === item;

            return (
              <Button
                key={item}
                size="sm"
                variant="primary"
                appearance={isSelected ? "fill" : "outline"}
                aria-pressed={isSelected}
                onPress={() => onStageChange(item)}
              >
                {getStageLabel(item)}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
