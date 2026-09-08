"use client";

import { useState, type FormEvent } from "react";

import { SchoolCombobox } from "@/components/common/school-combobox";
import {
  CreateDialogField,
  CreateDialogInput,
  CreateDialogSelect,
  CreateDialogTextArea,
} from "@/components/common/create-dialog-field";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { useLeadMappingOptions } from "@/hooks/use-lead-mapping-options";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { StudentCreateWithLeadFields } from "@/services/api/student-school-update";

interface StudentCreateDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (fields: StudentCreateWithLeadFields) => Promise<void>;
}

interface StudentCreateForm {
  student_name: string;
  phone: string;
  id_number: string;
  email: string;
  province: string;
  ward: string;
  high_school: string;
  major: string;
  source: string;
  assigned_to: string;
  advertising_channel: string;
  admission_year: string;
  branch: string;
  description: string;
}

type StudentCreateField = keyof StudentCreateForm;
type StudentCreateErrors = Partial<Record<StudentCreateField, string>>;

const initialForm: StudentCreateForm = {
  student_name: "",
  phone: "",
  id_number: "",
  email: "",
  province: "",
  ward: "",
  high_school: "",
  major: "",
  source: "",
  assigned_to: "",
  advertising_channel: "",
  admission_year: "2026",
  branch: "",
  description: "",
};

export default function StudentCreateDialog({
  isOpen,
  isSubmitting = false,
  onOpenChange,
  onCreate,
}: StudentCreateDialogProps) {
  const [form, setForm] = useState<StudentCreateForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<StudentCreateErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const provinceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "province" },
    isOpen,
  );
  const wardOptionsQuery = useStudentSchoolFieldOptions(
    {
      doctype: "CRM Lead",
      fieldname: "ward",
      limit: 100,
      province: form.province || undefined,
    },
    isOpen && Boolean(form.province),
  );
  const sourceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "source", limit: 100 },
    isOpen,
  );
  const leadMappingOptionsQuery = useLeadMappingOptions(isOpen);
  const majorOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "major", limit: 100 },
    isOpen,
  );
  const branchOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "branch", limit: 100 },
    isOpen,
  );

  const provinceOptions = toSelectOptions(provinceOptionsQuery.data?.options);
  const wardOptions = toSelectOptions(wardOptionsQuery.data?.options);
  const sourceOptions = toSelectOptions(sourceOptionsQuery.data?.options);
  const majorOptions = toSelectOptions(majorOptionsQuery.data?.options);
  const branchOptions = toSelectOptions(branchOptionsQuery.data?.options);
  const assignedToOptions =
    leadMappingOptionsQuery.data?.staff
      .filter((option) => option.user)
      .map((option) => ({ id: option.user as string, label: option.label })) ??
    [];

  const setField = <TField extends StudentCreateField>(
    field: TField,
    value: StudentCreateForm[TField],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  };

  const reset = () => {
    setForm(initialForm);
    setFieldErrors({});
    setSubmitError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleProvinceChange = (province: string) => {
    setForm((current) => ({ ...current, province, ward: "", high_school: "" }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.province;
      delete next.ward;
      delete next.high_school;
      return next;
    });
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors: StudentCreateErrors = {};
    if (!form.student_name.trim()) {
      errors.student_name = "Vui lòng nhập họ tên.";
    }
    if (!form.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    }
    if (
      form.id_number.trim() &&
      !/^(\d{9}|\d{12})$/.test(form.id_number.trim())
    ) {
      errors.id_number = "Số CCCD phải gồm 9 hoặc 12 chữ số.";
    }
    if (!form.province.trim()) {
      errors.province = "Vui lòng chọn tỉnh / thành phố.";
    }
    if (!form.source.trim()) {
      errors.source = "Vui lòng chọn nguồn Lead.";
    }
    if (!form.assigned_to.trim()) {
      errors.assigned_to = "Vui lòng chọn người phụ trách.";
    }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errors.email = "Email không đúng định dạng.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError(null);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    try {
      await onCreate(toStudentCreateFields(form));
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Chưa thể tạo học sinh.",
      );
    }
  };

  return (
    <Dialog
      aria-label="Tạo hồ sơ học sinh"
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      className="max-h-[calc(100vh-2rem)] max-w-140 overflow-hidden p-0"
    >
      <form onSubmit={handleSubmit}>
        <div className="border-b border-card-border px-5 py-4">
          <DialogTitle className="text-base font-semibold text-text-primary">
            Thêm học sinh
          </DialogTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Nhập thông tin chính để tạo hồ sơ; các thông tin còn thiếu có thể bổ
            sung sau.
          </p>
        </div>

        <DialogBody className="max-h-[calc(100vh-10rem)] space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CreateDialogField label="Họ và tên" required>
              <CreateDialogInput
                autoFocus
                label="Họ và tên"
                placeholder="Nguyễn Văn An"
                value={form.student_name}
                onChange={(event) =>
                  setField("student_name", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.student_name)}
              />
              <FormFieldError message={fieldErrors.student_name} />
            </CreateDialogField>

            <CreateDialogField label="Di động" required>
              <CreateDialogInput
                label="Di động"
                placeholder="0900000000"
                type="tel"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              <FormFieldError message={fieldErrors.phone} />
            </CreateDialogField>

            <CreateDialogField label="CCCD">
              <CreateDialogInput
                label="CCCD"
                inputMode="numeric"
                placeholder="012345678901"
                value={form.id_number}
                onChange={(event) => setField("id_number", event.target.value)}
                aria-invalid={Boolean(fieldErrors.id_number)}
              />
              <FormFieldError message={fieldErrors.id_number} />
            </CreateDialogField>

            <CreateDialogField label="Email">
              <CreateDialogInput
                label="Email"
                placeholder="an@example.com"
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              <FormFieldError message={fieldErrors.email} />
            </CreateDialogField>

            <CreateDialogField label="Nguồn" required>
              <CreateDialogSelect
                label="Nguồn"
                options={sourceOptions}
                value={form.source}
                isDisabled={sourceOptionsQuery.isPending}
                onChange={(value) => setField("source", value)}
              />
              <FormFieldError message={fieldErrors.source} />
            </CreateDialogField>

            <CreateDialogField label="Người phụ trách" required>
              <CreateDialogSelect
                label="Người phụ trách"
                options={assignedToOptions}
                value={form.assigned_to}
                isDisabled={leadMappingOptionsQuery.isPending}
                onChange={(value) => setField("assigned_to", value)}
              />
              <FormFieldError message={fieldErrors.assigned_to} />
            </CreateDialogField>

            <CreateDialogField label="Tỉnh / thành phố" required>
              <CreateDialogSelect
                label="Tỉnh / thành phố"
                options={provinceOptions}
                value={form.province}
                isDisabled={provinceOptionsQuery.isPending}
                onChange={handleProvinceChange}
              />
              <FormFieldError message={fieldErrors.province} />
            </CreateDialogField>

            <CreateDialogField label="Xã / phường">
              <CreateDialogSelect
                label="Xã / phường"
                options={wardOptions}
                value={form.ward}
                isDisabled={!form.province || wardOptionsQuery.isPending}
                onChange={(value) => setField("ward", value)}
              />
            </CreateDialogField>

            <CreateDialogField label="Trường THPT">
              <SchoolCombobox
                ariaLabel="Chọn trường THPT"
                isDisabled={!form.province}
                province={form.province}
                ward={form.ward}
                requiresWard={false}
                value={form.high_school}
                onChange={(value) => setField("high_school", value)}
              />
            </CreateDialogField>

            <CreateDialogField label="Ngành quan tâm">
              <CreateDialogSelect
                label="Ngành quan tâm"
                options={majorOptions}
                value={form.major}
                isDisabled={majorOptionsQuery.isPending}
                onChange={(value) => setField("major", value)}
              />
            </CreateDialogField>

            <CreateDialogField label="Chi nhánh">
              <CreateDialogSelect
                label="Chi nhánh"
                options={branchOptions}
                value={form.branch}
                isDisabled={branchOptionsQuery.isPending}
                onChange={(value) => setField("branch", value)}
              />
            </CreateDialogField>

            <CreateDialogField label="Kênh quảng cáo">
              <CreateDialogInput
                label="Kênh quảng cáo"
                placeholder="Facebook Ads, Google…"
                value={form.advertising_channel}
                onChange={(event) =>
                  setField("advertising_channel", event.target.value)
                }
              />
            </CreateDialogField>

            <CreateDialogField label="Năm tuyển sinh">
              <CreateDialogInput
                label="Năm tuyển sinh"
                type="number"
                value={form.admission_year}
                onChange={(event) =>
                  setField("admission_year", event.target.value)
                }
              />
            </CreateDialogField>

            <CreateDialogField className="sm:col-span-2" label="Ghi chú">
              <CreateDialogTextArea
                label="Ghi chú"
                placeholder="Thông tin bổ sung về học sinh…"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
              />
            </CreateDialogField>
          </div>

          {(sourceOptionsQuery.isError ||
            provinceOptionsQuery.isError ||
            wardOptionsQuery.isError ||
            leadMappingOptionsQuery.isError) && (
            <p className="text-xs text-error-600" role="alert">
              Chưa thể tải một số danh mục. Vui lòng thử lại sau.
            </p>
          )}
          {submitError && (
            <p className="text-xs text-error-600" role="alert">
              {submitError}
            </p>
          )}
        </DialogBody>

        <DialogFooter className="border-t border-card-border px-5 py-3">
          <DialogClose
            appearance="outline"
            size="sm"
            type="button"
            isDisabled={isSubmitting}
          >
            Hủy
          </DialogClose>
          <Button type="submit" size="sm" isDisabled={isSubmitting}>
            {isSubmitting ? "Đang tạo…" : "Tạo học sinh"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function toStudentCreateFields(
  form: StudentCreateForm,
): StudentCreateWithLeadFields {
  return {
    student_name: form.student_name.trim(),
    phone: form.phone.trim(),
    id_number: form.id_number.trim(),
    province: form.province.trim(),
    source: form.source.trim(),
    assigned_to: form.assigned_to.trim(),
    ...compactFields({
      email: form.email,
      ward: form.ward,
      high_school: form.high_school,
      major: form.major,
      advertising_channel: form.advertising_channel,
      admission_year: form.admission_year,
      branch: form.branch,
      description: form.description,
    }),
  };
}

function compactFields(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  ) as Partial<StudentCreateWithLeadFields>;
}

function toSelectOptions(options?: { value: string; label: string }[]) {
  return options?.map(({ value, label }) => ({ id: value, label })) ?? [];
}

function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-error-600" role="alert">
      {message}
    </p>
  );
}
