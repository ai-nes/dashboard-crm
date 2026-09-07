"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DatePickerField } from "@/components/common/date-picker-field";
import {
  CreateDialogField,
  CreateDialogInput,
  CreateDialogSelect,
  CreateDialogTextArea,
} from "@/components/common/create-dialog-field";
import { MultiStepDialog } from "@/components/common/multi-step-dialog";
import { SchoolCombobox } from "@/components/common/school-combobox";
import { Button } from "@/components/tailgrids/core/button";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { StudentCreateFields } from "@/services/api/student-school-update";
import {
  getStudentStudyStageForPayload,
  studentStudyStageOptions,
} from "@/services/api/student-school-update/student-study-stage";

interface StudentCreateDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (fields: StudentCreateFields) => Promise<void>;
}

interface StudentCreateForm {
  student_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  high_school: string;
  province: string;
  ward: string;
  current_grade: string;
  study_stage: string;
  major: string;
  aspiration: string;
  admission_year: string;
  alt_name: string;
  alt_phone: string;
  alt_address: string;
  notes: string;
}

const steps = ["Cơ bản", "Học tập", "Liên hệ"];

const genderOptions = [
  { id: "Nam", label: "Nam" },
  { id: "Nữ", label: "Nữ" },
];

const gradeOptions = [
  { id: "10", label: "Lớp 10" },
  { id: "11", label: "Lớp 11" },
  { id: "12", label: "Lớp 12" },
  { id: "post_exam", label: "Sau kỳ thi" },
];

const initialForm: StudentCreateForm = {
  student_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  email: "",
  high_school: "",
  province: "",
  ward: "",
  current_grade: "",
  study_stage: "",
  major: "",
  aspiration: "",
  admission_year: "2026",
  alt_name: "",
  alt_phone: "",
  alt_address: "",
  notes: "",
};

export default function StudentCreateDialog({
  isOpen,
  isSubmitting = false,
  onOpenChange,
  onCreate,
}: StudentCreateDialogProps) {
  const [form, setForm] = useState<StudentCreateForm>(initialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const provinceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Student", fieldname: "province" },
    isOpen,
  );
  const wardOptionsQuery = useStudentSchoolFieldOptions(
    form.province
      ? {
          doctype: "CRM Student",
          fieldname: "ward",
          province: form.province,
        }
      : null,
    isOpen,
  );

  const provinceOptions =
    provinceOptionsQuery.data?.options.map(({ value, label }) => ({
      id: value,
      label,
    })) ?? [];
  const wardOptions =
    wardOptionsQuery.data?.options.map(({ value, label }) => ({
      id: value,
      label,
    })) ?? [];

  const setField = <TField extends keyof StudentCreateForm>(
    field: TField,
    value: StudentCreateForm[TField],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setForm(initialForm);
    setCurrentStep(0);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep === 0 && !form.student_name.trim()) {
      toast.error("Họ và tên học sinh là bắt buộc.");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    await onCreate(toStudentCreateFields(form));
    reset();
  };

  return (
    <MultiStepDialog
      ariaLabel="Tạo hồ sơ học sinh"
      currentStep={currentStep}
      description="Nhập lần lượt các thông tin cần thiết. Bạn có thể bổ sung phần còn thiếu sau."
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            {currentStep > 0 && (
              <Button
                appearance="outline"
                isDisabled={isSubmitting}
                onPress={() => setCurrentStep((step) => step - 1)}
                type="button"
              >
                Quay lại
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              appearance="outline"
              isDisabled={isSubmitting}
              onPress={() => handleOpenChange(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button isDisabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Đang tạo…"
                : currentStep === steps.length - 1
                  ? "Tạo học sinh"
                  : "Tiếp tục"}
            </Button>
          </div>
        </div>
      }
      isBusy={isSubmitting}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      steps={steps}
      title="Thêm học sinh"
    >
      {currentStep === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField label="Họ và tên" required>
            <CreateDialogInput
              autoFocus
              label="Họ và tên"
              placeholder="Nguyễn Văn An"
              value={form.student_name}
              onChange={(event) => setField("student_name", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Ngày sinh">
            <DatePickerField
              ariaLabel="Ngày sinh"
              value={form.date_of_birth}
              onChange={(value) => setField("date_of_birth", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Giới tính">
            <CreateDialogSelect
              label="Giới tính"
              options={genderOptions}
              value={form.gender}
              onChange={(value) => setField("gender", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Số điện thoại">
            <CreateDialogInput
              label="Số điện thoại"
              placeholder="0900000000"
              type="tel"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Email">
            <CreateDialogInput
              label="Email"
              placeholder="an@example.com"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </CreateDialogField>
        </div>
      )}

      {currentStep === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField className="sm:col-span-2" label="Tỉnh / thành phố">
            <CreateDialogSelect
              label="Tỉnh / thành phố"
              options={provinceOptions}
              value={form.province}
              isDisabled={provinceOptionsQuery.isLoading}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  province: value,
                  ward: "",
                  high_school: "",
                }))
              }
            />
          </CreateDialogField>
          <CreateDialogField label="Phường / xã">
            <CreateDialogSelect
              label="Phường / xã"
              options={wardOptions}
              value={form.ward}
              isDisabled={!form.province || wardOptionsQuery.isLoading}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  ward: value,
                  high_school: "",
                }))
              }
            />
          </CreateDialogField>
          <CreateDialogField className="sm:col-span-2" label="Trường THPT">
            <SchoolCombobox
              ariaLabel="Chọn trường THPT"
              isDisabled={!form.province || !form.ward}
              province={form.province}
              value={form.high_school}
              ward={form.ward}
              onChange={(value) => setField("high_school", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Lớp hiện tại">
            <CreateDialogSelect
              label="Lớp hiện tại"
              options={gradeOptions}
              value={form.current_grade}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  current_grade: value,
                  study_stage: value === "12" ? current.study_stage : "",
                }))
              }
            />
          </CreateDialogField>
          <CreateDialogField label="Giai đoạn học tập">
            <CreateDialogSelect
              label="Giai đoạn học tập"
              options={studentStudyStageOptions}
              value={form.current_grade === "12" ? form.study_stage : ""}
              isDisabled={form.current_grade !== "12"}
              onChange={(value) => setField("study_stage", value)}
            />
          </CreateDialogField>
          <p className="text-xs leading-5 text-text-tertiary sm:col-span-2">
            Chỉ cần chọn học kỳ khi học sinh đang ở lớp 12. Với lớp 10, lớp 11
            và sau kỳ thi, hệ thống tự gửi giai đoạn tương ứng.
          </p>
          <CreateDialogField label="Năm tuyển sinh">
            <CreateDialogInput
              label="Năm tuyển sinh"
              placeholder="2026"
              value={form.admission_year}
              onChange={(event) =>
                setField("admission_year", event.target.value)
              }
            />
          </CreateDialogField>
          <CreateDialogField label="Ngành quan tâm">
            <CreateDialogInput
              label="Ngành quan tâm"
              placeholder="Tên CRM Major"
              value={form.major}
              onChange={(event) => setField("major", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Nguyện vọng ưu tiên">
            <CreateDialogInput
              label="Nguyện vọng ưu tiên"
              placeholder="Tên CRM Aspiration"
              value={form.aspiration}
              onChange={(event) => setField("aspiration", event.target.value)}
            />
          </CreateDialogField>
        </div>
      )}

      {currentStep === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField label="Tên phụ huynh / người liên hệ">
            <CreateDialogInput
              label="Tên phụ huynh / người liên hệ"
              value={form.alt_name}
              onChange={(event) => setField("alt_name", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Số điện thoại phụ huynh">
            <CreateDialogInput
              label="Số điện thoại phụ huynh"
              type="tel"
              value={form.alt_phone}
              onChange={(event) => setField("alt_phone", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField
            className="sm:col-span-2"
            label="Địa chỉ phụ huynh"
          >
            <CreateDialogTextArea
              label="Địa chỉ phụ huynh"
              rows={2}
              value={form.alt_address}
              onChange={(event) => setField("alt_address", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField className="sm:col-span-2" label="Ghi chú">
            <CreateDialogTextArea
              label="Ghi chú"
              placeholder="Thông tin bổ sung về hồ sơ…"
              rows={3}
              value={form.notes}
              onChange={(event) => setField("notes", event.target.value)}
            />
          </CreateDialogField>
        </div>
      )}
    </MultiStepDialog>
  );
}

function toStudentCreateFields(form: StudentCreateForm): StudentCreateFields {
  const studyStage = getStudentStudyStageForPayload(
    form.current_grade,
    form.study_stage,
  );

  return {
    student_name: form.student_name.trim(),
    ...compactFields({
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      high_school: form.high_school,
      province: form.province,
      ward: form.ward,
      current_grade: form.current_grade,
      study_stage: studyStage ?? "",
      major: form.major,
      aspiration: form.aspiration,
      admission_year: form.admission_year,
      alt_name: form.alt_name,
      alt_phone: form.alt_phone,
      alt_address: form.alt_address,
      notes: form.notes,
    }),
  };
}

function compactFields(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  );
}
