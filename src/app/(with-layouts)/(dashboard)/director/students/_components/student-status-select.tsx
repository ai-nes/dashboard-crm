import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { StudentStatus } from "@/services/api/students/types";
import { cn } from "@/utils/cn";

import {
  getStudentStatusOptions,
  studentStatusLabel,
  studentStatusTriggerClass,
} from "./student-status";

interface StudentStatusSelectProps {
  studentName: string;
  value: StudentStatus;
  onChange: (status: StudentStatus) => void;
  className?: string;
  isDisabled?: boolean;
}

export default function StudentStatusSelect({
  studentName,
  value,
  onChange,
  className,
  isDisabled,
}: StudentStatusSelectProps) {
  const availableOptions = getStudentStatusOptions(value);

  return (
    <Select
      value={value}
      isDisabled={isDisabled || availableOptions.length === 1}
      onChange={(nextValue) => onChange(String(nextValue) as StudentStatus)}
      aria-label={`Đổi trạng thái học sinh ${studentName}`}
      className={cn("w-fit min-w-32", className)}
    >
      <SelectTrigger
        size="sm"
        className={cn("w-full", studentStatusTriggerClass[value])}
      >
        <SelectValue>{studentStatusLabel[value]}</SelectValue>
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent className="min-w-44">
        {availableOptions.map((option) => (
          <SelectItem
            key={option}
            id={option}
            textValue={studentStatusLabel[option]}
            className="whitespace-nowrap"
          >
            {studentStatusLabel[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
