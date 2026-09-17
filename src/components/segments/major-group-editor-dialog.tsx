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
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { TextArea } from "@/components/tailgrids/core/text-area";
import {
  useCreateMajorGroupMutation,
  useUpdateMajorGroupMutation,
} from "@/hooks/use-major-catalog-queries";
import type { MajorGroupOption } from "@/services/api/major-catalog";

interface GroupForm {
  code: string;
  name: string;
  description: string;
  enabled: boolean;
}

function formFromRecord(record: MajorGroupOption | null): GroupForm {
  return {
    code: record?.code ?? "",
    name: record?.name ?? "",
    description: record?.description ?? "",
    enabled: record?.enabled ?? true,
  };
}

export function MajorGroupEditorDialog({
  isOpen,
  record,
  onOpenChange,
}: {
  isOpen: boolean;
  record: MajorGroupOption | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(() => formFromRecord(record));
  const createMutation = useCreateMajorGroupMutation();
  const updateMutation = useUpdateMajorGroupMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const setField = <K extends keyof GroupForm>(
    field: K,
    value: GroupForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(code)) {
      toast.error(
        "Mã nhóm phải dài 2-50 ký tự, gồm A-Z, 0-9 và dấu gạch dưới.",
      );
      return;
    }
    if (!name) {
      toast.error("Vui lòng nhập tên nhóm.");
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
        toast.success(`Đã cập nhật nhóm ${name}.`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Đã tạo nhóm ${name}.`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu nhóm ngành.",
      );
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
        aria-label={record ? "Chỉnh sửa nhóm ngành" : "Tạo nhóm ngành"}
        className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0"
      >
        <form onSubmit={save}>
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>
              {record ? "Chỉnh sửa nhóm ngành" : "Tạo nhóm ngành"}
            </DialogTitle>
            <p className="text-sm text-text-tertiary">
              Nhóm ngành dùng để phân loại các Major con.
            </p>
          </DialogHeader>
          <DialogBody className="space-y-4 overflow-y-auto px-5 py-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">
                Mã nhóm
              </span>
              <Input
                value={form.code}
                onChange={(event) =>
                  setField("code", event.target.value.toUpperCase())
                }
                disabled={Boolean(record) || isSaving}
                maxLength={50}
                placeholder="Ví dụ: ENGINEERING"
                className="h-10 w-full"
              />
              <span className="text-xs text-text-tertiary">
                Mã không thể thay đổi sau khi tạo.
              </span>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">
                Tên nhóm
              </span>
              <Input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                disabled={isSaving}
                placeholder="Ví dụ: Công nghệ thông tin"
                className="h-10 w-full"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">
                Mô tả
              </span>
              <TextArea
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                disabled={isSaving}
                rows={3}
                placeholder="Mô tả ngắn về nhóm ngành"
              />
            </label>
            <Checkbox
              size="sm"
              isSelected={form.enabled}
              onChange={(selected) => setField("enabled", selected)}
              isDisabled={isSaving}
              className="min-h-10 rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 text-sm text-text-secondary"
            >
              Cho phép dùng trong danh mục
            </Checkbox>
            <p className="text-xs text-text-tertiary">
              Thứ tự hiển thị được điều chỉnh bằng nút <span className="font-medium text-text-secondary">Sắp xếp</span> ở danh sách nhóm ngành.
            </p>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button size="sm" type="submit" isDisabled={isSaving}>
              {isSaving ? "Đang lưu…" : record ? "Lưu thay đổi" : "Tạo nhóm"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
