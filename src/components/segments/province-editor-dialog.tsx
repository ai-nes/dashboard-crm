"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DropdownField } from "@/components/common/dropdown-field";
import { Input } from "@/components/tailgrids/core/input";
import {
  useCreateProvinceMutation,
  useUpdateProvinceMutation,
} from "@/hooks/use-reference-catalog-queries";
import type {
  GeographyOption,
  ProvinceOption,
} from "@/services/api/reference-catalog";

import { ReferenceCatalogEditorDialog } from "./reference-catalog-editor-dialog";

const CITY_TYPES = [
  { id: "Centrally Controlled City", label: "Thành phố trực thuộc Trung ương" },
  { id: "Province", label: "Tỉnh" },
];

function formFromRecord(record: ProvinceOption | null) {
  return {
    code: record?.code ?? "",
    name: record?.name ?? "",
    region: record?.region ?? "",
    cityType: record?.cityType ?? "Province",
  };
}

export function ProvinceEditorDialog({
  isOpen,
  record,
  regions,
  onCreated,
  onOpenChange,
}: {
  isOpen: boolean;
  record: ProvinceOption | null;
  regions: readonly GeographyOption[];
  onCreated?: (province: ProvinceOption) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(() => formFromRecord(record));
  const createMutation = useCreateProvinceMutation();
  const updateMutation = useUpdateProvinceMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    if (!code || !name) {
      toast.error("Vui lòng nhập mã và tên tỉnh/thành.");
      return;
    }
    const data = {
      province_code: code,
      province_name: name,
      region: form.region || null,
      city_type: form.cityType,
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
        const createdProvince = await createMutation.mutateAsync(data);
        toast.success(`Đã tạo ${name}.`);
        onCreated?.(createdProvince);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu tỉnh/thành.");
    }
  };

  return (
    <ReferenceCatalogEditorDialog
      isOpen={isOpen}
      title={record ? "Chỉnh sửa tỉnh/thành" : "Tạo tỉnh/thành"}
      description="Mã và tên tỉnh/thành được giữ cố định để không làm hỏng liên kết dữ liệu."
      isSaving={isSaving}
      submitLabel={record ? "Lưu thay đổi" : "Tạo tỉnh/thành"}
      onOpenChange={onOpenChange}
      onSubmit={save}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Mã tỉnh/thành</span>
          <Input
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            disabled={Boolean(record) || isSaving}
            maxLength={50}
            placeholder="Ví dụ: 79"
            className="h-10 w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Tên tỉnh/thành</span>
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            disabled={Boolean(record) || isSaving}
            placeholder="Ví dụ: Thành phố Hồ Chí Minh"
            className="h-10 w-full"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Vùng miền</span>
          <DropdownField
            ariaLabel="Vùng miền"
            options={regions.map((region) => ({ id: region.id, label: region.name }))}
            value={form.region}
            onChange={(value) => setForm((current) => ({ ...current, region: value ?? "" }))}
            isSearchable
            searchPlaceholder="Tìm vùng miền..."
            isDisabled={isSaving}
            placeholder="Không phân vùng"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-input-label-text-color">Loại đơn vị</span>
          <DropdownField
            ariaLabel="Loại đơn vị"
            options={CITY_TYPES}
            value={form.cityType}
            onChange={(value) => setForm((current) => ({ ...current, cityType: value ?? "Province" }))}
            isDisabled={isSaving}
          />
        </label>
      </div>
      {record && (
        <p className="text-xs text-text-tertiary">
          Muốn đổi mã hoặc tên, cần xử lý bằng quy trình đổi định danh của Frappe.
        </p>
      )}
    </ReferenceCatalogEditorDialog>
  );
}
