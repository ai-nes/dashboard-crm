"use client";

import { useMemo, useState } from "react";

import { Check, ChevronDown, Search1 } from "@tailgrids/icons";
import {
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Label } from "@/components/tailgrids/core/label";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { StudentListItem } from "@/services/api/students/types";

interface TaskStudentSelectProps {
  students: StudentListItem[];
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const SEARCH_THRESHOLD = 8;

function getStudentSearchText(student: StudentListItem): string {
  return `${student.name} ${student.code} ${student.major}`.toLocaleLowerCase(
    "vi-VN",
  );
}

function getStudentPlaceholder(
  students: StudentListItem[],
  isLoading: boolean,
): string {
  if (isLoading) return "Đang tải danh sách học sinh...";
  return students.length > 0 ? "Chọn học sinh" : "Chưa có học sinh";
}

function SearchableStudentSelect({
  students,
  value,
  onChange,
  isDisabled,
  isLoading,
}: TaskStudentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedStudent = students.find((student) => student.id === value);
  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    if (!normalizedQuery) return students;

    return students.filter((student) =>
      getStudentSearchText(student).includes(normalizedQuery),
    );
  }, [query, students]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setQuery("");
  };

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey === undefined) return;

    onChange(String(selectedKey));
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Label>Học sinh *</Label>
      <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Button
          appearance="outline"
          aria-label="Chọn học sinh liên kết với task"
          className="w-full justify-between border-card-border bg-button-primary-outline-background pr-2.5 pl-3 text-sm shadow-xs"
          isDisabled={isDisabled || isLoading}
        >
          <span className="truncate text-left">
            {isLoading
              ? "Đang tải danh sách học sinh..."
              : selectedStudent?.name ||
                getStudentPlaceholder(students, isLoading ?? false)}
          </span>
          <ChevronDown className="size-4 shrink-0 text-text-100" />
        </Button>
        <Popover
          placement="bottom start"
          className="w-(--trigger-width) overflow-hidden rounded-lg border border-card-border bg-background-white-secondary shadow-md"
        >
          <div className="border-b border-card-border p-2">
            <InputGroup>
              <InputGroupAddon className="px-2.5 text-text-tertiary">
                <Search1 size={16} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                aria-label="Tìm học sinh"
                placeholder="Tìm theo tên, mã hoặc ngành..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
          </div>
          <ListBox
            aria-label="Danh sách học sinh"
            className="max-h-56 overflow-y-auto p-1.5 outline-none"
            items={filteredStudents}
            selectedKeys={value ? new Set([value]) : new Set()}
            selectionMode="single"
            onSelectionChange={handleSelectionChange}
          >
            {(student) => (
              <ListBoxItem
                id={student.id}
                textValue={`${student.name} ${student.code} ${student.major}`}
                className="group/item relative flex w-full cursor-pointer items-center gap-3 rounded-md py-1 pr-7 pl-1.5 text-sm text-text-secondary outline-hidden select-none focus:bg-background-gray-secondary_alt focus:text-text-primary"
              >
                {({ isSelected }) => (
                  <>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium text-text-primary">
                        {student.name}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {student.major}
                      </span>
                    </span>
                    {isSelected && (
                      <span className="absolute right-1 flex size-5 items-center justify-center text-text-primary">
                        <Check className="size-5" />
                      </span>
                    )}
                  </>
                )}
              </ListBoxItem>
            )}
          </ListBox>
          {filteredStudents.length === 0 && (
            <p
              className="px-3 py-4 text-center text-sm text-text-tertiary"
              role="status"
            >
              Không tìm thấy học sinh phù hợp.
            </p>
          )}
        </Popover>
      </DialogTrigger>
    </div>
  );
}

export default function TaskStudentSelect(props: TaskStudentSelectProps) {
  if (props.students.length > SEARCH_THRESHOLD) {
    return <SearchableStudentSelect {...props} />;
  }

  return (
    <Select
      value={props.value}
      onChange={(value) => props.onChange(String(value))}
      aria-label="Chọn học sinh liên kết với task"
      placeholder={getStudentPlaceholder(
        props.students,
        props.isLoading ?? false,
      )}
      isDisabled={
        props.isLoading || props.students.length === 0 || props.isDisabled
      }
    >
      <SelectLabel>Học sinh *</SelectLabel>
      <SelectTrigger className="w-full">
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent>
        {props.students.map((student) => (
          <SelectItem
            key={student.id}
            id={student.id}
            textValue={`${student.name} · ${student.major}`}
          >
            <span className="flex min-w-0 flex-col">
              <span className="font-medium text-text-primary">
                {student.name}
              </span>
              <span className="text-xs text-text-tertiary">
                {student.major}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
