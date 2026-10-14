"use client";

import { formatDialogError } from "@/utils/dialog-error";
import { getDefaultCampusOption } from "@/utils/default-campus";

import { useState, type FormEvent } from "react";

import { DatePickerField } from "@/components/common/date-picker-field";
import { DropdownField } from "@/components/common/dropdown-field";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Toggle } from "@/components/tailgrids/core/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import {
  channelTypeOptionsForMode,
  type ChannelTypeOption,
  type ChannelTypeValue,
  isChannelTypeValidForMode,
} from "./channel-types";
import {
  validateCampaignForm,
  type CampaignFormErrors,
} from "./campaign-form-validation";
import {
  campaignModeLabel,
  campaignModeOptions,
  campaignStatusLabel,
  campaignStatusOptions,
  getCampaignModeLabel,
  getCampaignStatusLabel,
} from "./mappings";
import type {
  CampaignRoutingOption,
  CampaignRoutingOptions,
  CampaignRoutingTargetType,
} from "@/services/api/lead-sale";
import type {
  CampaignFormState,
  CampaignFormValues,
  CampaignListItem,
  CampaignMode,
  CampaignStatus,
} from "./types";

interface CampaignFormDialogProps {
  campaign: CampaignListItem | null;
  channelTypes: readonly ChannelTypeOption[];
  routingOptions: CampaignRoutingOptions;
  isLoadingCampuses?: boolean;
  campusLoadError?: string;
  onClose: () => void;
  onSubmit: (campaign: CampaignFormValues) => void | Promise<void>;
}

export function formFromCampaign(
  campaign: CampaignListItem | null,
): CampaignFormState {
  return {
    name: campaign?.name ?? "",
    admissionYear: campaign
      ? String(campaign.admissionYear ?? "")
      : String(new Date().getFullYear()),
    startDate: campaign?.startDate ?? "",
    endDate: campaign?.endDate ?? "",
    status: campaign ? campaign.status : "DRAFT",
    mode: campaign ? campaign.mode : "OFFLINE",
    channelType: campaign?.channelType ?? "",
    channelUrl: campaign?.channelUrl ?? "",
    campus: campaign?.campus ?? "",
    leadRoutingEnabled: campaign?.leadRoutingEnabled ?? false,
    leadRoutingTargetType: campaign?.leadRoutingTargetType ?? "",
    leadRoutingTargetTeam: campaign?.leadRoutingTargetTeam ?? "",
    leadRoutingTargetGroup: campaign?.leadRoutingTargetGroup ?? "",
  };
}

export function filterCampaignGroupOptions(
  groups: CampaignRoutingOption[],
  selectedCampusId?: string,
): CampaignRoutingOption[] {
  return selectedCampusId
    ? groups.filter((option) => option.campusIds?.includes(selectedCampusId))
    : groups;
}

export function toCampaignFormValues(
  form: CampaignFormState,
): CampaignFormValues {
  return {
    name: form.name.trim(),
    admissionYear: form.admissionYear.trim()
      ? Number(form.admissionYear)
      : null,
    startDate: form.startDate.trim(),
    endDate: form.endDate.trim(),
    status: form.status,
    mode: form.mode,
    channelType: form.channelType,
    channelUrl: form.channelUrl.trim(),
    campus: form.campus,
    leadRoutingEnabled: form.leadRoutingEnabled,
    leadRoutingTargetType: form.leadRoutingTargetType,
    leadRoutingTargetTeam: form.leadRoutingTargetTeam,
    leadRoutingTargetGroup: form.leadRoutingTargetGroup,
  };
}

export default function CampaignFormDialog({
  campaign,
  channelTypes,
  routingOptions,
  isLoadingCampuses = false,
  campusLoadError,
  onClose,
  onSubmit,
}: CampaignFormDialogProps) {
  const isEditing = Boolean(campaign);
  const [draft, setForm] = useState<CampaignFormState>(() =>
    formFromCampaign(campaign),
  );
  const form: CampaignFormState = {
    ...draft,
    campus: isEditing
      ? draft.campus
      : draft.campus || getDefaultCampusOption(routingOptions.campuses)?.label || "",
  };
  const [fieldErrors, setFieldErrors] = useState<CampaignFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      if (field === "startDate" || field === "endDate") {
        delete next.startDate;
        delete next.endDate;
      }
      return next;
    });
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (isLoadingCampuses || campusLoadError) return;
    const nextErrors = validateCampaignForm(form, channelTypes);
    if (
      form.campus &&
      !routingOptions.campuses.some((option) => option.label === form.campus)
    ) {
      nextErrors.campus = "Campus không còn khả dụng. Vui lòng chọn lại.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setSubmitError(null);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(toCampaignFormValues(form));
    } catch (submitError) {
      setSubmitError(
        formatDialogError(submitError, "Không thể lưu chiến dịch.", { title: "Tên chiến dịch" }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (nextMode: CampaignMode) => {
    setForm((current) => ({
      ...current,
      mode: nextMode,
      channelType: isChannelTypeValidForMode(
        current.channelType,
        nextMode,
        channelTypes,
      )
        ? current.channelType
        : "",
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.mode;
      delete next.channelType;
      return next;
    });
    setSubmitError(null);
  };

  const fieldError = (field: keyof CampaignFormState) => fieldErrors[field];
  const teamOptions = routingOptions.teams.filter(
    (option) => !form.campus || !option.campus || option.campus === form.campus,
  );
  const selectedCampusId = routingOptions.campuses.find(
    (option) => option.label === form.campus,
  )?.id;
  const groupOptions = filterCampaignGroupOptions(
    routingOptions.groups,
    selectedCampusId,
  );

  const handleRoutingTargetTypeChange = (value: string) => {
    const targetType = value as CampaignRoutingTargetType;
    setForm((current) => ({
      ...current,
      leadRoutingTargetType: targetType,
      leadRoutingTargetTeam:
        targetType === "Team" ? current.leadRoutingTargetTeam : "",
      leadRoutingTargetGroup:
        targetType === "Team Group" ? current.leadRoutingTargetGroup : "",
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.leadRoutingTargetType;
      delete next.leadRoutingTargetTeam;
      delete next.leadRoutingTargetGroup;
      return next;
    });
    setSubmitError(null);
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog
        aria-label={
          isEditing
            ? `Sửa chiến dịch ${campaign?.name}`
            : "Tạo chiến dịch tuyển sinh"
        }
        className="max-w-120 p-0"
      >
        <form onSubmit={handleSubmit}>
          <div className="border-b border-card-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-text-primary">
              {isEditing
                ? "Sửa chiến dịch tuyển sinh"
                : "Tạo chiến dịch tuyển sinh"}
            </DialogTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              {isEditing
                ? "Cập nhật thông tin chiến dịch hiện có."
                : "Khởi tạo một kỳ tuyển sinh mới. Bạn có thể chỉnh sửa thêm sau."}
            </p>
          </div>

          <DialogBody className="space-y-3 px-5 py-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-input-label-text">
                Campus <span aria-hidden="true">*</span>
              </span>
              <DropdownField
                options={routingOptions.campuses.map((option) => ({
                  id: option.label,
                  label: option.label,
                }))}
                value={form.campus}
                selectedLabel={form.campus || undefined}
                onChange={(value) => {
                  setField("campus", value ?? "");
                  setField("leadRoutingTargetTeam", "");
                  setField("leadRoutingTargetGroup", "");
                }}
                ariaLabel="Campus của chiến dịch"
                placeholder="Chọn Campus"
                isRequired
                isLoading={isLoadingCampuses}
                isError={Boolean(campusLoadError)}
                errorMessage={campusLoadError}
                emptyMessage="Chưa có Campus khả dụng."
                isDisabled={
                  isSubmitting || isLoadingCampuses || Boolean(campusLoadError)
                }
                isInvalid={Boolean(fieldError("campus"))}
                ariaDescribedBy={
                  fieldError("campus") ? "campaign-campus-error" : undefined
                }
              />
              <FormFieldError
                id="campaign-campus-error"
                message={fieldError("campus") || campusLoadError}
              />
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">
                Năm tuyển sinh
              </span>
              <Input
                type="number"
                value={form.admissionYear}
                onChange={(event) =>
                  setField("admissionYear", event.target.value)
                }
                aria-describedby={
                  fieldError("admissionYear")
                    ? "campaign-admission-year-error"
                    : undefined
                }
                aria-invalid={Boolean(fieldError("admissionYear"))}
                className="h-9 w-full px-3 py-2 text-sm"
              />
              <FormFieldError
                id="campaign-admission-year-error"
                message={fieldError("admissionYear")}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">
                Tên chiến dịch
              </span>
              <Input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Ví dụ: Đợt 1"
                aria-describedby={
                  fieldError("name") ? "campaign-name-error" : undefined
                }
                aria-invalid={Boolean(fieldError("name"))}
                className="h-9 w-full px-3 py-2 text-sm"
              />
              <FormFieldError
                id="campaign-name-error"
                message={fieldError("name")}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Ngày bắt đầu
                </span>
                <DatePickerField
                  value={form.startDate}
                  onChange={(value) => setField("startDate", value)}
                  ariaLabel="Ngày bắt đầu"
                  aria-describedby={
                    fieldError("startDate")
                      ? "campaign-start-date-error"
                      : undefined
                  }
                  isInvalid={Boolean(fieldError("startDate"))}
                  className="h-9 w-full px-3 py-2 text-sm"
                />
                <FormFieldError
                  id="campaign-start-date-error"
                  message={fieldError("startDate")}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Ngày kết thúc
                </span>
                <DatePickerField
                  value={form.endDate}
                  onChange={(value) => setField("endDate", value)}
                  ariaLabel="Ngày kết thúc"
                  aria-describedby={
                    fieldError("endDate")
                      ? "campaign-end-date-error"
                      : undefined
                  }
                  isInvalid={Boolean(fieldError("endDate"))}
                  className="h-9 w-full px-3 py-2 text-sm"
                />
                <FormFieldError
                  id="campaign-end-date-error"
                  message={fieldError("endDate")}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Trạng thái
                </span>
                <Select
                  value={form.status}
                  onChange={(value) =>
                    setField("status", String(value) as CampaignStatus)
                  }
                  aria-label="Trạng thái chiến dịch"
                  aria-describedby={
                    fieldError("status") ? "campaign-status-error" : undefined
                  }
                  isInvalid={Boolean(fieldError("status"))}
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue>
                      {getCampaignStatusLabel(form.status)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {campaignStatusOptions.map((status) => (
                      <SelectItem
                        key={status}
                        id={status}
                        textValue={campaignStatusLabel[status]}
                      >
                        {campaignStatusLabel[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormFieldError
                  id="campaign-status-error"
                  message={fieldError("status")}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Hình thức
                </span>
                <Select
                  value={form.mode}
                  onChange={(value) =>
                    handleModeChange(String(value) as CampaignMode)
                  }
                  aria-label="Hình thức chiến dịch"
                  aria-describedby={
                    fieldError("mode") ? "campaign-mode-error" : undefined
                  }
                  isInvalid={Boolean(fieldError("mode"))}
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue>{getCampaignModeLabel(form.mode)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {campaignModeOptions.map((mode) => (
                      <SelectItem
                        key={mode}
                        id={mode}
                        textValue={campaignModeLabel[mode]}
                      >
                        {campaignModeLabel[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormFieldError
                  id="campaign-mode-error"
                  message={fieldError("mode")}
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">
                Loại kênh
              </span>
              <DropdownField
                ariaLabel="Loại kênh"
                ariaDescribedBy={
                  fieldError("channelType")
                    ? "campaign-channel-type-error"
                    : undefined
                }
                className="w-full"
                isDisabled={isSubmitting}
                isInvalid={Boolean(fieldError("channelType"))}
                onChange={(value) =>
                  setField("channelType", (value as ChannelTypeValue) ?? "")
                }
                options={channelTypeOptionsForMode(channelTypes, form.mode).map(
                  (option) => ({
                    id: option.code,
                    label: option.displayName,
                  }),
                )}
                placeholder="Chọn loại kênh"
                value={form.channelType || null}
              />
              <FormFieldError
                id="campaign-channel-type-error"
                message={fieldError("channelType")}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">
                Channel URL
              </span>
              <Input
                value={form.channelUrl}
                onChange={(event) => setField("channelUrl", event.target.value)}
                placeholder={
                  form.mode === "OFFLINE"
                    ? "Ví dụ: https://forms.gle/..."
                    : "Ví dụ: https://meet.google.com/..."
                }
                aria-describedby={
                  fieldError("channelUrl")
                    ? "campaign-channel-url-error"
                    : undefined
                }
                aria-invalid={Boolean(fieldError("channelUrl"))}
                className="h-9 w-full px-3 py-2 text-sm"
              />
              <FormFieldError
                id="campaign-channel-url-error"
                message={fieldError("channelUrl")}
              />
            </label>

            <section className="rounded-lg border border-card-border bg-card-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Phân bổ Lead theo Campaign
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-text-tertiary">
                    Chọn Team hoặc Team Group nhận Lead khi hệ thống phân bổ
                    theo Campaign.
                  </p>
                </div>
                <Toggle
                  aria-label="Bật phân bổ Lead theo Campaign"
                  checked={form.leadRoutingEnabled}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setField("leadRoutingEnabled", event.target.checked)
                  }
                />
              </div>

              {form.leadRoutingEnabled && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-input-label-text">
                      Đích phân bổ
                    </span>
                    <Select
                      value={form.leadRoutingTargetType}
                      onChange={(value) =>
                        handleRoutingTargetTypeChange(String(value))
                      }
                      aria-label="Đích phân bổ Campaign"
                      isInvalid={Boolean(fieldError("leadRoutingTargetType"))}
                    >
                      <SelectTrigger className="h-9 w-full text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem id="" textValue="Chọn đích phân bổ">
                          Chọn đích phân bổ
                        </SelectItem>
                        <SelectItem id="Team" textValue="Một Team">
                          Một Team
                        </SelectItem>
                        <SelectItem id="Team Group" textValue="Team Group">
                          Team Group
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormFieldError
                      id="campaign-routing-target-type-error"
                      message={fieldError("leadRoutingTargetType")}
                    />
                  </label>

                  {form.leadRoutingTargetType === "Team" ? (
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-input-label-text">
                        Team nhận Lead
                      </span>
                      <Select
                        value={form.leadRoutingTargetTeam}
                        onChange={(value) =>
                          setField("leadRoutingTargetTeam", String(value))
                        }
                        aria-label="Team nhận Lead của Campaign"
                        isInvalid={Boolean(fieldError("leadRoutingTargetTeam"))}
                      >
                        <SelectTrigger className="h-9 w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem id="" textValue="Chọn Team">
                            Chọn Team
                          </SelectItem>
                          {teamOptions.map((option) => (
                            <SelectItem
                              key={option.id}
                              id={option.id}
                              textValue={option.label}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormFieldError
                        id="campaign-routing-target-team-error"
                        message={fieldError("leadRoutingTargetTeam")}
                      />
                    </label>
                  ) : form.leadRoutingTargetType === "Team Group" ? (
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-input-label-text">
                        Team Group nhận Lead
                      </span>
                      <Select
                        value={form.leadRoutingTargetGroup}
                        onChange={(value) =>
                          setField("leadRoutingTargetGroup", String(value))
                        }
                        aria-label="Team Group nhận Lead của Campaign"
                        isInvalid={Boolean(
                          fieldError("leadRoutingTargetGroup"),
                        )}
                      >
                        <SelectTrigger className="h-9 w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem id="" textValue="Chọn Team Group">
                            Chọn Team Group
                          </SelectItem>
                          {groupOptions.map((option) => (
                            <SelectItem
                              key={option.id}
                              id={option.id}
                              textValue={option.label}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormFieldError
                        id="campaign-routing-target-group-error"
                        message={fieldError("leadRoutingTargetGroup")}
                      />
                    </label>
                  ) : null}
                </div>
              )}
            </section>

            {submitError && (
              <p className="text-xs text-badge-error-text whitespace-pre-line break-words" role="alert">
                {submitError}
              </p>
            )}
          </DialogBody>

          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" type="button">
              Hủy
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              isDisabled={
                isSubmitting ||
                isLoadingCampuses ||
                Boolean(campusLoadError) ||
                routingOptions.campuses.length === 0
              }
            >
              {isEditing ? "Lưu thay đổi" : "Tạo chiến dịch"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}

function FormFieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-badge-error-text" role="alert">
      {message}
    </p>
  );
}
