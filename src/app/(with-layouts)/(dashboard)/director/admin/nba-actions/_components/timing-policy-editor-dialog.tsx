"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertContent, AlertDescription, AlertIndicator } from "@/components/tailgrids/core/alert";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Dialog, DialogBody, DialogClose, DialogFooter } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import {
  useCreateNbaTimingPolicyMutation,
  useDeleteNbaTimingPolicyMutation,
  useUpdateNbaTimingPolicyMutation,
} from "@/hooks/use-nba-admin-queries";
import { ACTION_TIME_SLOTS } from "@/services/api/nba-actions";
import type { NbaTimingPolicy, TimingPolicyPayload } from "@/services/api/nba-admin";

import NbaAdminDialogHeader from "./nba-admin-dialog-header";

interface TimingPolicyEditorDialogProps {
  policy: NbaTimingPolicy | null;
  canEdit: boolean;
  onClose: () => void;
}

interface TimingPolicyFormState {
  policyKey: string;
  triggerType: NbaTimingPolicy["triggerType"];
  triggerEvent: string;
  delayValue: string;
  delayUnit: NbaTimingPolicy["delayUnit"];
  timeSlot: NbaTimingPolicy["timeSlot"];
  allowedStartTime: string;
  allowedEndTime: string;
  deadlineType: NbaTimingPolicy["deadlineType"];
  deadlineOffset: string;
  recurrenceType: NbaTimingPolicy["recurrenceType"];
  recurrenceInterval: string;
  stopCondition: string;
  optimizationEnabled: boolean;
  optimizationObjective: string;
}

const triggerOptions = [
  { id: "event", label: "Theo sự kiện" },
  { id: "relative", label: "Sau một khoảng thời gian" },
  { id: "deadline", label: "Trước hạn" },
  { id: "schedule", label: "Theo lịch" },
] as const;

const delayUnitOptions = [
  { id: "minutes", label: "Phút" },
  { id: "hours", label: "Giờ" },
  { id: "days", label: "Ngày" },
] as const;

const deadlineOptions = [
  { id: "none", label: "Không đặt hạn" },
  { id: "fixed_offset", label: "Độ lệch cố định" },
  { id: "business_days", label: "Ngày làm việc" },
] as const;

const recurrenceOptions = [
  { id: "none", label: "Không lặp" },
  { id: "daily", label: "Hàng ngày" },
  { id: "weekly", label: "Hàng tuần" },
  { id: "monthly", label: "Hàng tháng" },
] as const;

function formFromPolicy(policy: NbaTimingPolicy | null): TimingPolicyFormState {
  return {
    policyKey: policy?.policyKey ?? "",
    triggerType: policy?.triggerType ?? "relative",
    triggerEvent: policy?.triggerEvent ?? "",
    delayValue: String(policy?.delayValue ?? 24),
    delayUnit: policy?.delayUnit ?? "hours",
    timeSlot: policy?.timeSlot ?? null,
    allowedStartTime: policy?.allowedStartTime ?? "",
    allowedEndTime: policy?.allowedEndTime ?? "",
    deadlineType: policy?.deadlineType ?? "none",
    deadlineOffset: String(policy?.deadlineOffset ?? 0),
    recurrenceType: policy?.recurrenceType ?? "none",
    recurrenceInterval: String(policy?.recurrenceInterval ?? 1),
    stopCondition: policy?.stopCondition ?? "",
    optimizationEnabled: policy?.optimizationEnabled ?? false,
    optimizationObjective: policy?.optimizationObjective ?? "",
  };
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-input-label-text">{label}</span>
      <Select value={value} onChange={(next) => onChange(String(next))} isDisabled={disabled} aria-label={label}>
        <SelectTrigger className="h-9 w-full text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option.id} id={option.id}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export default function TimingPolicyEditorDialog({ policy, canEdit, onClose }: TimingPolicyEditorDialogProps) {
  const [form, setForm] = useState(() => formFromPolicy(policy));
  const createMutation = useCreateNbaTimingPolicyMutation();
  const updateMutation = useUpdateNbaTimingPolicyMutation();
  const deleteMutation = useDeleteNbaTimingPolicyMutation();
  const isEditing = Boolean(policy);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const setField = <K extends keyof TimingPolicyFormState>(field: K, value: TimingPolicyFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    if (!isEditing && !form.policyKey.trim()) return "Vui lòng nhập mã chính sách.";
    if (form.triggerType === "event" && !form.triggerEvent.trim()) return "Loại kích hoạt theo sự kiện cần có mã sự kiện.";
    if (Number(form.delayValue) < 0 || Number(form.deadlineOffset) < 0) return "Giá trị thời gian không được nhỏ hơn 0.";
    if (Boolean(form.allowedStartTime) !== Boolean(form.allowedEndTime)) return "Cần nhập đủ giờ bắt đầu và giờ kết thúc.";
    if (form.optimizationEnabled && !form.optimizationObjective.trim()) return "Hãy mô tả mục tiêu tối ưu thời gian.";
    return null;
  };

  const toPayload = (): TimingPolicyPayload => ({
    ...(isEditing ? {} : { policyKey: form.policyKey.trim() }),
    triggerType: form.triggerType,
    triggerEvent: form.triggerEvent.trim(),
    delayValue: Number(form.delayValue) || 0,
    delayUnit: form.delayUnit,
    timeSlot: form.timeSlot,
    allowedStartTime: form.allowedStartTime,
    allowedEndTime: form.allowedEndTime,
    deadlineType: form.deadlineType,
    deadlineOffset: Number(form.deadlineOffset) || 0,
    recurrenceType: form.recurrenceType,
    recurrenceInterval: Number(form.recurrenceInterval) || 1,
    stopCondition: form.stopCondition.trim(),
    optimizationEnabled: form.optimizationEnabled,
    optimizationObjective: form.optimizationObjective.trim(),
  });

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      if (policy) await updateMutation.mutateAsync({ name: policy.name, payload: toPayload() });
      else await createMutation.mutateAsync(toPayload());
      toast.success(isEditing ? "Đã cập nhật chính sách thời gian." : "Đã tạo chính sách thời gian.");
      onClose();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chưa thể lưu chính sách thời gian.");
    }
  };

  const handleDelete = async () => {
    if (!policy || !window.confirm(`Xóa chính sách ${policy.policyKey}?`)) return;
    try {
      await deleteMutation.mutateAsync(policy.name);
      toast.success("Đã xóa chính sách thời gian.");
      onClose();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chưa thể xóa chính sách thời gian.");
    }
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog aria-label={isEditing ? `Chỉnh sửa ${policy?.policyKey}` : "Tạo chính sách thời gian"} className="max-h-[calc(100vh-2rem)] max-w-160 overflow-hidden p-0">
        <NbaAdminDialogHeader
          code={policy?.policyKey ?? "POLICY_MỚI"}
          title={isEditing ? "Chỉnh sửa chính sách thời gian" : "Tạo chính sách thời gian"}
          description="Thiết lập thời điểm hệ thống được phép tạo đề xuất trong quy trình tuyển sinh."
          canEdit={canEdit}
        />

        <DialogBody className="max-h-[min(44rem,calc(100vh-10rem))] space-y-3 overflow-y-auto px-5 py-3.5">
          {!canEdit && (
            <Alert status="info"><AlertIndicator /><AlertContent><AlertDescription>Bạn có thể xem cấu hình. Chỉ System Manager được thay đổi chính sách thời gian.</AlertDescription></AlertContent></Alert>
          )}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-input-label-text">Mã chính sách</span>
              <Input value={form.policyKey} onChange={(event) => setField("policyKey", event.target.value)} readOnly={isEditing} disabled={!canEdit || isEditing} placeholder="Ví dụ: FOLLOW_UP_24H" className="h-9 w-full px-3 py-2 text-sm" />
              {!isEditing && <span className="block text-[11px] leading-4 text-text-tertiary">Mã không thể thay đổi sau khi tạo.</span>}
            </label>

            <SelectField label="Loại kích hoạt" value={form.triggerType} options={triggerOptions} onChange={(value) => setField("triggerType", value as TimingPolicyFormState["triggerType"])} disabled={!canEdit} />
            <label className="space-y-1">
              <span className="text-xs font-medium text-input-label-text">Sự kiện kích hoạt</span>
              <Input value={form.triggerEvent} onChange={(event) => setField("triggerEvent", event.target.value)} disabled={!canEdit} placeholder="Ví dụ: intent.created" className="h-9 w-full px-3 py-2 text-sm" />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-input-label-text">Độ trễ</span>
              <Input type="number" min="0" value={form.delayValue} onChange={(event) => setField("delayValue", event.target.value)} disabled={!canEdit} className="h-9 w-full px-3 py-2 text-sm" />
            </label>
            <SelectField label="Đơn vị độ trễ" value={form.delayUnit} options={delayUnitOptions} onChange={(value) => setField("delayUnit", value as TimingPolicyFormState["delayUnit"])} disabled={!canEdit} />

            <SelectField label="Khung giờ ưu tiên" value={form.timeSlot ?? "none"} options={[{ id: "none", label: "Không cố định" }, ...ACTION_TIME_SLOTS.map((slot) => ({ id: slot, label: slot.replace("-", "–") }))]} onChange={(value) => setField("timeSlot", value === "none" ? null : value as TimingPolicyFormState["timeSlot"])} disabled={!canEdit} />
            <SelectField label="Loại hạn xử lý" value={form.deadlineType} options={deadlineOptions} onChange={(value) => setField("deadlineType", value as TimingPolicyFormState["deadlineType"])} disabled={!canEdit} />

            <label className="space-y-1">
              <span className="text-xs font-medium text-input-label-text">Độ lệch hạn</span>
              <Input type="number" min="0" value={form.deadlineOffset} onChange={(event) => setField("deadlineOffset", event.target.value)} disabled={!canEdit} className="h-9 w-full px-3 py-2 text-sm" />
            </label>
            <SelectField label="Lịch lặp" value={form.recurrenceType} options={recurrenceOptions} onChange={(value) => setField("recurrenceType", value as TimingPolicyFormState["recurrenceType"])} disabled={!canEdit} />

            <label className="space-y-1">
              <span className="text-xs font-medium text-input-label-text">Khoảng lặp</span>
              <Input type="number" min="1" value={form.recurrenceInterval} onChange={(event) => setField("recurrenceInterval", event.target.value)} disabled={!canEdit} className="h-9 w-full px-3 py-2 text-sm" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1"><span className="text-xs font-medium text-input-label-text">Từ giờ</span><Input type="time" value={form.allowedStartTime} onChange={(event) => setField("allowedStartTime", event.target.value)} disabled={!canEdit} className="h-9 w-full px-2.5 py-2 text-sm" /></label>
              <label className="space-y-1"><span className="text-xs font-medium text-input-label-text">Đến giờ</span><Input type="time" value={form.allowedEndTime} onChange={(event) => setField("allowedEndTime", event.target.value)} disabled={!canEdit} className="h-9 w-full px-2.5 py-2 text-sm" /></label>
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-input-label-text">Điều kiện dừng</span>
            <TextArea value={form.stopCondition} onChange={(event) => setField("stopCondition", event.target.value)} disabled={!canEdit} rows={2} placeholder="Ví dụ: matching_action_completed" className="px-3 py-2.5 text-sm" />
          </label>

          <section className="space-y-2.5 rounded-lg border border-card-border bg-background-gray-secondary_alt p-3">
            <Checkbox size="sm" isSelected={form.optimizationEnabled} onChange={(value) => setField("optimizationEnabled", value)} isDisabled={!canEdit}>Bật tối ưu hóa thời điểm</Checkbox>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">Mục tiêu tối ưu</span>
              <TextArea value={form.optimizationObjective} onChange={(event) => setField("optimizationObjective", event.target.value)} disabled={!canEdit || !form.optimizationEnabled} rows={2} placeholder="Ví dụ: Chọn giờ có khả năng liên hệ thành công cao hơn" className="px-3 py-2.5 text-sm" />
            </label>
          </section>
        </DialogBody>

        <DialogFooter className="border-t border-card-border px-5 py-3 sm:justify-between">
          <div>{canEdit && isEditing && <Button variant="danger" appearance="ghost" size="sm" onPress={() => void handleDelete()} isDisabled={deleteMutation.isPending}>Xóa chính sách</Button>}</div>
          <div className="flex gap-2"><DialogClose appearance="outline" size="sm">Đóng</DialogClose>{canEdit && <Button size="sm" onPress={() => void handleSave()} isDisabled={isSaving}>{isSaving ? "Đang lưu…" : "Lưu chính sách"}</Button>}</div>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
