"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DropdownField } from "@/components/common/dropdown-field";
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
import {
  useCreateMajorMutation,
  useUpdateMajorMutation,
} from "@/hooks/use-major-catalog-queries";
import type {
  MajorGroupOption,
  MajorOption,
} from "@/services/api/major-catalog";

interface MajorForm {
  name: string;
  code: string;
  degreeName: string;
  majorGroup: string;
  isActive: boolean;
}

function formFromRecord(
  record: MajorOption | null,
  defaultGroup: string,
): MajorForm {
  return {
    name: record?.name ?? "",
    code: record?.code ?? "",
    degreeName: record?.degreeName ?? "",
    majorGroup: record?.majorGroup ?? defaultGroup,
    isActive: record?.isActive ?? true,
  };
}

export function MajorEditorDialog({
  isOpen,
  record,
  groups,
  defaultGroup,
  onOpenChange,
}: {
  isOpen: boolean;
  record: MajorOption | null;
  groups: readonly MajorGroupOption[];
  defaultGroup: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(() => formFromRecord(record, defaultGroup));
  const createMutation = useCreateMajorMutation();
  const updateMutation = useUpdateMajorMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const groupOptions = groups.map((group) => ({
    id: group.id,
    label: group.name,
  }));

  const setField = <K extends keyof MajorForm>(
    field: K,
    value: MajorForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    if (!name || (!record && !form.majorGroup)) {
      toast.error(
        record
          ? "Vui lòng nhập tên ngành."
          : "Vui lòng nhập tên ngành và chọn nhóm ngành.",
      );
      return;
    }
    if (code && !/^[A-Z0-9][A-Z0-9_]{1,49}$/.test(code)) {
      toast.error(
        "Mã ngành phải dài 2-50 ký tự, gồm A-Z, 0-9 và dấu gạch dưới.",
      );
      return;
    }
    const data = {
      major_name: name,
      major_code: code || null,
      degree_name: form.degreeName.trim() || null,
      major_group: form.majorGroup,
      is_active: form.isActive,
    };
    try {
      if (record) {
        await updateMutation.mutateAsync({
          name: record.id,
          data,
          expectedModified: record.modified,
        });
        toast.success(`Đã cập nhật ngành ${name}.`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Đã tạo ngành ${name}.`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu ngành học.",
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
        aria-label={record ? "Chỉnh sửa ngành học" : "Tạo ngành học"}
        className="max-h-[calc(100vh-2rem)] max-w-xl overflow-hidden p-0"
      >
        <form onSubmit={save}>
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>
              {record ? "Chỉnh sửa ngành học" : "Tạo ngành học"}
            </DialogTitle>
            <p className="text-sm text-text-tertiary">
              Mỗi Major thuộc một nhóm ngành để dễ chọn trên hồ sơ.
            </p>
          </DialogHeader>
          <DialogBody className="space-y-4 overflow-y-auto px-5 py-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">
                Tên ngành
              </span>
              <Input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                disabled={Boolean(record) || isSaving}
                placeholder="Ví dụ: Kỹ thuật phần mềm"
                className="h-10 w-full"
              />
              {record && (
                <span className="text-xs text-text-tertiary">
                  Tên ngành là định danh liên kết và không thể đổi.
                </span>
              )}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">
                  Mã ngành
                </span>
                <Input
                  value={form.code}
                  onChange={(event) =>
                    setField("code", event.target.value.toUpperCase())
                  }
                  disabled={Boolean(record) || isSaving}
                  maxLength={50}
                  placeholder="Ví dụ: SE"
                  className="h-10 w-full"
                />
                <span className="text-xs text-text-tertiary">
                  Mã không bắt buộc với bản ghi cũ.
                </span>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-input-label-text-color">
                  Bậc / bằng cấp
                </span>
                <Input
                  value={form.degreeName}
                  onChange={(event) =>
                    setField("degreeName", event.target.value)
                  }
                  disabled={isSaving}
                  placeholder="Ví dụ: Đại học"
                  className="h-10 w-full"
                />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-input-label-text-color">
                Nhóm ngành
              </span>
              <DropdownField
                ariaLabel="Nhóm ngành"
                options={groupOptions}
                value={form.majorGroup}
                onChange={(value) => setField("majorGroup", value ?? "")}
                isSearchable
                searchPlaceholder="Tìm nhóm ngành..."
                isDisabled={isSaving || groupOptions.length === 0}
              />
            </label>
            <Checkbox
              size="sm"
              isSelected={form.isActive}
              onChange={(selected) => setField("isActive", selected)}
              isDisabled={isSaving}
              className="min-h-10 rounded-lg border border-card-border bg-background-gray-secondary_alt px-3 text-sm text-text-secondary"
            >
              Cho phép chọn trong hồ sơ mới
            </Checkbox>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button
              size="sm"
              type="submit"
              isDisabled={isSaving || groupOptions.length === 0}
            >
              {isSaving ? "Đang lưu…" : record ? "Lưu thay đổi" : "Tạo ngành"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
