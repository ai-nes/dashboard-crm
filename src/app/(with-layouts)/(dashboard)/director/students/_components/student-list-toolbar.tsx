"use client";

import { Filter, Search1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectIndicator,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type {
  StudentAssignmentStatus,
  StudentStatus,
} from "@/services/api/students/types";

import { studentStatusLabel, studentStatusOptions } from "./student-status";
import { getSouthernProvinceOptions } from "./student-province-options";

interface StudentListToolbarProps {
  query: string;
  studentStatus: StudentStatus | "all";
  province: string;
  assignmentStatus: StudentAssignmentStatus | "all";
  resultCount: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StudentStatus | "all") => void;
  onProvinceChange: (value: string) => void;
  onAssignmentStatusChange: (value: StudentAssignmentStatus | "all") => void;
  onReset: () => void;
}

const assignmentStatuses: (StudentAssignmentStatus | "all")[] = [
  "all",
  "unassigned",
  "assigned",
];
export default function StudentListToolbar({
  query,
  studentStatus,
  province,
  assignmentStatus,
  resultCount,
  onQueryChange,
  onStatusChange,
  onProvinceChange,
  onAssignmentStatusChange,
  onReset,
}: StudentListToolbarProps) {
  const hasFilter =
    query.trim().length > 0 ||
    studentStatus !== "all" ||
    province !== "all" ||
    assignmentStatus !== "all";
  const provinceOptionsQuery = useStudentSchoolFieldOptions({
    doctype: "CRM Lead",
    fieldname: "province",
    limit: 100,
  });
  const provinceOptions = getSouthernProvinceOptions(
    provinceOptionsQuery.data?.options ?? [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-row md:flex-wrap">
          <InputGroup className="h-8 min-w-0 md:max-w-md">
            <InputGroupAddon>
              <Search1 size={17} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              className="py-1"
              aria-label="Tìm học sinh"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Tìm theo tên, mã, trường, tư vấn viên…"
            />
          </InputGroup>
          <Select
            className="min-w-0 sm:w-52"
            value={studentStatus}
            onChange={(value) => onStatusChange(value as StudentStatus | "all")}
            aria-label="Lọc theo trạng thái học sinh"
          >
            <SelectTrigger size="sm" className="w-full">
              <Filter size={15} className="shrink-0 text-icon-tertiary" />
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all" textValue="Tất cả trạng thái">
                Tất cả trạng thái
              </SelectItem>
              {studentStatusOptions.map((item) => (
                <SelectItem
                  key={item}
                  id={item}
                  textValue={studentStatusLabel[item]}
                >
                  {studentStatusLabel[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            className="min-w-0 sm:w-44"
            value={province}
            onChange={(value) => onProvinceChange(String(value))}
            aria-label="Lọc theo các tỉnh"
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all" textValue="Tất cả các tỉnh">
                Tất cả các tỉnh
              </SelectItem>
              {provinceOptions.map((item) => (
                <SelectItem
                  key={item.value}
                  id={item.value}
                  textValue={item.label}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            className="min-w-0 sm:w-44"
            value={assignmentStatus}
            onChange={(value) =>
              onAssignmentStatusChange(value as StudentAssignmentStatus | "all")
            }
            aria-label="Lọc theo trạng thái phân công"
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {assignmentStatuses.map((item) => {
                const label =
                  item === "all"
                    ? "Tất cả"
                    : item === "assigned"
                      ? "Đã phân công"
                      : "Chưa phân công";

                return (
                  <SelectItem key={item} id={item} textValue={label}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p className="text-xs text-text-tertiary">
            <span className="font-semibold text-text-primary">
              {resultCount}
            </span>{" "}
            hồ sơ hiển thị
          </p>
          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              appearance="ghost"
              onPress={onReset}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
