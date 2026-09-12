"use client";

import { useMemo, useState, type FormEvent } from "react";

import { DatePickerField } from "@/components/common/date-picker-field";
import { DropdownField } from "@/components/common/dropdown-field";
import { TimePickerField } from "@/components/common/time-picker-field";
import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type {
  CreateInteractionInput,
  InteractionType,
} from "@/services/api/interaction-intelligence";
import { Close } from "@tailgrids/icons";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { getInteractionTypeLabel } from "./student-interaction-utils";

const OUTCOME_OPTIONS = [
  "Captured",
  "Follow Up Needed",
  "Resolved",
  "Converted",
  "No Response",
  "Data Error",
  "Uncontactable",
] as const;

const OUTCOME_LABELS: Record<(typeof OUTCOME_OPTIONS)[number], string> = {
  Captured: "Đã ghi nhận",
  "Follow Up Needed": "Cần follow-up",
  Resolved: "Đã xử lý",
  Converted: "Đã chuyển đổi",
  "No Response": "Không phản hồi",
  "Data Error": "Lỗi dữ liệu",
  Uncontactable: "Không thể liên hệ",
};

interface StudentCreateInteractionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  interactionTypes: InteractionType[];
  onCreate: (input: Omit<CreateInteractionInput, "student">) => Promise<void>;
  isSubmitting?: boolean;
}

interface InteractionFormState {
  interactionType: string;
  interactionDate: string;
  interactionTime: string;
  outcome: string;
  summary: string;
  notes: string;
}

const initialFormState = (): InteractionFormState => {
  const dateTime = getDateTimeInputValue();

  return {
    interactionType: "",
    interactionDate: dateTime.slice(0, 10),
    interactionTime: dateTime.slice(11, 16),
    outcome: "",
    summary: "",
    notes: "",
  };
};

export default function StudentCreateInteractionDialog({
  isOpen,
  onOpenChange,
  studentName,
  interactionTypes,
  onCreate,
  isSubmitting = false,
}: StudentCreateInteractionDialogProps) {
  const [form, setForm] = useState<InteractionFormState>(initialFormState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const interactionTypeOptions = useMemo(
    () =>
      interactionTypes.map((type) => ({
        id: type.code,
        label: getInteractionTypeLabel(type),
        searchText: [type.display_name, type.code].filter(Boolean).join(" "),
      })),
    [interactionTypes],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) return;
    onOpenChange(open);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!form.interactionType) {
      setSubmitError("Vui lòng chọn loại tương tác.");
      return;
    }

    if (!form.interactionDate || !form.interactionTime) {
      setSubmitError("Vui lòng chọn thời gian tương tác.");
      return;
    }

    try {
      await onCreate({
        interaction_type: form.interactionType,
        interaction_datetime: toFrappeDatetime(
          `${form.interactionDate}T${form.interactionTime}`,
        ),
        outcome: form.outcome || undefined,
        summary: form.summary.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Chưa thể tạo tương tác.",
      );
    }
  };

  return (
    <Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] data-entering:scale-95 data-entering:opacity-0 data-exiting:scale-95 data-exiting:opacity-0 motion-reduce:transition-none motion-reduce:data-entering:scale-100 motion-reduce:data-entering:opacity-100 motion-reduce:data-exiting:scale-100 motion-reduce:data-exiting:opacity-100 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          aria-label="Tạo tương tác thủ công"
          className="relative flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogClose
            iconOnly
            size="sm"
            variant="ghost"
            aria-label="Đóng"
            isDisabled={isSubmitting}
            className="absolute top-4 right-4 z-10 text-text-100 opacity-70 hover:bg-transparent hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Close />
          </DialogClose>

          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-card-border px-6 py-5 pr-14">
              <DialogTitle className="text-xl leading-7">
                Tạo tương tác thủ công
              </DialogTitle>
              <DialogDescription className="text-text-tertiary">
                {studentName
                  ? `Ghi nhận tương tác cho ${studentName}. Không cần liên kết reference.`
                  : "Ghi nhận tương tác không cần liên kết reference."}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="max-h-[calc(100vh-11rem)] space-y-4 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary sm:col-span-2">
                  <span className="inline-flex items-center gap-1">
                    Loại tương tác <span className="text-error-500">*</span>
                  </span>
                  <DropdownField
                    ariaLabel="Loại tương tác"
                    isDisabled={
                      isSubmitting || interactionTypeOptions.length === 0
                    }
                    isSearchable
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        interactionType: value ?? "",
                      }))
                    }
                    options={interactionTypeOptions}
                    placeholder="Chọn loại tương tác"
                    searchPlaceholder="Tìm loại tương tác..."
                    triggerClassName="h-10 px-3 py-2.5 text-sm"
                    value={form.interactionType || undefined}
                  />
                </label>

                <div className="space-y-1.5 text-xs font-semibold text-text-primary sm:col-span-2">
                  <span className="inline-flex items-center gap-1">
                    Thời gian tương tác{" "}
                    <span className="text-error-500">*</span>
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <span className="block text-xs font-medium text-text-secondary">
                        Ngày
                      </span>
                      <DatePickerField
                        ariaLabel="Ngày tương tác"
                        value={form.interactionDate}
                        onChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            interactionDate: value,
                          }))
                        }
                        disabled={isSubmitting}
                        className="h-10 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="block text-xs font-medium text-text-secondary">
                        Giờ
                      </span>
                      <TimePickerField
                        ariaLabel="Giờ tương tác"
                        value={form.interactionTime}
                        onChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            interactionTime: value,
                          }))
                        }
                        disabled={isSubmitting}
                        className="h-10 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary sm:col-span-2">
                  Kết quả
                  <Select
                    value={form.outcome || undefined}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        outcome: String(value ?? ""),
                      }))
                    }
                    aria-label="Kết quả tương tác"
                    isDisabled={isSubmitting}
                  >
                    <SelectTrigger className="h-10 w-full text-sm">
                      {form.outcome ? (
                        <SelectValue />
                      ) : (
                        <span className="text-input-placeholder-text">
                          Chọn kết quả (không bắt buộc)
                        </span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {OUTCOME_OPTIONS.map((outcome) => (
                        <SelectItem
                          key={outcome}
                          id={outcome}
                          textValue={OUTCOME_LABELS[outcome]}
                        >
                          {OUTCOME_LABELS[outcome]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary sm:col-span-2">
                  Tóm tắt
                  <Input
                    value={form.summary}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        summary: event.target.value,
                      }))
                    }
                    aria-label="Tóm tắt tương tác"
                    placeholder="Ví dụ: Tư vấn học phí ngành Marketing"
                    className="h-10 px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary sm:col-span-2">
                  Ghi chú
                  <textarea
                    value={form.notes}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    aria-label="Ghi chú tương tác"
                    placeholder="Thông tin chi tiết cần lưu lại..."
                    rows={4}
                    className="w-full resize-y rounded-lg border border-card-border bg-input-background px-4 py-2.5 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:text-input-disabled-text"
                  />
                </label>
              </div>

              {interactionTypes.length === 0 && (
                <p className="text-xs text-text-tertiary" role="status">
                  Chưa có loại tương tác phù hợp để tạo trong tab Khác.
                </p>
              )}
              {submitError && (
                <p className="text-xs text-error-600" role="alert">
                  {submitError}
                </p>
              )}
            </DialogBody>

            <DialogFooter className="border-t border-card-border px-6 py-4">
              <DialogClose
                appearance="outline"
                size="sm"
                type="button"
                isDisabled={isSubmitting}
              >
                Hủy
              </DialogClose>
              <Button
                type="submit"
                size="sm"
                isDisabled={
                  isSubmitting ||
                  interactionTypes.length === 0 ||
                  !form.interactionType ||
                  !form.interactionDate ||
                  !form.interactionTime
                }
              >
                {isSubmitting ? "Đang tạo…" : "Tạo tương tác"}
              </Button>
            </DialogFooter>
          </form>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}

function getDateTimeInputValue(date = new Date()): string {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 16);
}

function toFrappeDatetime(value: string): string {
  return value.length === 16 ? `${value.replace("T", " ")}:00` : value;
}
