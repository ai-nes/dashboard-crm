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
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { LeadCreateFields } from "@/services/api/lead-sale";

interface QuickCreateLeadDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (fields: LeadCreateFields) => Promise<void>;
}

interface QuickCreateLeadForm {
  student_name: string;
  phone: string;
  email: string;
  province: string;
  ward: string;
  high_school: string;
  major: string;
  campaign: string;
  advertising_channel: string;
  admission_year: string;
  branch: string;
  notes: string;
}

type QuickCreateLeadField = keyof QuickCreateLeadForm;
type QuickCreateLeadErrors = Partial<Record<QuickCreateLeadField, string>>;

const initialForm: QuickCreateLeadForm = {
  student_name: "",
  phone: "",
  email: "",
  province: "",
  ward: "",
  high_school: "",
  major: "",
  campaign: "",
  advertising_channel: "",
  admission_year: "2026",
  branch: "",
  notes: "",
};

export default function QuickCreateLeadDialog({
  isOpen,
  isSubmitting = false,
  onOpenChange,
  onCreate,
}: QuickCreateLeadDialogProps) {
  const [form, setForm] = useState<QuickCreateLeadForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<QuickCreateLeadErrors>({});
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
  const campaignOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "campaign", limit: 100 },
    isOpen,
  );
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
  const campaignOptions = toSelectOptions(campaignOptionsQuery.data?.options);
  const majorOptions = toSelectOptions(majorOptionsQuery.data?.options);
  const branchOptions = toSelectOptions(branchOptionsQuery.data?.options);

  const setField = <TField extends QuickCreateLeadField>(
    field: TField,
    value: QuickCreateLeadForm[TField],
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

    const errors: QuickCreateLeadErrors = {};
    if (!form.student_name.trim())
      errors.student_name = "Vui lòng nhập họ tên.";
    if (!form.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại.";
    if (!form.campaign.trim()) errors.campaign = "Vui lòng chọn Campaign.";
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
      await onCreate(toLeadCreateFields(form));
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Chưa thể tạo Lead.",
      );
    }
  };

  return (
    <Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable={!isSubmitting}
    >
      <Dialog
        aria-label="Tạo Lead nhanh"
        className="max-h-[calc(100vh-2rem)] max-w-140 overflow-hidden p-0"
      >
        <form onSubmit={handleSubmit}>
          <div className="border-b border-card-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-text-primary">
              Tạo Lead nhanh
            </DialogTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Nhập thông tin chính để tạo Lead; các thông tin còn thiếu có thể
              bổ sung sau.
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

              <CreateDialogField label="Chiến dịch" required>
                <CreateDialogSelect
                  label="Chiến dịch"
                  options={campaignOptions}
                  value={form.campaign}
                  isDisabled={campaignOptionsQuery.isPending}
                  onChange={(value) => setField("campaign", value)}
                />
                <FormFieldError message={fieldErrors.campaign} />
              </CreateDialogField>

              <CreateDialogField label="Tỉnh / thành phố">
                <CreateDialogSelect
                  label="Tỉnh / thành phố"
                  options={provinceOptions}
                  value={form.province}
                  isDisabled={provinceOptionsQuery.isPending}
                  onChange={handleProvinceChange}
                />
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
                  placeholder="Thông tin bổ sung về Lead…"
                  rows={3}
                  value={form.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                />
              </CreateDialogField>
            </div>

            {(campaignOptionsQuery.isError ||
              provinceOptionsQuery.isError ||
              wardOptionsQuery.isError) && (
              <p className="text-xs text-error-600" role="alert">
                Chưa thể tải một số danh mục Lead. Vui lòng thử lại sau.
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
              {isSubmitting ? "Đang tạo…" : "Tạo Lead"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}

function toLeadCreateFields(form: QuickCreateLeadForm): LeadCreateFields {
  return {
    student_name: form.student_name.trim(),
    phone: form.phone.trim(),
    province: form.province.trim(),
    campaign: form.campaign.trim(),
    ...compactFields({
      email: form.email,
      ward: form.ward,
      high_school: form.high_school,
      major: form.major,
      advertising_channel: form.advertising_channel,
      admission_year: form.admission_year,
      branch: form.branch,
      notes: form.notes,
    }),
  };
}

function compactFields(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  ) as Partial<LeadCreateFields>;
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
