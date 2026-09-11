"use client";

import { InfoCircle } from "@tailgrids/icons";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import {
  CreateDialogField,
  CreateDialogInput,
  CreateDialogSelect,
} from "@/components/common/create-dialog-field";
import { SchoolCombobox } from "@/components/common/school-combobox";
import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { LeadDetail, LeadUpdateFields } from "@/services/api/lead-sale";

import {
  leadConversionFieldLabels,
  type LeadConversionField,
} from "./lead-conversion-validation";

interface LeadConversionDialogProps {
  isOpen: boolean;
  lead: LeadDetail;
  missingFields: LeadConversionField[];
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (fields: LeadUpdateFields) => void | Promise<void>;
}

type LeadConversionForm = Record<LeadConversionField, string>;
type LeadConversionErrors = Partial<Record<LeadConversionField, string>>;

export default function LeadConversionDialog({
  isOpen,
  lead,
  missingFields,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: LeadConversionDialogProps) {
  const [form, setForm] = useState<LeadConversionForm>(() =>
    getInitialForm(lead),
  );
  const [errors, setErrors] = useState<LeadConversionErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const provinceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "province" },
    isOpen && missingFields.includes("province"),
  );
  const majorOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "major", limit: 100 },
    isOpen && missingFields.includes("major"),
  );

  const provinceOptions = toOptions(provinceOptionsQuery.data?.options);
  const majorOptions = toOptions(majorOptionsQuery.data?.options);

  const setField = (field: LeadConversionField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors: LeadConversionErrors = {};
    for (const field of missingFields) {
      if (!form[field].trim()) {
        nextErrors[field] =
          "Vui lòng bổ sung " +
          leadConversionFieldLabels[field].toLocaleLowerCase("vi-VN") +
          ".";
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const fields: LeadUpdateFields = {};
    for (const field of missingFields) {
      fields[field] = form[field].trim();
    }

    setSubmitError(null);
    try {
      await onSubmit(fields);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu thông tin bổ sung.",
      );
    }
  };

  return (
    <Backdrop
      isDismissable={!isSubmitting}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (open || !isSubmitting) onOpenChange(open);
      }}
    >
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          aria-label="Bổ sung thông tin chuyển đổi Lead"
          className="relative overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
          role="alertdialog"
        >
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-card-border px-5 py-4 pr-11">
              <DialogTitle className="text-base leading-6">
                Thiếu thông tin chuyển đổi
              </DialogTitle>
              <DialogDescription className="text-xs leading-5 text-text-tertiary">
                Bổ sung các trường còn thiếu để tiếp tục.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="max-h-[calc(100vh-11rem)] space-y-3 overflow-y-auto px-5 py-4">
              <div className="flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2 text-xs leading-5 text-primary-700">
                <InfoCircle
                  className="mt-1 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <p>
                  Cần bổ sung:{" "}
                  <strong>
                    {missingFields
                      .map((field) => leadConversionFieldLabels[field])
                      .join(", ")}
                  </strong>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {missingFields.includes("phone") && (
                  <ConversionFieldError
                    error={errors.phone}
                    label={leadConversionFieldLabels.phone}
                  >
                    <CreateDialogInput
                      aria-invalid={Boolean(errors.phone)}
                      autoFocus
                      label={leadConversionFieldLabels.phone}
                      placeholder="0900000000"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setField("phone", event.target.value)
                      }
                    />
                  </ConversionFieldError>
                )}

                {missingFields.includes("province") && (
                  <ConversionFieldError
                    error={errors.province}
                    label={leadConversionFieldLabels.province}
                  >
                    <CreateDialogSelect
                      isDisabled={provinceOptionsQuery.isPending}
                      label={leadConversionFieldLabels.province}
                      options={provinceOptions}
                      placeholder="Chọn tỉnh / thành phố"
                      value={form.province}
                      onChange={(value) => {
                        setField("province", value);
                        if (missingFields.includes("high_school")) {
                          setField("high_school", "");
                        }
                      }}
                    />
                  </ConversionFieldError>
                )}

                {missingFields.includes("high_school") && (
                  <ConversionFieldError
                    className="sm:col-span-2"
                    error={errors.high_school}
                    label={leadConversionFieldLabels.high_school}
                  >
                    <SchoolCombobox
                      ariaLabel={leadConversionFieldLabels.high_school}
                      isDisabled={!form.province}
                      province={form.province}
                      requiresWard={false}
                      value={form.high_school}
                      onChange={(value) => setField("high_school", value)}
                    />
                  </ConversionFieldError>
                )}

                {missingFields.includes("major") && (
                  <ConversionFieldError
                    error={errors.major}
                    label={leadConversionFieldLabels.major}
                  >
                    <CreateDialogSelect
                      isDisabled={majorOptionsQuery.isPending}
                      label={leadConversionFieldLabels.major}
                      options={majorOptions}
                      placeholder="Chọn ngành quan tâm"
                      value={form.major}
                      onChange={(value) => setField("major", value)}
                    />
                  </ConversionFieldError>
                )}
              </div>

              {(provinceOptionsQuery.isError || majorOptionsQuery.isError) && (
                <p className="text-xs text-error-600" role="alert">
                  Chưa thể tải danh mục. Vui lòng thử lại sau.
                </p>
              )}
              {submitError && (
                <p className="text-xs text-error-600" role="alert">
                  {submitError}
                </p>
              )}
            </DialogBody>

            <DialogFooter className="border-t border-card-border px-5 py-3">
              <Button
                appearance="outline"
                isDisabled={isSubmitting}
                onPress={() => onOpenChange(false)}
                size="sm"
                type="button"
              >
                Bổ sung sau
              </Button>
              <Button isDisabled={isSubmitting} size="sm" type="submit">
                {isSubmitting
                  ? "Đang lưu và chuyển đổi…"
                  : "Đồng ý và chuyển đổi"}
              </Button>
            </DialogFooter>
          </form>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}

function ConversionFieldError({
  children,
  className,
  error,
  label,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
}) {
  return (
    <div className={className}>
      <CreateDialogField label={label} required>
        {children}
      </CreateDialogField>
      {error && (
        <p className="mt-1 text-xs text-error-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function getInitialForm(lead: LeadDetail): LeadConversionForm {
  return {
    phone: lead.phone || "",
    province: lead.province || "",
    high_school: lead.school || "",
    major: lead.interestedMajor || "",
  };
}

function toOptions(options?: { value: string; label: string }[]) {
  return options?.map(({ value, label }) => ({ id: value, label })) ?? [];
}
