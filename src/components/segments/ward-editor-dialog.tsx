"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DropdownField } from "@/components/common/dropdown-field";
import { Input } from "@/components/tailgrids/core/input";
import {
  useCreateWardMutation,
  useUpdateWardMutation,
} from "@/hooks/use-reference-catalog-queries";
import type { GeographyOption, WardOption } from "@/services/api/reference-catalog";

import { ReferenceCatalogEditorDialog } from "./reference-catalog-editor-dialog";

const DEFAULT_WARD_TYPE = "Commune";

const WARD_TYPES = [
  { id: "Commune", label: "Xã" },
  { id: "Ward", label: "Phường" },
  { id: "Township", label: "Thị trấn" },
];

function formFromRecord(record: WardOption | null, initialProvince?: string) {
  return {
    code: record?.code ?? "",
    name: record?.name ?? "",
    wardType: record?.wardType ?? DEFAULT_WARD_TYPE,
    province: record?.province ?? initialProvince ?? "",
  };
}

export function WardEditorDialog({
  isOpen,
  record,
  provinces,
  initialProvince,
  onOpenChange,
}: {
  isOpen: boolean;
  record: WardOption | null;
  provinces: readonly GeographyOption[];
  initialProvince?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(() => formFromRecord(record, initialProvince));
  const createMutation = useCreateWardMutation();
  const updateMutation = useUpdateWardMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const provinceName = provinces.find((province) => province.id === form.province)?.name;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    if (!code || !name || !form.province) {
      toast.error("Vui lòng nhập mã, tên và chọn tỉnh cho xã/phường.");
      return;
    }
    const data = {
      ward_code: code,
      ward_name: name,
      ward_type: form.wardType,
      province: form.province,
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
      toast.error(error instanceof Error ? error.message : "Không thể lưu xã/phường.");
    }
  };

  return (
    <ReferenceCatalogEditorDialog
      isOpen={isOpen}
      title={record ? "Chỉnh sửa xã/phường" : "Tạo xã/phường"}
      description="Chọn tỉnh để liên kết trực tiếp với xã/phường."
      isSaving={isSaving}
      submitLabel={record ? "Lưu thay đổi" : "Tạo xã/phường"}
      onOpenChange={onOpenChange}
      onSubmit={save}
    >
      {!record && initialProvince && provinceName && (
        <div className="rounded-lg bg-background-gray-secondary px-3 py-2 text-sm text-text-secondary">
          Đang tạo xã/phường cho <span className="font-semibold text-text-primary">{provinceName}</span>.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Mã xã/phường</span>
          <Input
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            disabled={Boolean(record) || isSaving}
            maxLength={50}
            placeholder="Ví dụ: 00001"
            className="h-10 w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Tên xã/phường</span>
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            disabled={Boolean(record) || isSaving}
            placeholder="Ví dụ: Phường Bến Nghé"
            className="h-10 w-full"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Tỉnh/thành liên kết</span>
          <DropdownField
            ariaLabel="Tỉnh/thành liên kết"
            options={provinces.map((province) => ({
              id: province.id,
              label: province.name,
              searchText: province.code ?? undefined,
            }))}
            value={form.province}
            onChange={(value) => setForm((current) => ({ ...current, province: value ?? "" }))}
            isSearchable
            searchPlaceholder="Tìm tỉnh/thành..."
            isDisabled={isSaving || provinces.length === 0}
            isRequired
            emptyMessage="Chưa có tỉnh/thành phù hợp."
          />
          {record && (
            <span className="text-xs text-text-tertiary">
              Tỉnh là liên kết chính của xã/phường.
            </span>
          )}
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Loại đơn vị</span>
          <DropdownField
            ariaLabel="Loại xã/phường"
            options={WARD_TYPES}
            value={form.wardType}
            onChange={(value) =>
              setForm((current) => ({ ...current, wardType: value ?? DEFAULT_WARD_TYPE }))
            }
            isDisabled={isSaving}
          />
        </label>
      </div>
      {record && (
        <p className="text-xs text-text-tertiary">
          Mã và tên xã/phường là định danh liên kết nên không thể đổi tại đây.
        </p>
      )}
    </ReferenceCatalogEditorDialog>
  );
}
