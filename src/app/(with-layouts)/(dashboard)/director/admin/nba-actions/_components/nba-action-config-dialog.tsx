"use client";

import { InfoCircle } from "@tailgrids/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertContent, AlertDescription, AlertIndicator } from "@/components/tailgrids/core/alert";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Dialog, DialogBody, DialogClose, DialogFooter } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useCreateNbaActionMutation, useDeleteNbaActionMutation, useNbaActionQuery, useUpdateNbaActionMutation } from "@/hooks/use-nba-actions-queries";
import type { ActionChannel, ActionExecutionType, ActionTimeSlot, CreateNbaActionPayload, NbaAction, NbaActionType, UpdateNbaActionPayload } from "@/services/api/nba-actions";

import NbaAdminDialogHeader from "./nba-admin-dialog-header";
import NbaTimeWindowEditor from "./nba-time-window-editor";
import { getActionPurpose } from "./types";

const ACTION_ROLES = ["Sale", "Lead Sales", "Marketing", "Promoter", "Admissions Director", "System Manager"] as const;

const CHANNEL_OPTIONS: Array<{ id: ActionChannel; label: string }> = [
  { id: "NONE", label: "Không có kênh" },
  { id: "CALL", label: "Cuộc gọi" },
  { id: "EMAIL", label: "Email" },
  { id: "MESSAGE", label: "Tin nhắn" },
];

const EXECUTION_OPTIONS: Array<{ id: ActionExecutionType; label: string }> = [
  { id: "MANUAL", label: "Thực hiện thủ công" },
  { id: "AI_ASSISTED", label: "Có AI hỗ trợ" },
];

interface NbaActionConfigDialogProps {
  action: NbaAction | null;
  actionTypes: NbaActionType[];
  availableTimeSlots: ActionTimeSlot[];
  canEdit: boolean;
  isTimeSlotsReady: boolean;
  timeSlotsError: boolean;
  onClose: () => void;
}

interface ActionFormState {
  code: string;
  displayName: string;
  actionType: string;
  description: string;
  purpose: string;
  defaultChannel: ActionChannel;
  allowedActors: string[];
  allowedTimeSlots: ActionTimeSlot[];
  requiresApproval: boolean;
  autoExecute: boolean;
  executionType: ActionExecutionType;
  aiAllowed: boolean;
  enabled: boolean;
  sortOrder: string;
}

function formFromAction(action: NbaAction | null): ActionFormState {
  return {
    code: action?.code ?? "",
    displayName: action?.displayName ?? "",
    actionType: action?.actionType ?? "",
    description: action?.description ?? "",
    purpose: action?.purpose ?? "",
    defaultChannel: action?.defaultChannel ?? "NONE",
    allowedActors: action?.allowedActors ?? [],
    allowedTimeSlots: action?.allowedTimeSlots ?? [],
    requiresApproval: action?.requiresApproval ?? false,
    autoExecute: action?.autoExecute ?? false,
    executionType: action?.executionType ?? "MANUAL",
    aiAllowed: action?.aiAllowed ?? false,
    enabled: action?.enabled ?? false,
    sortOrder: String(action?.sortOrder ?? 100),
  };
}

function FormSelect({ label, value, options, onChange, disabled }: { label: string; value: string; options: readonly { id: string; label: string }[]; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-input-label-text">{label}</span>
      <Select value={value} onChange={(next) => onChange(String(next))} isDisabled={disabled} aria-label={label}>
        <SelectTrigger className="h-8.5 w-full text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option.id} id={option.id} textValue={option.label}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
    </label>
  );
}

export default function NbaActionConfigDialog({ action, actionTypes, availableTimeSlots, canEdit, isTimeSlotsReady, timeSlotsError, onClose }: NbaActionConfigDialogProps) {
  const isNew = action === null;
  const detailQuery = useNbaActionQuery(action?.name ?? "");
  const createMutation = useCreateNbaActionMutation();
  const updateMutation = useUpdateNbaActionMutation();
  const deleteMutation = useDeleteNbaActionMutation();
  const actualAction = detailQuery.data ?? action;
  const [form, setForm] = useState(() => formFromAction(action));

  useEffect(() => {
    if (detailQuery.data) setForm(formFromAction(detailQuery.data));
  }, [detailQuery.data]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const actionTypeOptions = actionTypes.map((item) => ({ id: item.name, label: `${item.displayName}${item.enabled ? "" : " · Tạm dừng"}` }));
  const selectedType = actionTypes.find((item) => item.name === form.actionType);
  const editorDisabled = !canEdit || !isTimeSlotsReady || timeSlotsError;

  const setField = <K extends keyof ActionFormState>(field: K, value: ActionFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.code.trim()) return "Vui lòng nhập mã Action.";
    if (!/^[A-Z0-9_]+$/.test(form.code.trim())) return "Mã Action chỉ gồm A-Z, 0-9 và dấu gạch dưới.";
    if (!form.displayName.trim()) return "Vui lòng nhập tên Action.";
    if (!form.actionType) return "Vui lòng chọn nhóm hành động.";
    if (form.enabled && selectedType && !selectedType.enabled) return "Không thể bật Action khi nhóm hành động đang tắt.";
    if (form.allowedActors.length === 0) return "Chọn ít nhất một vai trò được phép thực hiện Action.";
    if (form.requiresApproval && form.autoExecute) return "Action không thể vừa yêu cầu duyệt vừa tự động thực hiện.";
    if (form.autoExecute && !form.enabled) return "Action tự động thực hiện không được tắt.";
    if (form.executionType === "AI_ASSISTED" && !form.aiAllowed) return "Cách thực hiện có AI cần bật quyền AI.";
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) return "Thứ tự hiển thị phải là số nguyên không âm.";
    if (form.code === "CALL" && !["CALL", "NONE"].includes(form.defaultChannel)) return "Action CALL chỉ dùng kênh CALL hoặc NONE.";
    if (form.code === "SEND_EMAIL" && !["EMAIL", "NONE"].includes(form.defaultChannel)) return "Action SEND_EMAIL chỉ dùng kênh EMAIL hoặc NONE.";
    return null;
  };

  const commonPayload = {
    displayName: form.displayName.trim(),
    actionType: form.actionType,
    description: form.description.trim(),
    purpose: form.purpose.trim(),
    defaultChannel: form.defaultChannel,
    allowedActors: form.allowedActors,
    allowedTimeSlots: form.allowedTimeSlots,
    requiresApproval: form.requiresApproval,
    autoExecute: form.autoExecute,
    executionType: form.executionType,
    aiAllowed: form.aiAllowed,
    enabled: form.enabled,
    sortOrder: Number(form.sortOrder),
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      if (actualAction) {
        await updateMutation.mutateAsync({ name: actualAction.name, ...commonPayload } satisfies UpdateNbaActionPayload);
      } else {
        await createMutation.mutateAsync({ code: form.code.trim(), ...commonPayload } satisfies CreateNbaActionPayload);
      }
      toast.success(isNew ? "Đã tạo Action mới." : "Đã cập nhật Action.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa thể lưu Action.");
    }
  };

  const handleDelete = async () => {
    if (!actualAction || !window.confirm(`Xóa Action ${actualAction.code}? Nếu Action đã được sử dụng, hãy tắt thay vì xóa.`)) return;
    try {
      await deleteMutation.mutateAsync(actualAction.name);
      toast.success(`Đã xóa Action ${actualAction.code}.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa thể xóa Action. Nếu đã được tham chiếu, hãy tắt Action.");
    }
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog
        aria-label={isNew ? "Tạo Action" : `Cấu hình ${actualAction?.displayName ?? action?.displayName ?? "Action"}`}
        className="flex max-h-[min(92vh,46rem)] w-full max-w-210 flex-col overflow-hidden p-0"
      >
        <NbaAdminDialogHeader
          code={actualAction?.code ?? (form.code || "ACTION_MỚI")}
          title={isNew ? "Tạo Action" : actualAction?.displayName ?? "Cấu hình Action"}
          description={isNew ? "Định nghĩa một hành động mới mà đội ngũ tuyển sinh có thể thực hiện." : actualAction ? getActionPurpose(actualAction) : "Cấu hình hành động tuyển sinh."}
          canEdit={canEdit}
          rightLabel={canEdit ? (isNew ? "Tạo cấu hình" : "Có thể chỉnh sửa") : "Chế độ chỉ xem"}
          status={actualAction && <Badge color={actualAction.enabled ? "success" : "gray"}>{actualAction.enabled ? "Đang dùng" : "Tạm dừng"}</Badge>}
        />

        <DialogBody className="flex-1 overflow-y-auto px-5 py-3">
          {!canEdit && <Alert status="info"><AlertIndicator><InfoCircle aria-hidden="true" /></AlertIndicator><AlertContent><AlertDescription>Bạn có thể xem cấu hình. Chỉ System Manager được thay đổi Action.</AlertDescription></AlertContent></Alert>}
          {timeSlotsError && <Alert status="error"><AlertIndicator /><AlertContent><AlertDescription>Không tải được danh sách khung giờ. Hãy tải lại trang trước khi lưu.</AlertDescription></AlertContent></Alert>}
          {detailQuery.error && !isNew && <Alert status="warning"><AlertIndicator /><AlertContent><AlertDescription>Không tải được chi tiết mới nhất; đang hiển thị dữ liệu từ danh sách.</AlertDescription></AlertContent></Alert>}
          <div className="mt-2 grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <section className="space-y-2" aria-labelledby="action-basic-heading">
                <div>
                  <h2 id="action-basic-heading" className="text-sm font-semibold text-text-primary">Thông tin Action</h2>
                  <p className="mt-0.5 text-xs leading-4 text-text-secondary">Mã Action là định danh bất biến sau khi tạo.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-0.5">
                    <span className="text-xs font-medium text-input-label-text">Mã Action</span>
                    <Input
                      value={form.code}
                      onChange={(event) => setField("code", event.target.value.toUpperCase())}
                      readOnly={!isNew}
                      disabled={!canEdit || !isNew}
                      placeholder="Ví dụ: SEND_EMAIL"
                      className="h-8.5 w-full px-3 py-1.5 text-sm"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-xs font-medium text-input-label-text">Tên hiển thị</span>
                    <Input
                      value={form.displayName}
                      onChange={(event) => setField("displayName", event.target.value)}
                      disabled={!canEdit}
                      placeholder="Ví dụ: Gửi Email tư vấn"
                      className="h-8.5 w-full px-3 py-1.5 text-sm"
                    />
                  </label>
                  <FormSelect
                    label="Nhóm hành động"
                    value={form.actionType}
                    options={actionTypeOptions}
                    onChange={(value) => setField("actionType", value)}
                    disabled={!canEdit || actionTypes.length === 0}
                  />
                  <FormSelect
                    label="Kênh mặc định"
                    value={form.defaultChannel}
                    options={CHANNEL_OPTIONS}
                    onChange={(value) => setField("defaultChannel", value as ActionChannel)}
                    disabled={!canEdit}
                  />
                  <FormSelect
                    label="Cách thực hiện"
                    value={form.executionType}
                    options={EXECUTION_OPTIONS}
                    onChange={(value) => setField("executionType", value as ActionExecutionType)}
                    disabled={!canEdit}
                  />
                  <label className="space-y-0.5">
                    <span className="text-xs font-medium text-input-label-text">Thứ tự hiển thị</span>
                    <Input
                      type="number"
                      min="0"
                      value={form.sortOrder}
                      onChange={(event) => setField("sortOrder", event.target.value)}
                      disabled={!canEdit}
                      className="h-8.5 w-full px-3 py-1.5 text-sm"
                    />
                  </label>
                  <label className="space-y-0.5 sm:col-span-2">
                    <span className="text-xs font-medium text-input-label-text">Mô tả</span>
                    <TextArea
                      value={form.description}
                      onChange={(event) => setField("description", event.target.value)}
                      disabled={!canEdit}
                      rows={2}
                      placeholder="Action này làm gì trong quy trình tuyển sinh?"
                      className="min-h-13 px-3 py-1.5 text-sm"
                    />
                  </label>
                  <label className="space-y-0.5 sm:col-span-2">
                    <span className="text-xs font-medium text-input-label-text">Mục đích</span>
                    <TextArea
                      value={form.purpose}
                      onChange={(event) => setField("purpose", event.target.value)}
                      disabled={!canEdit}
                      rows={2}
                      placeholder="Kết quả mong muốn khi thực hiện Action"
                      className="min-h-13 px-3 py-1.5 text-sm"
                    />
                  </label>
                </div>
              </section>
            </div>

            <div className="space-y-3 border-t border-card-border pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-5">
              <section className="space-y-2" aria-labelledby="action-time-heading">
                <div>
                  <h2 id="action-time-heading" className="text-sm font-semibold text-text-primary">Khung giờ được phép</h2>
                  <p className="mt-0.5 text-xs leading-4 text-text-secondary">Mảng thời gian gửi trực tiếp lên Action API; không cần JSON.stringify.</p>
                </div>
                <NbaTimeWindowEditor
                  availableTimeSlots={availableTimeSlots}
                  allowedTimeSlots={form.allowedTimeSlots}
                  disabled={editorDisabled}
                  onUnlimitedChange={(isUnlimited) => setField("allowedTimeSlots", isUnlimited ? [] : availableTimeSlots.slice())}
                  onSlotsChange={(slots) => setField("allowedTimeSlots", slots)}
                />
              </section>

              <section className="space-y-2 border-t border-card-border pt-3" aria-labelledby="action-actors-heading">
                <div>
                  <h2 id="action-actors-heading" className="text-sm font-semibold text-text-primary">Vai trò được phép</h2>
                  <p className="mt-0.5 text-xs leading-4 text-text-secondary">Chọn các vai trò có thể thực hiện Action này.</p>
                </div>
                <Select
                  selectionMode="multiple"
                  value={form.allowedActors}
                  onChange={(value) => setField("allowedActors", Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [])}
                  isDisabled={!canEdit}
                  aria-label="Vai trò được phép thực hiện Action"
                >
                  <SelectTrigger size="sm" className="h-auto min-h-8.5 w-full flex-wrap justify-between gap-1 pr-2.5 pl-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                      {form.allowedActors.length === 0 ? (
                        <span className="text-sm text-text-tertiary">Chọn vai trò</span>
                      ) : (
                        form.allowedActors.map((actor) => (
                          <span key={actor} className="rounded-md bg-badge-primary-background px-1.5 py-0.5 text-xs font-medium text-text-primary">
                            {actor}
                          </span>
                        ))
                      )}
                    </div>
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent className="min-w-(--trigger-width)">
                    {ACTION_ROLES.map((actor) => (
                      <SelectItem key={actor} id={actor} textValue={actor}>
                        {actor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="space-y-2 border-t border-card-border pt-3" aria-labelledby="action-policy-heading">
                <div>
                  <h2 id="action-policy-heading" className="text-sm font-semibold text-text-primary">Quyền thực thi</h2>
                  <p className="mt-0.5 text-xs leading-4 text-text-secondary">Các ràng buộc này được kiểm tra trước khi gửi request.</p>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <Checkbox size="sm" isSelected={form.enabled} onChange={(selected) => setField("enabled", selected)} isDisabled={!canEdit} className="rounded-lg border border-card-border bg-background-gray-secondary_alt px-2.5 py-1.5 text-xs text-text-secondary">Action đang được sử dụng</Checkbox>
                  <Checkbox size="sm" isSelected={form.aiAllowed} onChange={(selected) => setField("aiAllowed", selected)} isDisabled={!canEdit} className="rounded-lg border border-card-border bg-background-gray-secondary_alt px-2.5 py-1.5 text-xs text-text-secondary">AI được phép đề xuất</Checkbox>
                  <Checkbox size="sm" isSelected={form.requiresApproval} onChange={(selected) => setField("requiresApproval", selected)} isDisabled={!canEdit || form.autoExecute} className="rounded-lg border border-card-border bg-background-gray-secondary_alt px-2.5 py-1.5 text-xs text-text-secondary">Cần duyệt trước khi thực hiện</Checkbox>
                  <Checkbox size="sm" isSelected={form.autoExecute} onChange={(selected) => setField("autoExecute", selected)} isDisabled={!canEdit || !form.enabled} className="rounded-lg border border-card-border bg-background-gray-secondary_alt px-2.5 py-1.5 text-xs text-text-secondary">Tự động thực hiện</Checkbox>
                </div>
                {form.autoExecute && <p className="text-xs text-text-tertiary">Action tự động thực hiện bắt buộc phải đang bật.</p>}
              </section>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-card-border px-5 py-2.5 sm:justify-between">
          <div>
            {canEdit && actualAction && (
              <Button variant="danger" appearance="ghost" size="sm" onPress={() => void handleDelete()} isDisabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Đang xóa…" : "Xóa Action"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <DialogClose appearance="outline" size="sm">Đóng</DialogClose>
            {canEdit && (
              <Button size="sm" onPress={() => void handleSave()} isDisabled={isSaving || detailQuery.isPending}>
                {isSaving ? "Đang lưu…" : isNew ? "Tạo Action" : "Lưu thay đổi"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
