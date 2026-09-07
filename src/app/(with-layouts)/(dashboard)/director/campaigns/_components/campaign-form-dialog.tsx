"use client";

import { useState, type FormEvent } from "react";

import { DatePickerField } from "@/components/common/date-picker-field";
import { Button } from "@/components/tailgrids/core/button";
import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";
import { Dialog, DialogBody, DialogClose, DialogFooter, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import {
  channelTypeOptionsForMode,
  isChannelTypeValidForMode,
  type ChannelTypeOption,
  type ChannelTypeValue,
  validateChannelUrl,
} from "./channel-types";
import { campaignModeLabel, campaignModeOptions, campaignStatusLabel, campaignStatusOptions } from "./mappings";
import type { CampaignFormValues, CampaignListItem, CampaignMode, CampaignStatus } from "./types";

interface CampaignFormDialogProps {
  campaign: CampaignListItem | null;
  channelTypes: readonly ChannelTypeOption[];
  onClose: () => void;
  onSubmit: (campaign: CampaignFormValues) => void | Promise<void>;
}

interface CampaignForm {
  name: string;
  admissionYear: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  mode: CampaignMode;
  channelType: ChannelTypeValue | "";
  channelUrl: string;
}

function formFromCampaign(campaign: CampaignListItem | null): CampaignForm {
  return {
    name: campaign?.name ?? "",
    admissionYear: String(campaign?.admissionYear ?? new Date().getFullYear()),
    startDate: campaign?.startDate ?? "",
    endDate: campaign?.endDate ?? "",
    status: campaign?.status ?? "DRAFT",
    mode: campaign?.mode ?? "OFFLINE",
    channelType: campaign?.channelType ?? "",
    channelUrl: campaign?.channelUrl ?? "",
  };
}

export default function CampaignFormDialog({ campaign, channelTypes, onClose, onSubmit }: CampaignFormDialogProps) {
  const isEditing = Boolean(campaign);
  const [form, setForm] = useState<CampaignForm>(() => formFromCampaign(campaign));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof CampaignForm>(field: K, value: CampaignForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên chiến dịch.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (form.startDate > form.endDate) {
      setError("Ngày bắt đầu phải trước ngày kết thúc.");
      return;
    }

    const urlError = validateChannelUrl(form.channelUrl);
    if (urlError) {
      setError(urlError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        admissionYear: Number(form.admissionYear) || new Date().getFullYear(),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        mode: form.mode,
        channelType: form.channelType,
        channelUrl: form.channelUrl.trim(),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể lưu chiến dịch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (nextMode: CampaignMode) => {
    setForm((current) => ({
      ...current,
      mode: nextMode,
      channelType: isChannelTypeValidForMode(current.channelType, nextMode, channelTypes)
        ? current.channelType
        : "",
    }));
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog aria-label={isEditing ? `Sửa chiến dịch ${campaign?.name}` : "Tạo chiến dịch tuyển sinh"} className="max-w-120 p-0">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-card-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-text-primary">
              {isEditing ? "Sửa chiến dịch tuyển sinh" : "Tạo chiến dịch tuyển sinh"}
            </DialogTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              {isEditing ? "Cập nhật thông tin chiến dịch hiện có." : "Khởi tạo một kỳ tuyển sinh mới. Bạn có thể chỉnh sửa thêm sau."}
            </p>
          </div>

          <DialogBody className="space-y-3 px-5 py-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">Năm tuyển sinh</span>
              <Input
                type="number"
                value={form.admissionYear}
                onChange={(event) => setField("admissionYear", event.target.value)}
                className="h-9 w-full px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">Tên chiến dịch</span>
              <Input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Ví dụ: Đợt 1" className="h-9 w-full px-3 py-2 text-sm" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">Ngày bắt đầu</span>
                <DatePickerField
                  value={form.startDate}
                  onChange={(value) => setField("startDate", value)}
                  ariaLabel="Ngày bắt đầu"
                  className="h-9 w-full px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">Ngày kết thúc</span>
                <DatePickerField
                  value={form.endDate}
                  onChange={(value) => setField("endDate", value)}
                  ariaLabel="Ngày kết thúc"
                  className="h-9 w-full px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">Trạng thái</span>
                <Select
                  value={form.status}
                  onChange={(value) => setField("status", String(value) as CampaignStatus)}
                  aria-label="Trạng thái chiến dịch"
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignStatusOptions.map((status) => (
                      <SelectItem key={status} id={status} textValue={campaignStatusLabel[status]}>
                        {campaignStatusLabel[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-input-label-text">Hình thức</span>
                <Select
                  value={form.mode}
                  onChange={(value) => handleModeChange(String(value) as CampaignMode)}
                  aria-label="Hình thức chiến dịch"
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignModeOptions.map((mode) => (
                      <SelectItem key={mode} id={mode} textValue={campaignModeLabel[mode]}>
                        {campaignModeLabel[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">Loại kênh</span>
              <Combobox
                value={form.channelType || null}
                onChange={(key) => setField("channelType", (key as ChannelTypeValue) ?? "")}
                aria-label="Loại kênh"
                placeholder="Chọn loại kênh"
              >
                {channelTypeOptionsForMode(channelTypes, form.mode).map((option) => (
                  <ComboboxItem key={option.code} id={option.code} textValue={option.displayName}>
                    {option.displayName}
                  </ComboboxItem>
                ))}
              </Combobox>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">Channel URL</span>
              <Input
                value={form.channelUrl}
                onChange={(event) => setField("channelUrl", event.target.value)}
                placeholder={form.mode === "OFFLINE" ? "Ví dụ: https://forms.gle/..." : "Ví dụ: https://meet.google.com/..."}
                className="h-9 w-full px-3 py-2 text-sm"
              />
            </label>

            {error && <p className="text-xs text-badge-error-text">{error}</p>}
          </DialogBody>

          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" type="button">Hủy</DialogClose>
            <Button type="submit" size="sm" isDisabled={isSubmitting}>
              {isEditing ? "Lưu thay đổi" : "Tạo chiến dịch"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
