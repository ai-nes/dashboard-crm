"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { studentAiKeys } from "@/hooks/use-student-ai";
import {
  deleteStudentAcademicResult,
  type StudentAcademicResult,
} from "@/services/api/student-academic-results";

export default function StudentAcademicResultDelete({
  studentId,
  result,
  disabled,
}: {
  studentId: string;
  result: StudentAcademicResult;
  disabled: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteStudentAcademicResult(studentId, result.id),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ["student-academic-results", studentId],
        }),
        client.invalidateQueries({
          queryKey: studentAiKeys.overview(studentId),
        }),
      ]);
      toast.success("Đã xóa kết quả học tập.");
    },
    onError: () => {
      const message =
        "Không thể xóa kết quả học tập. Vui lòng kiểm tra quyền xóa và thử lại.";
      setError(message);
      toast.error(message);
    },
  });
  return (
    <div className="flex flex-col items-end gap-2">
      {confirming ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-xs text-text-secondary">
            Xóa năm {result.school_year}?
          </span>
          <Button
            size="sm"
            appearance="outline"
            isDisabled={mutation.isPending}
            onPress={() => {
              setConfirming(false);
              setError("");
            }}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            variant="danger"
            isDisabled={disabled || mutation.isPending}
            onPress={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xóa…" : "Xác nhận xóa"}
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          appearance="ghost"
          className="text-error-500"
          aria-label={`Xóa năm học ${result.school_year}`}
          isDisabled={disabled}
          onPress={() => setConfirming(true)}
        >
          Xóa
        </Button>
      )}
      {error && (
        <span role="alert" className="text-xs text-error-500">
          {error}
        </span>
      )}
    </div>
  );
}
