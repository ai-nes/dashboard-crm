"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DatePickerField } from "@/components/common/date-picker-field";
import { Input } from "@/components/tailgrids/core/input";
import { Button } from "@/components/tailgrids/core/button";
import {
  getEnglishCertificate,
  saveEnglishCertificate,
  type CertificateFields,
} from "@/services/api/student-language-certificates";
import { studentsKeys } from "@/hooks/use-students-queries";

const fields = [
  {
    key: "certificateName",
    label: "Loại chứng chỉ",
    placeholder: "Ví dụ: IELTS, TOEIC",
  },
  { key: "scoreLevel", label: "Điểm chứng chỉ" },
  { key: "issueDate", label: "Ngày cấp", date: true },
  { key: "expiryDate", label: "Ngày hết hạn", date: true },
] as const;

export default function StudentEnglishCertificateFields({
  studentId,
  canEdit,
}: {
  studentId: string;
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["student-english-certificate", studentId] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => getEnglishCertificate(studentId),
    enabled: Boolean(studentId),
  });
  const [draft, setDraft] = useState<Partial<CertificateFields>>({});
  const current: CertificateFields = {
    certificateName: query.data?.certificate_name ?? "",
    scoreLevel: query.data?.score_level ?? null,
    issueDate: query.data?.issue_date ?? null,
    expiryDate: query.data?.expiry_date ?? null,
  };
  const form = { ...current, ...draft };
  const dirty = fields.some(
    (field) => (form[field.key] ?? "") !== (current[field.key] ?? ""),
  );
  const mutation = useMutation({
    mutationFn: () =>
      saveEnglishCertificate(studentId, query.data?.id, {
        ...form,
        certificateName: form.certificateName.trim(),
      }),
    onSuccess: async (saved) => {
      queryClient.setQueryData(queryKey, saved);
      setDraft({});
      await queryClient.invalidateQueries({
        queryKey: studentsKeys.student360(studentId),
      });
      toast.success("Đã lưu chứng chỉ tiếng Anh.");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Chưa thể lưu chứng chỉ.",
      ),
  });
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (
      !canEdit ||
      !dirty ||
      query.isPending ||
      query.isError ||
      mutation.isPending
    )
      return;
    if (!form.certificateName.trim()) {
      toast.error("Vui lòng nhập loại chứng chỉ.");
      return;
    }
    if (form.issueDate && form.expiryDate && form.issueDate > form.expiryDate) {
      toast.error("Ngày hết hạn không được trước ngày cấp.");
      return;
    }
    mutation.mutate();
  };
  return (
    <form className="mt-3 space-y-3" onSubmit={save}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {fields.map((field) => (
          <label key={field.key} className="block min-w-0">
            <span className="block text-xs leading-5 font-medium text-text-primary">
              {field.label}
            </span>
            {"date" in field ? (
              <DatePickerField
                ariaLabel={field.label}
                className="mt-1 h-8 px-2 text-xs"
                value={form[field.key] ?? ""}
                disabled={
                  !canEdit ||
                  query.isPending ||
                  query.isError ||
                  mutation.isPending
                }
                onChange={(value) =>
                  setDraft((state) => ({
                    ...state,
                    [field.key]: value || null,
                  }))
                }
              />
            ) : (
              <Input
                aria-label={field.label}
                className="mt-1 h-8 w-full px-2 text-xs"
                placeholder={
                  "placeholder" in field
                    ? field.placeholder
                    : "Nhấn để nhập thông tin"
                }
                value={form[field.key] ?? ""}
                readOnly={!canEdit}
                disabled={
                  query.isPending || query.isError || mutation.isPending
                }
                onChange={(event) =>
                  setDraft((state) => ({
                    ...state,
                    [field.key]:
                      event.target.value ||
                      (field.key === "certificateName" ? "" : null),
                  }))
                }
              />
            )}
          </label>
        ))}
      </div>
      {query.isError && (
        <p role="alert" className="text-xs text-badge-error-text">
          Không thể tải chứng chỉ tiếng Anh.
        </p>
      )}
      {canEdit && dirty && (
        <Button
          type="submit"
          size="sm"
          isDisabled={query.isPending || query.isError || mutation.isPending}
        >
          {mutation.isPending ? "Đang lưu…" : "Lưu chứng chỉ"}
        </Button>
      )}
    </form>
  );
}
