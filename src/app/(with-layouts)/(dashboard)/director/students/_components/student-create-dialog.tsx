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
import { useLeadMappingOptions } from "@/hooks/use-lead-mapping-options";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { LeadCreateFields } from "@/services/api/student-school-update";
import {
  getStudentStudyStageForPayload,
  studentStudyStageOptions,
} from "@/services/api/student-school-update/student-study-stage";

interface StudentCreateDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (fields: LeadCreateFields) => Promise<void>;
}

interface StudentCreateForm {
  student_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  other_email: string;
  source: string;
  enrollment_status: string;
  advertising_channel: string;
  high_school: string;
  province: string;
  ward: string;
  current_grade: string;
  study_stage: string;
  major: string;
  aspiration: string;
  admission_year: string;
  conversion_potential: string;
  branch: string;
  assigned_to: string;
  segments: string;
  tags: string;
  event_participated: string;
  description: string;
  alt_name: string;
  alt_phone: string;
  alt_address: string;
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
  other_email: "",
  source: "",
  enrollment_status: "NEW",
  advertising_channel: "",
  high_school: "",
  province: "",
  ward: "",
  current_grade: "",
  study_stage: "",
  major: "",
  aspiration: "",
  admission_year: "2026",
  conversion_potential: "",
  branch: "",
  assigned_to: "",
  segments: "",
  tags: "",
  event_participated: "",
  description: "",
  alt_name: "",
  alt_phone: "",
  alt_address: "",
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
    { doctype: "CRM Lead", fieldname: "province" },
    isOpen,
  );
  const wardOptionsQuery = useStudentSchoolFieldOptions(
    form.province
      ? {
          doctype: "CRM Lead",
          fieldname: "ward",
          province: form.province,
        }
      : null,
    isOpen,
  );
  const sourceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "source", limit: 100 },
    isOpen,
  );
  const statusOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "enrollment_status", limit: 100 },
    isOpen,
  );
  const branchOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "branch", limit: 100 },
    isOpen,
  );
  const majorOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "major", limit: 100 },
    isOpen,
  );
  const aspirationOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "aspiration", limit: 100 },
    isOpen,
  );
  const conversionPotentialOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "conversion_potential", limit: 100 },
    isOpen,
  );
  const leadOptionsQuery = useLeadMappingOptions(isOpen);

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
  const sourceOptions = toSelectOptions(sourceOptionsQuery.data?.options);
  const statusOptions = toSelectOptions(statusOptionsQuery.data?.options);
  const branchOptions = toSelectOptions(branchOptionsQuery.data?.options);
  const majorOptions = toSelectOptions(majorOptionsQuery.data?.options);
  const aspirationOptions = toSelectOptions(
    aspirationOptionsQuery.data?.options,
  );
  const advertisingChannelOptions = sourceOptions;
  const conversionPotentialOptions = toSelectOptions(
    conversionPotentialOptionsQuery.data?.options,
  );
  const assignedToOptions =
    leadOptionsQuery.data?.staff
      .filter((option) => option.user)
      .map((option) => ({ id: option.user as string, label: option.label })) ??
    [];

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
    if (currentStep === 0) {
      if (!form.student_name.trim()) {
        toast.error("Họ và tên học sinh là bắt buộc.");
        return;
      }
      if (!form.phone.trim()) {
        toast.error("Di động là bắt buộc.");
        return;
      }
      if (!form.source.trim()) {
        toast.error("Nguồn là bắt buộc.");
        return;
      }
    }
    if (currentStep === 1 && !form.province.trim()) {
      toast.error("Tỉnh / thành phố là bắt buộc.");
      return;
    }
    if (currentStep === 2 && !form.assigned_to.trim()) {
      toast.error("Giao cho là bắt buộc.");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    await onCreate(toLeadCreateFields(form));
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
          <CreateDialogField label="Số điện thoại" required>
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
          <CreateDialogField label="Email khác">
            <CreateDialogInput
              label="Email khác"
              placeholder="khac@example.com"
              type="email"
              value={form.other_email}
              onChange={(event) => setField("other_email", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Nguồn" required>
            <CreateDialogSelect
              label="Nguồn"
              options={sourceOptions}
              value={form.source}
              isDisabled={sourceOptionsQuery.isLoading}
              onChange={(value) => setField("source", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Tình trạng Lead">
            <CreateDialogSelect
              label="Tình trạng Lead"
              options={statusOptions}
              value={form.enrollment_status}
              isDisabled={statusOptionsQuery.isLoading}
              onChange={(value) => setField("enrollment_status", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Kênh quảng cáo">
            <CreateDialogSelect
              label="Kênh quảng cáo"
              options={advertisingChannelOptions}
              value={form.advertising_channel}
              isDisabled={sourceOptionsQuery.isLoading}
              onChange={(value) => setField("advertising_channel", value)}
            />
          </CreateDialogField>
        </div>
      )}

      {currentStep === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField
            className="sm:col-span-2"
            label="Tỉnh / thành phố"
            required
          >
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
              isDisabled={!form.province}
              province={form.province}
              requiresWard={false}
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
            <CreateDialogSelect
              label="Ngành quan tâm"
              options={majorOptions}
              value={form.major}
              isDisabled={majorOptionsQuery.isLoading}
              onChange={(value) => setField("major", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Nguyện vọng ưu tiên">
            <CreateDialogSelect
              label="Nguyện vọng ưu tiên"
              options={aspirationOptions}
              value={form.aspiration}
              isDisabled={aspirationOptionsQuery.isLoading}
              onChange={(value) => setField("aspiration", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Khả năng chuyển đổi">
            <CreateDialogSelect
              label="Khả năng chuyển đổi"
              options={conversionPotentialOptions}
              value={form.conversion_potential}
              isDisabled={conversionPotentialOptionsQuery.isLoading}
              onChange={(value) => setField("conversion_potential", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Chi nhánh">
            <CreateDialogSelect
              label="Chi nhánh"
              options={branchOptions}
              value={form.branch}
              isDisabled={branchOptionsQuery.isLoading}
              onChange={(value) => setField("branch", value)}
            />
          </CreateDialogField>
        </div>
      )}

      {currentStep === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CreateDialogField
            className="sm:col-span-2"
            label="Giao cho"
            required
          >
            <CreateDialogSelect
              label="Giao cho"
              options={assignedToOptions}
              value={form.assigned_to}
              isDisabled={leadOptionsQuery.isLoading}
              onChange={(value) => setField("assigned_to", value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Segments">
            <CreateDialogInput
              label="Segments"
              placeholder="Segment A; Segment B"
              value={form.segments}
              onChange={(event) => setField("segments", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField label="Tags">
            <CreateDialogInput
              label="Tags"
              placeholder="Tag A; Tag B"
              value={form.tags}
              onChange={(event) => setField("tags", event.target.value)}
            />
          </CreateDialogField>
          <CreateDialogField className="sm:col-span-2" label="Sự kiện tham gia">
            <CreateDialogInput
              label="Sự kiện tham gia"
              placeholder="Ngày hội tư vấn; Open day"
              value={form.event_participated}
              onChange={(event) =>
                setField("event_participated", event.target.value)
              }
            />
          </CreateDialogField>
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
          <CreateDialogField className="sm:col-span-2" label="Mô tả">
            <CreateDialogTextArea
              label="Mô tả"
              placeholder="Thông tin bổ sung về hồ sơ…"
              rows={3}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </CreateDialogField>
        </div>
      )}
    </MultiStepDialog>
  );
}

function toLeadCreateFields(form: StudentCreateForm): LeadCreateFields {
  const studyStage = getStudentStudyStageForPayload(
    form.current_grade,
    form.study_stage,
  );

  return {
    student_name: form.student_name.trim(),
    phone: form.phone.trim(),
    province: form.province.trim(),
    source: form.source.trim(),
    ...compactFields({
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      email: form.email,
      other_email: form.other_email,
      enrollment_status: form.enrollment_status,
      advertising_channel: form.advertising_channel,
      high_school: form.high_school,
      ward: form.ward,
      current_grade: form.current_grade,
      study_stage: studyStage ?? "",
      major: form.major,
      aspiration: form.aspiration,
      admission_year: form.admission_year,
      conversion_potential: form.conversion_potential,
      branch: form.branch,
      assigned_to: form.assigned_to,
      segments: form.segments,
      tags: form.tags,
      event_participated: form.event_participated,
      description: form.description,
      alt_name: form.alt_name,
      alt_phone: form.alt_phone,
      alt_address: form.alt_address,
    }),
  };
}

function toSelectOptions(options?: { value: string; label: string }[]) {
  return options?.map(({ value, label }) => ({ id: value, label })) ?? [];
}

function compactFields(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  );
}
