"use client";

import { InfoCircle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertContent, AlertDescription, AlertIndicator } from "@/components/tailgrids/core/alert";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Dialog, DialogBody, DialogClose, DialogFooter } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { useCreateNbaActionTypeMutation, useDeleteNbaActionTypeMutation, useNbaActionTypeQuery, useUpdateNbaActionTypeMutation } from "@/hooks/use-nba-admin-queries";
import type { NbaAdminActionType } from "@/services/api/nba-admin";

import NbaAdminDialogHeader from "./nba-admin-dialog-header";

const BUILT_IN_ACTION_TYPES = new Set(["CONTACT", "INFORMATION", "ENGAGEMENT", "APPLICATION", "CONVERSION", "PARENT", "RECOVERY", "INTERNAL"]);

interface ActionTypeDetailDialogProps {
  actionType: NbaAdminActionType | null;
  canEdit: boolean;
  onClose: () => void;
}

export default function ActionTypeDetailDialog({ actionType, canEdit, onClose }: ActionTypeDetailDialogProps) {
  const isNew = actionType === null;
  const detailQuery = useNbaActionTypeQuery(actionType?.name ?? "");
  const createMutation = useCreateNbaActionTypeMutation();
  const updateMutation = useUpdateNbaActionTypeMutation();
  const deleteMutation = useDeleteNbaActionTypeMutation();
  const record = detailQuery.data ?? actionType;
  const [actionTypeCode, setActionTypeCode] = useState(actionType?.actionType ?? "");
  const [displayName, setDisplayName] = useState(actionType?.displayName ?? "");
  const [sortOrder, setSortOrder] = useState(String(actionType?.sortOrder ?? 100));
  const [enabled, setEnabled] = useState(actionType?.enabled ?? true);
  const isBuiltIn = Boolean(record && BUILT_IN_ACTION_TYPES.has(record.actionType));

  const handleSave = async () => {
    const nextCode = actionTypeCode.trim().toUpperCase();
    const nextSortOrder = Number(sortOrder);
    if (!nextCode || !/^[A-Z0-9_]+$/.test(nextCode)) {
      toast.error("Mã nhóm chỉ gồm A-Z, 0-9 và dấu gạch dưới.");
      return;
    }
    if (!displayName.trim() || !Number.isInteger(nextSortOrder) || nextSortOrder < 0) {
      toast.error("Vui lòng nhập tên nhóm và thứ tự hiển thị hợp lệ.");
      return;
    }

    try {
      if (record) {
        await updateMutation.mutateAsync({ name: record.name, displayName: displayName.trim(), sortOrder: nextSortOrder, enabled });
      } else {
        await createMutation.mutateAsync({ actionType: nextCode, displayName: displayName.trim(), sortOrder: nextSortOrder, enabled });
      }
      toast.success(isNew ? "Đã tạo nhóm hành động mới." : `Đã cập nhật nhóm ${nextCode}.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa thể lưu nhóm hành động.");
    }
  };

  const handleDelete = async () => {
    if (!record || isBuiltIn || !window.confirm(`Xóa nhóm ${record.actionType}? Backend sẽ chặn nếu nhóm còn Action tham chiếu.`)) return;
    try {
      await deleteMutation.mutateAsync(record.name);
      toast.success(`Đã xóa nhóm ${record.actionType}.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa thể xóa nhóm. Nếu còn Action tham chiếu, hãy tắt nhóm.");
    }
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog aria-label={isNew ? "Tạo nhóm hành động" : `Chi tiết nhóm ${record?.actionType ?? actionTypeCode}`} className="max-h-[calc(100vh-2rem)] max-w-160 overflow-hidden p-0">
        <NbaAdminDialogHeader
          code={record?.actionType ?? (actionTypeCode || "NHÓM_MỚI")}
          title={isNew ? "Tạo nhóm hành động" : record?.displayName ?? "Chi tiết nhóm hành động"}
          description="Nhóm phân loại dùng để tổ chức danh mục hành động tuyển sinh."
          canEdit={canEdit}
          status={record && <Badge color={record.enabled ? "success" : "gray"}>{record.enabled ? "Đang dùng" : "Tạm dừng"}</Badge>}
        />

        <DialogBody className="max-h-[min(36rem,calc(100vh-10rem))] space-y-4 overflow-y-auto px-5 py-4">
          {!canEdit && <Alert status="info"><AlertIndicator><InfoCircle aria-hidden="true" /></AlertIndicator><AlertContent><AlertDescription>Bạn có thể xem cấu hình. Chỉ System Manager được thay đổi nhóm hành động.</AlertDescription></AlertContent></Alert>}
          {isBuiltIn && <Alert status="info"><AlertIndicator /><AlertContent><AlertDescription>Đây là nhóm built-in. Không thể xóa vĩnh viễn; hãy tắt nhóm nếu không muốn sử dụng.</AlertDescription></AlertContent></Alert>}
          {detailQuery.isPending && !isNew ? <p className="text-sm text-text-tertiary">Đang tải thông tin nhóm…</p> : <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2"><span className="text-xs font-medium text-input-label-text">Mã nhóm</span><Input value={record?.actionType ?? actionTypeCode} onChange={(event) => setActionTypeCode(event.target.value.toUpperCase())} readOnly={!isNew} disabled={!canEdit || !isNew} placeholder="Ví dụ: CUSTOM_SALES" className="h-9 w-full px-3 py-2 text-sm" /><span className="block text-[11px] leading-4 text-text-tertiary">Mã không thể thay đổi sau khi tạo.</span></label>
            <label className="space-y-1 sm:col-span-2"><span className="text-xs font-medium text-input-label-text">Tên nhóm</span><Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} disabled={!canEdit} placeholder="Ví dụ: Sales custom" className="h-9 w-full px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium text-input-label-text">Thứ tự hiển thị</span><Input type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} disabled={!canEdit} className="h-9 w-full px-3 py-2 text-sm" /></label>
            <div className="flex items-end pb-1"><Checkbox size="sm" isSelected={enabled} onChange={setEnabled} isDisabled={!canEdit} className="text-sm text-text-secondary">Nhóm đang được sử dụng</Checkbox></div>
          </div>}
        </DialogBody>

        <DialogFooter className="border-t border-card-border px-5 py-3 sm:justify-between">
          <div>{canEdit && record && !isBuiltIn && <Button variant="danger" appearance="ghost" size="sm" onPress={() => void handleDelete()} isDisabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Đang xóa…" : "Xóa nhóm"}</Button>}</div>
          <div className="flex gap-2"><DialogClose appearance="outline" size="sm">Đóng</DialogClose>{canEdit && <Button size="sm" onPress={() => void handleSave()} isDisabled={detailQuery.isPending || createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? "Đang lưu…" : isNew ? "Tạo nhóm" : "Lưu thay đổi"}</Button>}</div>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}
