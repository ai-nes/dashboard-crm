"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/tailgrids/core/select";
import { TableRow, TableCell } from "@/components/tailgrids/core/table";
import { studentAiKeys } from "@/hooks/use-student-ai";
import { NestApiError } from "@/services/api/nest/nest-client";
import {
  updateStudentAcademicResult,
  createStudentAcademicResult,
  type StudentAcademicResult,
  type StudentAcademicResultEdit,
} from "@/services/api/student-academic-results";

export default function StudentAcademicResultEditRow({
  studentId,
  result,
  onClose,
  isNew = false,
}: {
  studentId: string;
  result: StudentAcademicResult;
  onClose: () => void;
  isNew?: boolean;
}) {
  const client = useQueryClient();
  const [grade, setGrade] = useState(result.grade ?? "");
  const [year, setYear] = useState(result.school_year);
  const [rank, setRank] = useState(result.academic_rank ?? "");
  const [gpa, setGpa] = useState(result.gpa?.toString() ?? "");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (edit: StudentAcademicResultEdit) =>
      isNew
        ? createStudentAcademicResult(studentId, {
            ...edit,
            schoolYear: year.trim(),
          })
        : updateStudentAcademicResult(studentId, result.id, edit),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ["student-academic-results", studentId],
        }),
        client.invalidateQueries({
          queryKey: studentAiKeys.overview(studentId),
        }),
      ]);
      toast.success("Đã cập nhật học bạ.");
      onClose();
    },
    onError: (reason) => {
      const message =
        reason instanceof NestApiError &&
        reason.code === "DUPLICATE_ACADEMIC_RESULT"
          ? "Năm học này đã có kết quả. Hãy sửa dòng hiện có."
          : "Không thể lưu học bạ. Vui lòng kiểm tra quyền chỉnh sửa và thử lại.";
      setError(message);
      toast.error(message);
    },
  });
  const save = () => {
    if (isNew && !year.trim()) {
      setError("Vui lòng nhập năm học.");
      return;
    }
    const value = gpa.trim() === "" ? null : Number(gpa.replace(",", "."));
    if (
      value !== null &&
      (!Number.isFinite(value) || value < 0 || value > 10)
    ) {
      setError("Điểm trung bình phải từ 0 đến 10.");
      return;
    }
    setError("");
    mutation.mutate({
      grade: (grade || null) as StudentAcademicResultEdit["grade"],
      academicRank: (rank || null) as StudentAcademicResultEdit["academicRank"],
      gpa: value,
    });
  };
  return (
    <>
      <TableRow>
        <TableCell>
          {isNew ? (
            <Input
              aria-label="Năm học mới"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              maxLength={16}
              placeholder="2025-2026"
              disabled={mutation.isPending}
              className="w-36"
            />
          ) : (
            result.school_year
          )}
        </TableCell>
        <TableCell>
          <AcademicSelect
            label={`Lớp năm ${result.school_year}`}
            value={grade}
            onChange={setGrade}
            options={["10", "11", "12"]}
            disabled={mutation.isPending}
          />
        </TableCell>
        <TableCell>
          <Input
            aria-label={`Điểm trung bình năm ${result.school_year}`}
            inputMode="decimal"
            value={gpa}
            onChange={(event) => setGpa(event.target.value)}
            maxLength={8}
            placeholder="0–10"
            disabled={mutation.isPending}
            className="w-28"
          />
        </TableCell>
        <TableCell>
          <AcademicSelect
            label={`Học lực năm ${result.school_year}`}
            value={rank}
            onChange={setRank}
            options={["Giỏi", "Khá", "Trung bình", "Yếu"]}
            disabled={mutation.isPending}
          />
        </TableCell>
        <TableCell>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              appearance="outline"
              isDisabled={mutation.isPending}
              onPress={onClose}
            >
              Hủy
            </Button>
            <Button size="sm" isDisabled={mutation.isPending} onPress={save}>
              {mutation.isPending ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {error && (
        <TableRow>
          <TableCell colSpan={5}>
            <p role="alert" className="text-sm text-error-500">
              {error}
            </p>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
function AcademicSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled: boolean;
}) {
  return (
    <Select
      aria-label={label}
      value={value || "none"}
      onChange={(key) => onChange(key === "none" ? "" : String(key))}
      isDisabled={disabled}
      className="min-w-24"
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem id="none">Chưa có thông tin</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} id={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
