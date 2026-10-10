"use client";

import { InfoCircle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
} from "@/components/tailgrids/core/alert";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  useCreateNbaActionMutation,
  useDeleteNbaActionMutation,
  useNbaActionQuery,
  useUpdateNbaActionMutation,
} from "@/hooks/use-nba-actions-queries";
import type {
  ActionTimeSlot,
  CreateNbaActionPayload,
  NbaAction,
  NbaActionType,
  UpdateNbaActionPayload,
} from "@/services/api/nba-actions";

import NbaAdminDialogHeader from "./nba-admin-dialog-header";
import NbaActionBasicFields from "./nba-action-basic-fields";
import NbaActionExecutionFields from "./nba-action-execution-fields";
import type { ActionFormState } from "./nba-action-form-types";

interface NbaActionConfigDialogProps {
  action: NbaAction | null;
  actionTypes: NbaActionType[];
  availableTimeSlots: ActionTimeSlot[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isTimeSlotsReady: boolean;
  timeSlotsError: boolean;
  onClose: () => void;
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

export default function NbaActionConfigDialog({
  action,
  actionTypes,
  availableTimeSlots,
  canCreate,
  canUpdate,
  canDelete,
  isTimeSlotsReady,
  timeSlotsError,
  onClose,
}: NbaActionConfigDialogProps) {
  const isNew = action === null;
  const detailQuery = useNbaActionQuery(action?.name ?? "");
  const createMutation = useCreateNbaActionMutation();
  const updateMutation = useUpdateNbaActionMutation();
  const deleteMutation = useDeleteNbaActionMutation();
  const actualAction = detailQuery.data ?? action;
  const canEdit = actualAction ? canUpdate : canCreate;
  const [formChanges, setFormChanges] = useState<Partial<ActionFormState>>(
    {},
  );
  const form = { ...formFromAction(actualAction), ...formChanges };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const actionTypeOptions = actionTypes.map((item) => ({
    id: item.name,
    label: `${item.displayName}${item.enabled ? "" : " · Tạm dừng"}`,
  }));
  const selectedType = actionTypes.find(
    (item) => item.name === form.actionType,
  );
  const editorDisabled = !canEdit || !isTimeSlotsReady || timeSlotsError;

  const setField = <K extends keyof ActionFormState>(
    field: K,
    value: ActionFormState[K],
  ) => {
    setFormChanges((current) => ({ ...current, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.code.trim()) return "Vui lòng nhập mã hành động.";
    if (!/^[A-Z0-9_]+$/.test(form.code.trim()))
      return "Mã hành động chỉ gồm A-Z, 0-9 và dấu gạch dưới.";
    if (!form.displayName.trim()) return "Vui lòng nhập tên hành động.";
    if (!form.actionType) return "Vui lòng chọn nhóm hành động.";
    if (form.enabled && selectedType && !selectedType.enabled)
      return "Không thể bật hành động khi nhóm hành động đang tắt.";
    if (form.allowedActors.length === 0)
      return "Chọn ít nhất một vai trò được phép thực hiện hành động.";
    if (form.requiresApproval && form.autoExecute)
      return "Hành động không thể vừa yêu cầu duyệt vừa tự động thực hiện.";
    if (form.autoExecute && !form.enabled)
      return "Hành động tự động thực hiện không được tắt.";
    if (form.executionType === "AI_ASSISTED" && !form.aiAllowed)
      return "Cách thực hiện có AI cần bật quyền AI.";
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0)
      return "Thứ tự hiển thị phải là số nguyên không âm.";
    if (form.code === "CALL" && !["CALL", "NONE"].includes(form.defaultChannel))
      return "Hành động CALL chỉ dùng kênh CALL hoặc NONE.";
    if (
      form.code === "SEND_EMAIL" &&
      !["EMAIL", "NONE"].includes(form.defaultChannel)
    )
      return "Hành động SEND_EMAIL chỉ dùng kênh EMAIL hoặc NONE.";
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
    if (actualAction ? !canUpdate : !canCreate) return;
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      if (actualAction) {
        await updateMutation.mutateAsync({
          name: actualAction.name,
          ...commonPayload,
        } satisfies UpdateNbaActionPayload);
      } else {
        await createMutation.mutateAsync({
          code: form.code.trim(),
          ...commonPayload,
        } satisfies CreateNbaActionPayload);
      }
      toast.success(isNew ? "Đã tạo hành động mới." : "Đã cập nhật hành động.");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Chưa thể lưu hành động.",
      );
    }
  };

  const handleDelete = async () => {
    if (
      !canDelete ||
      !actualAction ||
      !window.confirm(
        `Xóa hành động ${actualAction.code}? Nếu hành động đã được sử dụng, hãy tắt thay vì xóa.`,
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(actualAction.name);
      toast.success(`Đã xóa hành động ${actualAction.code}.`);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể xóa hành động. Nếu đã được tham chiếu, hãy tắt hành động.",
      );
    }
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog
        aria-label={
          isNew
            ? "Tạo hành động"
            : `Cấu hình ${actualAction?.displayName ?? action?.displayName ?? "hành động"}`
        }
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-240 flex-col overflow-hidden p-0 [&>button[aria-label=Close]]:size-8"
      >
        <NbaAdminDialogHeader
          className="px-4 py-5 pr-12 sm:px-6 sm:pr-14 [&_.font-mono]:text-xs [&_.font-mono]:text-text-secondary [&_h2]:text-xl [&_h2]:leading-7 [&_p]:text-sm"
          code={actualAction?.code ?? (form.code || "ACTION_MỚI")}
          title={
            isNew
              ? "Tạo hành động"
              : (actualAction?.displayName ?? "Cấu hình hành động")
          }
          description="Cấu hình thông tin, khung giờ và quyền thực hiện hành động."
          canEdit={canEdit}
          rightLabel={
            canEdit
              ? isNew
                ? "Tạo cấu hình"
                : "Có thể chỉnh sửa"
              : "Chế độ chỉ xem"
          }
          status={
            actualAction && (
              <Badge color={actualAction.enabled ? "success" : "gray"}>
                {actualAction.enabled ? "Đang dùng" : "Tạm dừng"}
              </Badge>
            )
          }
        />

        <DialogBody className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {!canEdit && (
            <Alert status="info">
              <AlertIndicator>
                <InfoCircle aria-hidden="true" />
              </AlertIndicator>
              <AlertContent>
                <AlertDescription>
                  Bạn có quyền xem nhưng chưa được cấp quyền thay đổi hành động.
                </AlertDescription>
              </AlertContent>
            </Alert>
          )}
          {timeSlotsError && (
            <Alert status="error">
              <AlertIndicator />
              <AlertContent>
                <AlertDescription>
                  Không tải được danh sách khung giờ. Hãy tải lại trang trước
                  khi lưu.
                </AlertDescription>
              </AlertContent>
            </Alert>
          )}
          {detailQuery.error && !isNew && (
            <Alert status="warning">
              <AlertIndicator />
              <AlertContent>
                <AlertDescription>
                  Không tải được chi tiết mới nhất; đang hiển thị dữ liệu từ
                  danh sách.
                </AlertDescription>
              </AlertContent>
            </Alert>
          )}
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <NbaActionBasicFields
              form={form}
              isNew={isNew}
              canEdit={canEdit}
              actionTypeOptions={actionTypeOptions}
              setField={setField}
            />
            <NbaActionExecutionFields
              form={form}
              canEdit={canEdit}
              editorDisabled={editorDisabled}
              availableTimeSlots={availableTimeSlots}
              setField={setField}
            />
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-card-border px-4 py-4 sm:justify-between sm:px-6">
          <div>
            {canDelete && actualAction && (
              <Button
                variant="danger"
                appearance="ghost"
                size="sm"
                className="h-11 rounded-xl px-4 text-alert-danger-title md:h-10"
                onPress={() => void handleDelete()}
                isDisabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Đang xóa…" : "Xóa hành động"}
              </Button>
            )}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <DialogClose
              appearance="outline"
              size="sm"
              className="h-11 flex-1 rounded-xl px-4 md:h-10 sm:flex-none"
            >
              Đóng
            </DialogClose>
            {canEdit && (
              <Button
                size="sm"
                className="h-11 flex-1 rounded-xl bg-primary-700 px-4 hover:bg-primary-800 md:h-10 sm:flex-none"
                onPress={() => void handleSave()}
                isDisabled={isSaving || detailQuery.isPending}
              >
                {isSaving ? "Đang lưu…" : isNew ? "Tạo hành động" : "Lưu thay đổi"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
