"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  useCreateSchoolAreaMutation,
  useUpdateSchoolAreaMutation,
} from "@/hooks/use-reference-catalog-queries";
import type { SchoolAreaOption } from "@/services/api/reference-catalog";

interface AreaForm {
  code: string;
  name: string;
  description: string;
  enabled: boolean;
}

function formFromRecord(record: SchoolAreaOption | null): AreaForm {
  return {
    code: record?.code ?? "",
    name: record?.name ?? "",
    description: record?.description ?? "",
    enabled: record?.enabled ?? true,
  };
}

export function SchoolAreaEditorDialog({
  isOpen,
  record,
  onOpenChange,
}: {
  isOpen: boolean;
  record: SchoolAreaOption | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(() => formFromRecord(record));
  const createMutation = useCreateSchoolAreaMutation();
  const updateMutation = useUpdateSchoolAreaMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(code)) {
      toast.error("Mã khu vực phải dài 2-50 ký tự, gồm A-Z, 0-9 và dấu gạch dưới.");
      return;
    }
    if (!name) {
      toast.error("Vui lòng nhập tên khu vực.");
      return;
    }
    const data = {
      code,
      display_name: name,
      description: form.description.trim() || null,
      enabled: form.enabled,
      sort_order: record?.sortOrder ?? 0,
    };
    try {
      if (record) {
        await updateMutation.mutateAsync({
          name: record.id,
          data,
          expectedModified: record.modified,
        });
        toast.success(`Đã cập nhật ${name}.`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Đã tạo ${name}.`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu khu vực trường.");
    }
  };

  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isSaving}
      onOpenChange={(open) => {
        if (open || !isSaving) onOpenChange(open);
      }}
    >
      <Dialog
        aria-label={record ? "Chỉnh sửa khu vực trường" : "Tạo khu vực trường"}
        className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0"
      >
        <form onSubmit={save}>
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>{record ? "Chỉnh sửa khu vực trường" : "Tạo khu vực trường"}</DialogTitle>
            <p className="text-sm text-text-tertiary">
              Khu vực trường dùng để phân loại địa bàn tuyển sinh của trường THPT.
            </p>
          </DialogHeader>
          <DialogBody className="space-y-4 overflow-y-auto px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">Mã khu vực</span>
                <Input
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                  }
                  disabled={Boolean(record) || isSaving}
                  maxLength={50}
                  placeholder="Ví dụ: KV1"
                  className="h-10 w-full"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">Tên khu vực</span>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  disabled={isSaving}
                  placeholder="Ví dụ: Khu vực 1"
                  className="h-10 w-full"
                />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">Mô tả</span>
              <TextArea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                disabled={isSaving}
                rows={3}
                placeholder="Mô tả ngắn về khu vực"
              />
            </label>
            <Checkbox
              size="sm"
              isSelected={form.enabled}
              onChange={(selected) => setForm((current) => ({ ...current, enabled: selected }))}
              isDisabled={isSaving}
              className="min-h-10 rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 text-sm text-text-secondary"
            >
              Cho phép dùng trong danh mục
            </Checkbox>
            <p className="text-xs text-text-tertiary">
              Thứ tự hiển thị được điều chỉnh bằng nút <span className="font-medium text-text-secondary">Sắp xếp</span> ở danh sách khu vực.
            </p>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button size="sm" type="submit" isDisabled={isSaving}>
              {isSaving ? "Đang lưu..." : record ? "Lưu thay đổi" : "Tạo khu vực"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
